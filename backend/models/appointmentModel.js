const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  age: { type: Number, required: true },
  phone: { type: String, required: true },
  address: { type: String, required: true },
  department: { type: String, required: true },
  date: { type: String, required: true },
  slot: { type: String, required: true },
  ticketId: { type: String, unique: true, required: true },
  qr_svg: { type: String, required: true },
});

module.exports = mongoose.model("Appointment", appointmentSchema);
