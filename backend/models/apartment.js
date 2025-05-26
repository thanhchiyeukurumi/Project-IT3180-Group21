const mongoose = require("mongoose");

const apartmentSchema = new mongoose.Schema({
    household: { type: mongoose.Schema.Types.ObjectId, ref: 'households', default: null },
    number: Number,
    type: String,
    totalArea: Number
})

const apartment = mongoose.model("apartments", apartmentSchema);
module.exports = apartment;