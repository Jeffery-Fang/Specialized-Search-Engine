const mongoose = require("mongoose");
const Schema = mongoose.Schema;

let pageSchema = new Schema({
    url: {
        type: String,
        required: [true, "A page needs a url"]
    },
    title: {
        type: String,
        required: [true, "A page needs a title"]
    },
    content: {
        type: String,
        required: [true, "All pages need some content"]
    },
    id: {
        type: Number
    },
    pr: {
        type: Number
    },
    wordFrequency: {
        type: Object
    }
},{collection: 'FPages'});

module.exports = mongoose.model("FPage", pageSchema);

