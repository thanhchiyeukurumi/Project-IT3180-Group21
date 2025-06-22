const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const householdSchema = new mongoose.Schema({
    head: { type: Schema.Types.ObjectId, ref: 'persons'},
    contact_phone: String,
    apartments: [{ type: Schema.Types.ObjectId, ref: 'apartments'}],
    members: [ { 
        member_id: { type: Schema.Types.ObjectId, ref: 'persons' },
        relation_to_head: String
    } ],
    motobikes: [
        {
          vehicle_type: String,
          plate: String
        }
      ],
      cars: [
        {
          vehicle_type: String,
          plate: String
        }
      ]
})

const household = mongoose.model("households", householdSchema);
module.exports = household;