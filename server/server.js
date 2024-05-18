const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const dotenv = require("dotenv");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("./models/user.js");
const ws = require("ws");
const bodyParser = require('body-parser');
const Message = require("./models/message.js");
const Image = require('./models/image.js');
const fileUpload = require('express-fileupload');
const { ObjectId } = require("mongodb");
const About = require("./models/about.js");

dotenv.config();
mongoose.connect(process.env.ATLAS_URI);
const jwtSecretKey = process.env.JWT_SECRET_KEY;
const bcryptSalt = bcrypt.genSaltSync(10);

const app = express();

app.use(bodyParser.json({ limit: '16mb' }));

const port = process.env.PORT;
app.use(cors({
  credentials: true,
  origin: process.env.CLIENT_URL,
}));
app.use(cookieParser());
app.use(express.json());
app.use(require("./routes/record"));

app.get("/test", (req, res) => {
  res.json("test ok");
});

app.get("/profile", (req, res) => {
  const token = req.cookies?.token;
  if (token) {
    jwt.verify(token, jwtSecretKey, {}, (err, userData) => {
      if (err) throw err;
      res.json(userData);
    });
  } else {
    console.log("no token");
  }
});

app.post("/login", async (req, res) => {
  const {username, password} = req.body;
  const foundUser = await User.findOne({username});
  if (foundUser) {
    const isPass = bcrypt.compareSync(password, foundUser.password);
    if (isPass) {
      jwt.sign({userId: foundUser._id, username}, jwtSecretKey, {}, (err, token) => {
        res.cookie("token", token, {sameSite: "none", secure: true, maxAge: 36000000, path: "/", httpOnly: true}).json({
          id: foundUser._id,
        })
      });
    }
  }
});

app.post("/register", async (req, res) => {
  const {username, password, email} = req.body;
  console.log(email);
  try {
    const hashedPassword = bcrypt.hashSync(password, bcryptSalt);
    const createdUser = await User.create({username, password: hashedPassword, email});
    jwt.sign({userId: createdUser._id, username}, jwtSecretKey, {}, (err, token) => {
      if (err) throw err;
      res.cookie("token", token, {sameSite: "none", secure: true, maxAge: 36000000, domain: "mychatapp-frontend.onrender.com", path: "/", httpOnly: true}).status(201).json({
        id: createdUser._id,
      });
  });
  }
  catch (err) {
    if (err) throw err;
    res.status(500).json("error");
  }
});

//I should probably also at behind the query this: .limit(50) but we'll see if I manage to remember to do it along with the button.

app.post("/select", async (req, res) => {
  const selectedId = req.body.event;
  const myId = req.body.id;
  try {
    const foundMessages = await Message.find({$or : [{"recipient": selectedId, "sender" : myId}, {"recipient" : myId, "sender" : selectedId}]}).sort({"created_at" : 1});
    res.json(foundMessages);
      }
  catch (err) {
    console.log(err);
  }
});

app.use(fileUpload());

app.post("/logout", (req, res) => {
  res.clearCookie("token", {sameSite: "none", secure: true, domain: "mychatapp-frontend.onrender.com", path: "/", httpOnly: true});
  res.end();
});

app.post('/upload', async (req, res) => {
  if (!req.files || Object.keys(req.files).length === 0) {
    console.log("oopsies")
    res.status(400).send('No files were uploaded.');
  }

  console.log(req.body.userId);
  let uploadedFile = req.files.uploadedFile;

  try {
    const image = await Image.updateOne({userId: req.body.userId}, {name: uploadedFile.name, data: uploadedFile.data, contentType: uploadedFile.mimetype, userId: req.body.userId}, {upsert: true});
    res.status(200).send("Image uploaded successfully!")
    console.log("pls I beg...")
  }
  catch (err) {
    console.log(err);
  };
});

app.get('/image/:id', async (req, res) => {
  try {
    const file = await Image.findOne({"userId": req.params.id});
    if (!file || !file.data) {
      return res.status(404).send('Image not found');
    }
    res.contentType(file.contentType);
    res.send(file.data);
  } catch (error) {
    console.log(error);
    res.status(500).send('Server error');
  }
});

app.get("/conversations/:id", async (req, res) => {
  const id = req.params.id;
  try {
    const people = await User.find({"_id": {$ne: id}});
    res.json(people);
  } catch (error) {
    console.log(id);
    console.log(error);
    res.status(500).send("Sorry error :C");
  }
});

app.get("/images/:id", async (req, res) => {
  const id = req.params.id;
  try {
    const pictures = await Image.find({"_id": {$ne: id}});
    let sentPictures = [];
    pictures.forEach((picture, index) => {
      sentPictures[index] = {userId: picture.userId, data: picture.data.toString("base64"), picName: picture.name, type: picture.contentType}
    });
    res.json(sentPictures);
  } catch (error) {
    console.log();
    res.status(500).send("Sorry error :C");
  }
});

app.get("/pictures/:id", async (req, res) => {
  const id = req.params.id;
  try {
    console.log(id);
  } catch (error) {
    console.log(error);
  }
});

app.get("/name/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const user = await User.findById({"_id": id});
    res.status(200).json(user);
  } catch (error) {
    console.log(error);
  }
});

app.post("/about", async (req, res) => {
  try {
    await About.updateOne({userId: req.body.id}, {userId: req.body.id, work: req.body.workEdit, university: req.body.universityEdit, school: req.body.schoolEdit}, {upsert: true});
    res.status(200).json("ok");
  } catch (error) {
    console.log(error);
  }
});

app.get("/about/:id", async (req, res) => {
  try {
    const about = await About.findOne({userId: req.params.id});
    res.status(200).json(about);
  } catch (error) {
    console.log(error);
  }
});

const server = app.listen(port);

const wss = new ws.WebSocketServer({server});
wss.on("connection", (connection, req) => {

  function onlineNotifier () {
    [...wss.clients].forEach(client => {
      client.send(JSON.stringify({
        online: [...wss.clients].map(c => ({userId: c.userId, username: c.username}))
      }));
    });
  }

  connection.isAlive = true;

  connection.timer = setInterval(() => {
    connection.ping();
    connection.deathTimeout = setTimeout(() => {
      connection.isAlive = false;
      connection.terminate();
      onlineNotifier();
    }, 1000);
  }, 5000);

  connection.on("pong", () => {
    clearTimeout(connection.deathTimeout);
  });

  const cookies = req.headers.cookie;
  if (cookies) {
    const tokenCookieString = cookies.split(";").find(str => str.startsWith("token="));
    console.log(tokenCookieString);
    if (tokenCookieString) {
      const actualCookie = tokenCookieString.split("=")[1];
      jwt.verify(actualCookie, jwtSecretKey, {}, (err, userData) => {
        if (err) {
          throw err;
        }
        const {userId, username} = userData;
        connection.userId = userId;
        connection.username = username;
      });
    }
  }

  connection.on("message", async (message) => {
    const messageData = JSON.parse(message.toString());
    const {recipient, text} = messageData;
    if (recipient && text) {
      const messageDoc = await Message.create({
        sender: connection.userId,
        recipient,
        text,
      });
      [...wss.clients]
      .filter(c => c.userId === recipient)
      .forEach(c => c.send(JSON.stringify({
        text,
        sender: connection.userId,
        recipient,
        id: messageDoc._id,
        })));
    }
  });

  onlineNotifier();

});

wss.on("close", () => {
  console.log("disconnected");
});
