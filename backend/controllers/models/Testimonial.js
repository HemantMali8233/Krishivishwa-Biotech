const mongoose = require("mongoose");

const testimonialSchema = new mongoose.Schema({
     messageId: { type: mongoose.Schema.Types.ObjectId, ref: "Message" }, // link to original message
  name: { type: String, required: true },
  quote: { type: String, required: true },
  date: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Testimonial", testimonialSchema);
