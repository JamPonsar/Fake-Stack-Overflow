// Answer Document Schema
var mongoose = require("mongoose");

var Schema = mongoose.Schema

var AnswerSchema = new Schema({
    text: {
        type: String,
        required: true
    },
    ans_by: {
        type: String,
        required: true
    },
    ans_date_time: {
        type: Date,
        default: Date.now()
    },
    votes: {
        type: Number,
        default: 0
    },
    comments: [{type: Schema.Types.ObjectId, ref: "Comment" }],
    author_id: {type: Schema.Types.ObjectId, ref: "User" , required: true},
    url: String
});

module.exports = mongoose.model("Answer", AnswerSchema);