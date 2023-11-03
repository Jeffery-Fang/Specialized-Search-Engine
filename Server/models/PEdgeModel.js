const mongoose = require("mongoose");
const Schema = mongoose.Schema;

let edgeSchema = new Schema({
    from: {
        type: String,
        required: [true, "All edges need to come from a page"]
    },
    to: {
        type: String,
        required: [true, "All edges need to go to a page"]
    }
},{collection: 'PEdges'});

module.exports = mongoose.model("PEdge", edgeSchema);
