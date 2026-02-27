const mongoose = require('mongoose');

const productSectionSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  color: { type: String, required: true, default: "#10b981" },
  icon: { type: String, required: true }, // Store React icon component name
  description: { type: String },
  id: { type: String, required: true, unique: true } // Add this field to match frontend
}, {
  timestamps: true,
});

// Add pre-save hook to ensure id is set
productSectionSchema.pre('save', function(next) {
  if (!this.id) {
    this.id = this.name.toLowerCase().replace(/\s+/g, '-');
  }
  next();
});

const ProductSection = mongoose.model('ProductSection', productSectionSchema);

module.exports = ProductSection;