const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const PostSchema = new Schema({
    title: {
        type : String,
        required: true
    },
    body: {
        type: String,
        required: true
    },
    images: [{
        filename: String,
        filepath: String,
        mimetype: String,
        size: Number,
        uploadedAt: {
            type: Date,
            default: Date.now
        }
    }],
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    },

});

module.exports = mongoose.model('Post', PostSchema);
