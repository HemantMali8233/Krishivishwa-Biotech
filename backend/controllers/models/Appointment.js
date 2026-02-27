const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema({
  farmerName: { type: String, required: true, trim: true },
  date: { type: Date, required: true },
  time: { type: String, required: true, trim: true },
  status: { type: String, enum: ["Pending", "Approved", "Cancelled"], default: "Pending" },
  consultationType: { type: String, enum: ["Phone Call", "Field Visit"], required: true },
  location: { type: String, trim: true },
  mobile: { type: String, required: true, trim: true },
  email: { type: String, trim: true },
  farmSize: { type: String, trim: true },
  cropType: { type: String, trim: true },
  description: { type: String, trim: true },
  paymentStatus: { type: String, enum: ["Paid", "Pending", "Refunded"], default: "Pending" },

  // ✅ Add this field for logged-in user reference
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
}, { timestamps: true });

module.exports = mongoose.model("Appointment", appointmentSchema);
