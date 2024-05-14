const mongoose = require('mongoose');

const aboutSchema = new mongoose.Schema({
    userId: String,
    work: String,
    university: String,
    school: String,
});

const aboutModel = mongoose.model("About", aboutSchema);

module.exports = aboutModel;