const mongoose = require("mongoose");

const feeSchema = new mongoose.Schema({
  name: String,
  amount: Number,
  due: Number,
  status: String,
  household: [{ type: mongoose.Schema.Types.ObjectId, ref: 'household' }] 
});

const fee = mongoose.model("fees", feeSchema);
module.exports = fee;
