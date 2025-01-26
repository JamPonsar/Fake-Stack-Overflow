// Comment Document Schema
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const CommentSchema = new Schema({
    
    comment_by: {
        type: String ,
        required: true
    },
    text:{
        type : String,
        required: true,
        maxLength: 140
    },
    votes:{
        type: Number,
        default: 0
    },
    comment_date_time:{
        type: Date,
        default: Date.now()
    },
    author_id: {type: Schema.Types.ObjectId, ref: "User" , required: true},
    url: String
    });

module.exports = mongoose.model("Comment", CommentSchema);

