const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const vehicleSchema = new mongoose.Schema({
    ownName: {type : String, require:true},
    household_id:{ type: Schema.Types.ObjectId, ref: 'households'},
    vehicle: [{
        plate: String,
        vehicle_type: String
    }]
})

const vehicle = mongoose.model("vehicles", vehicleSchema);
module.exports=vehicle;