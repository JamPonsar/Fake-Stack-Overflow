// User Document Schema
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const bcrypt = require('bcrypt');
const saltRounds = 10;

const UserSchema = new Schema({
    username: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
    }, 
    register_date: {
        type: Date,
        default: Date.now()
    },
    reputation:{
        type: Number,
        default: 0
    },
    admin: {
        type: Boolean,
        default: false
    },
    url: String
    });


UserSchema.pre('save', function (next) {
    var user = this;
    if (user.isModified('password')) {
        bcrypt.genSalt(saltRounds, function (err, salt) {
            if (err) { return next(err) };
            bcrypt.hash(user.password, salt, function (err, hash) {
                if (err) { return next(err) };
                user.password = hash;
                next();
            })
        })
    } else {
        next();
    };
});


module.exports = mongoose.model("User", UserSchema);