const Testimonial = require("../models/Testimonial");

// Create testimonial from message
exports.createTestimonial = async (req, res) => {
  try {
    const { name, quote, messageId } = req.body;  // extract correct fields

    if (!name || !quote || !messageId) {
      return res.status(400).json({ message: "name, quote and messageId are required" });
    }

    const newTestimonial = new Testimonial({
      name,
      quote,
      messageId,
    });

    await newTestimonial.save();

    res.status(201).json(newTestimonial);
  } catch (err) {
    res.status(500).json({ message: "Failed to add testimonial", error: err.message });
  }
};

// Get all testimonials
exports.getTestimonials = async (req, res) => {
  try {
    const testimonials = await Testimonial.find().sort({ date: -1 });
    res.json(testimonials);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch testimonials", error: err.message });
  }
};

exports.removeByMessageId = async (req, res) => {
  try {
    const { id } = req.params;
    await Testimonial.deleteOne({ messageId: id });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: "Failed to remove testimonial", error: err.message });
  }
};

