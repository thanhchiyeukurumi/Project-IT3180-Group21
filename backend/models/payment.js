const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({
  fee_id: { type: String, required: true },
  payment_name: { type: String} ,
  payment_id: { type: String, required: true, minlength: 8, maxlength: 8 },
  bill_id: { type: String, minlength: 8, maxlength: 8 },
  household_id: { type: String, required: true },
  amount: { type: Number, required: true },  
  payment_date: { type: Date, required: true },
  bill_time: { type: Date },  
  status: { type: String, required: true },
  count: Number  
});

const Payment = mongoose.model("payments", paymentSchema);
module.exports = Payment;