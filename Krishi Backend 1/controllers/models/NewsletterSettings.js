const mongoose = require('mongoose');

const newsletterSettingsSchema = new mongoose.Schema({
  welcomeMessage: {
    type: String,
    required: true,
    default: "Welcome to our Agricultural Community! 🌾\n\nThank you for subscribing to our newsletter. Join our WhatsApp group to stay connected with fellow farmers and get instant updates on the latest agricultural innovations, weather alerts, and market insights.\n\nClick the link below to join our exclusive WhatsApp community:"
  },
  whatsappGroupLink: {
    type: String,
    required: true,
    default: "https://chat.whatsapp.com/your-group-link-here"
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('NewsletterSettings', newsletterSettingsSchema);
