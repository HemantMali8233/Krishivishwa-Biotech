const mongoose = require('mongoose');

const marqueeSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
    trim: true
  },
  active: {
    type: Boolean,
    default: true
  },
  order: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Marquee', marqueeSchema);
