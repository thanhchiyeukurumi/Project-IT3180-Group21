const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    username: String,
    password: String,
    fullname: String,
    email: String,
    dob: Date,
    contact_phone: String,
    address: String
})

const user = mongoose.model("users", userSchema);
module.exports=user;