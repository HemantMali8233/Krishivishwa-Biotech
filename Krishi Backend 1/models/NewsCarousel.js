const mongoose = require('mongoose');

const newsCarouselSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  excerpt: {
    type: String,
    required: true,
    trim: true
  },
  image: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    trim: true
  },
  icon: {
    type: String,
    default: '🚜'
  },
  likes: {
    type: Number,
    default: 0
  },
  uploadDate: {
    type: Date,
    default: Date.now
  },
  stats: [{
    value: {
      type: String,
      required: true
    },
    label: {
      type: String,
      required: true
    }
  }],
  features: [{
    label: {
      type: String,
      required: true
    },
    icon: {
      type: String,
      required: true
    }
  }],
  active: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('NewsCarousel', newsCarouselSchema);
