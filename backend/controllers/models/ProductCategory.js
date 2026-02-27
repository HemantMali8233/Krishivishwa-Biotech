const mongoose = require('mongoose');

const productCategorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  description: { type: String },
  color: { 
    type: String, 
    default: '#10b981', // Default green color
    validate: {
      validator: function(v) {
        // Simple regex to validate hex color codes
        return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(v);
      },
      message: props => `${props.value} is not a valid hex color code!`
    }
  }
}, {
  timestamps: true,
});

const ProductCategory = mongoose.model('ProductCategory', productCategorySchema);

module.exports = ProductCategory;