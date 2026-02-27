const mongoose = require('mongoose');

const newsletterSchema = new mongoose.Schema({
  email: {
    type: String,
    sparse: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  phone: {
    type: String,
    sparse: true,
    trim: true,
    match: [/^[\+]?[1-9][\d]{0,15}$/, 'Please enter a valid phone number']
  },
  contactType: {
    type: String,
    enum: ['email', 'phone'],
    required: true
  },
  contactValue: {
    type: String,
    required: true,
    trim: true
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  },
  subscribedAt: {
    type: Date,
    default: Date.now
  },
  welcomeMessageSent: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

newsletterSchema.index({ contactValue: 1, contactType: 1 }, { unique: true });

module.exports = mongoose.model('Newsletter', newsletterSchema);
