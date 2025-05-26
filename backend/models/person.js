const mongoose = require("mongoose");

const personSchema = new mongoose.Schema({
    householdId: { type: mongoose.Schema.Types.ObjectId, ref: 'households', default: null },
    name: String,
    cic: String,
    dob: Date,
    gender: String,
    status: String,
    ethnicity: String,
    nation: String,
    hometown: String,
    movingIn: Date,
    endTemporary: Date,
    contact_phone: String,
    occupation: String
})

const person = mongoose.model("persons", personSchema);
module.exports=person;