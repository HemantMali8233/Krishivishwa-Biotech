const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false // ❗ keep false for old messages
    },

    name: { type: String, required: true, trim: true },
    email: { type: String, required: false, lowercase: true, trim: true },
    phone: { type: String, required: true },
    message: { type: String, required: true },

    category: {
      type: String,
      enum: ['contact us', 'write us', 'write to us'],
      required: true
    },

    status: {
      type: String,
      enum: ['unread', 'read'],
      default: 'unread'
    },
    date: { type: Date, default: Date.now },

    starred: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Message', messageSchema);
