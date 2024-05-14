const mongoose = require('mongoose');

const imageSchema = new mongoose.Schema({
    name: String,
    data: Buffer,
    contentType: String,
    userId: String,
});

const ImageModel = mongoose.model("Image", imageSchema);

module.exports = ImageModel;