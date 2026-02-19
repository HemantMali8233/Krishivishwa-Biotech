const mongoose = require('mongoose');

const bannerSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500
  },
  image: {
    type: String,
    required: true
  },
  pageName: {
    type: String,
    required: true,
    enum: ['About us', 'Shop', 'Consultancy', 'Contact us', 'Gallery']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  order: {
    type: Number,
    default: 0
  },
  // NEW STYLING FIELDS
  titleColors: [{
    text: String,
    color: String
  }],
  descriptionColor: {
    type: String,
    default: '#ffffff'
  },
  alignment: {
    type: String,
    enum: ['left', 'center', 'right'],
    default: 'center'
  },
  titleStyle: {
    fontSize: {
      type: String,
      default: '3.5rem'
    },
    fontWeight: {
      type: String,
      default: '600'
    },
    textShadow: {
      type: String,
      default: '2px 2px 4px rgba(0,0,0,0.5)'
    }
  },
  descriptionStyle: {
    fontSize: {
      type: String,
      default: '1.2rem'
    },
    fontWeight: {
      type: String,
      default: '300'
    },
    textShadow: {
      type: String,
      default: '1px 1px 2px rgba(0,0,0,0.3)'
    }
  },
  useGradient: {
    type: Boolean,
    default: false
  },
  gradientColors: [{
    type: String,
    default: '#ffffff'
  }],
  gradientDirection: {
    type: String,
    default: '90deg'
  }
}, {
  timestamps: true
});

// Index for efficient querying
bannerSchema.index({ pageName: 1, isActive: 1, order: 1 });

module.exports = mongoose.model('Banner', bannerSchema);
