const mongoose = require('mongoose');

const TimelineSchema = new mongoose.Schema({
  year: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  achievement: { type: String, required: true },
  metric: { type: String, required: true },
  highlight: { type: String, required: false },
  icon: { type: String, required: true },
  image: { type: String, required: true }, // URL
}, { timestamps: true });

module.exports = mongoose.model('Timeline', TimelineSchema);
