import "./chat.css"
import React, {useContext, useEffect, useRef, useState} from "react";
import axios from "axios";
import { UserContext } from "./userContext";
import { Link, Navigate, useParams } from "react-router-dom";

const Chat = () => {
    const [ws, setWs] = useState(null);
    const [peopleOnline, setPeopleOnline] = useState({});
    const [selectedPerson, setSelectedPerson] = useState(null);
    const {id} = useContext(UserContext);
    const [newMessageText, setNewMessageText] = useState("");
    const [messages, setMessages] = useState([]);
    const [seeMenu, setSeeMenu] = useState(false);
    const [allPeople, setAllPeople] = useState({});
    const [imageUrl, setImageUrl] = useState("");
    const [imagesUrl, setImagesUrl] = useState({});
    const [search, setSearch] = useState("");
    const [matchedPeople, setMatchedPeople] = useState([]);
    const [searchVisibility, setSearchVisibility] = useState(false);
    const bottomRef = useRef(null);
    const divRef = useRef();
    const otherDivRef = useRef();
    const searchDivRef = useRef();
    const otherSearchDivRef = useRef();

    useEffect(() => {
        function handleClickOutside(event) {
        if (divRef.current && !divRef.current.contains(event.target)
                && otherDivRef.current && !otherDivRef.current.contains(event.target)) {
            setSeeMenu(false);
        }
    }

    document.addEventListener('mousedown', handleClickOutside);
        return () => {
    document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [divRef]);

    useEffect(() => {
        function handleClickOutsideSearch(event) {
        if (searchDivRef.current && !searchDivRef.current.contains(event.target)
                && otherSearchDivRef.current && !otherSearchDivRef.current.contains(event.target)) {
            setSearchVisibility(false);
        }
    }

    document.addEventListener('mousedown', handleClickOutsideSearch);
        return () => {
        document.removeEventListener('mousedown', handleClickOutsideSearch);
        };
    }, [searchDivRef]);

    useEffect(() => {
        const ws = new WebSocket(process.env.REACT_APP_WS_URL);
        setWs(ws);
        ws.addEventListener("message", handleMessage)
    }, []);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({behavipr: "smooth" });
    }, [messages]);

    useEffect(() => {
        const fetchConversations = async () => {
            try {
                const conversations = {};
                const response = await axios.get(`/conversations/${id}`);
                response.data.forEach(({_id, username}) => {
                    conversations[_id] = username;
                });
                setAllPeople(conversations);
            } catch (error) {
                console.error(error);
            }
        };

        fetchConversations();
    }, [id]);

    // For the record I have two different functions for fetching images only because I made the first one with a blob
    // and the other one with base64 bcs it kept changing my array of picture objects into a single blob
    // and to be quite honest I was happy it was working so I didnt change the first one and adjust the other one...

    useEffect(() => {
        const fetchProfilePic = async () => {
          try {
            const response = await axios.get(`/image/${id}`, { responseType: 'blob' });
            const imageBlob = response.data;
            const imageObjectURL = URL.createObjectURL(imageBlob);
            setImageUrl(imageObjectURL);
          } catch (error) {
            console.error('Error fetching image:', error);
          }
        };
    
        fetchProfilePic();
      }, [id]);

    useEffect(() => {
        const fetchProfilePics = async () => {
          try {
            const pictures = {}
            const response = await axios.get(`/images/${id}`);
            response.data.forEach((picture) => {
                pictures[picture.userId] = picture
            });
            setImagesUrl(pictures)
          } catch (error) {
            console.error('Error fetching image:', error);
          }
        };
    
        fetchProfilePics();
    }, [id, allPeople]);

    function showOnlinePeople (peopleArray) {
        const people = {};
        peopleArray.forEach(({userId, username}) => {
            people[userId] = username;
        });
        setPeopleOnline(people);
    }

    const peopleWithoutUser = {...allPeople};
    delete peopleWithoutUser[id];

    function handleMessage (e) {
        const messageData = JSON.parse(e.data);
        if ("online" in messageData) {
            showOnlinePeople(messageData.online);
        } else {
            console.log(messageData);
            setMessages(prev => ([...prev, {...messageData}]));
        }
    }

    const messagesWithoutDuplicates = [...new Set(messages.map(JSON.stringify))].map(JSON.parse);

    function sendMessage (event) {
        event.preventDefault();
        ws.send(JSON.stringify({
            recipient: selectedPerson,
            text: newMessageText,
        }));
        setMessages(prev => ([...prev, {text: newMessageText,
            sender: id,
            recipient: selectedPerson
            }]));
        setNewMessageText("");
    }

    async function setConversation (event) {
        setSelectedPerson(event);
        setMessages([]);
        const {data} = await axios.post("select", {event, id});
        data.map(message => setMessages(prev => ([...prev, {...message}])));
    }

    async function clearCookies () {
        try {
            await axios.post("logout");
            console.log("Successfully logged out!");
        }
        catch (err) {
            console.log(err);
        }
    }

    useEffect(() => {
        function searchFunction () {
            let foundPeople = [];
    
            Object.values(allPeople).forEach(name => {
                if(name.match(new RegExp(`^${search}\\w`, "i"))) {
                    foundPeople.push(name);
                    setMatchedPeople(foundPeople);
                }
            });
        }
        searchFunction()
    }, [search, allPeople]);

    function fiddleWithSearch () {
        setSearchVisibility(true);
    };

    const currentUrl = useParams().id;

    if (id == null) {
        return <Navigate to="/"></Navigate>
    }

    if (id !== currentUrl) {
        return <Navigate to={`/${id}`}></Navigate>
    }

    return (
        <div className="main-container">
            <div className="user-box main-part">
                <div className="box-header">
                </div>
                <div ref={otherDivRef} onClick={() => setSeeMenu(!seeMenu)} className="user-div">{imageUrl ?
                <img src={imageUrl} alt="uploaded"></img>
                :
                <img src="https://cdn-icons-png.flaticon.com/128/1144/1144760.png" alt="profile-icon"></img>}
                </div>
                {seeMenu === true ?
                <div className="user-menu" ref={divRef}>
                    <Link to={`/profile/${id}`} className="user-menu-member">
                        <img src="https://cdn-icons-png.flaticon.com/128/1144/1144760.png" alt="profile-icon"></img>
                        <p>Show Profile</p>
                    </Link>
                    <Link to={"../"} className="user-menu-member" onClick={() => clearCookies()}>
                        <img src="https://cdn-icons-png.flaticon.com/128/1828/1828427.png" alt="logout-icon"></img>
                        <p>Log Out!</p>
                    </Link>
                </div>
                :
                <div></div>
                }
            </div>
            <div className="chats-box main-part">
                <div className="box-header">
                    <p>Chats</p>
                    <input className="search-bar" ref={searchDivRef} value={search} onClick={fiddleWithSearch} onChange={(event) => setSearch(event.target.value)} placeholder="search..."></input>
                    {searchVisibility ?
                    <div className="search-results" ref={otherSearchDivRef}>{matchedPeople.map(username => (<div key={username} onClick={() => setConversation(Object.keys(allPeople).find(id => allPeople[id] === username))} className="search-member">{username}</div>))}</div> :
                    <div></div>}
                </div>
                <div className="chats">
                    <div className="chat-box">{Object.keys(peopleWithoutUser).map(userId => (
                        <div key={userId} onClick={() => setConversation(userId)} className={"conversation-div " + (userId === selectedPerson ? "selected-background" : "")}>
                            <div
                                className={"" + (Object.values(peopleOnline).includes(allPeople[userId]) ? "online-indicator" : "offline-indicator")}>
                            </div>
                        {Object.keys(imagesUrl).includes(userId) ?
                        <img
                            className="profile-pic"
                            src={`data:${imagesUrl[userId].type};base64,${imagesUrl[userId].data}`}
                            alt={imagesUrl[userId].name}>
                        </img> :
                        <img
                            className="profile-pic"
                            src="https://cdn-icons-png.flaticon.com/128/1144/1144760.png"
                            alt="profile-pic">
                        </img>}
                            <div className="person-descriptor">{allPeople[userId]}</div>
                        </div>
                        ))}
                    </div>
                </div>
            </div>
            {selectedPerson ?
            <div className="selected-chat-box main-part">
                <div className="box-header">
                    <Link to={`/profile/${selectedPerson}`} className="inner-header">
                    {Object.keys(imagesUrl).includes(selectedPerson) ?
                    <img
                            className="selected-person-pic"
                            src={`data:${imagesUrl[selectedPerson].type};base64,${imagesUrl[selectedPerson].data}`}
                            alt={imagesUrl[selectedPerson].name}>
                    </img> :
                    <img
                        className="selected-person-pic"
                        src="https://cdn-icons-png.flaticon.com/128/1144/1144760.png"
                        alt="profile-icon">
                    </img>}
                    <p className="person-descriptor">{allPeople[selectedPerson]}</p>
                    </Link>
                </div>
                <div className="texts">{messagesWithoutDuplicates.map((message, index) => (
                    <div key={index} className={"message " + (message.sender === id ? "sent-message" : "received-message")}>{message.text}</div>
                ))}
                <div ref={bottomRef}></div>
                </div>
                <form className="text-send" onSubmit={sendMessage}>
                    <input
                        value={newMessageText}
                        onChange={e => setNewMessageText(e.target.value)}
                        type="text"
                        placeholder="Aa"
                        className="text-input">
                    </input>
                    <button className="send-button" type="submit">
                        <img src="https://cdn-icons-png.flaticon.com/512/3682/3682321.png" alt="send-button"></img>
                    </button>
                </form>
            </div>
            :
            <div className="not-selected-chat-box main-part">
            </div>
            }
            
        </div>
    )
}

export default Chat
