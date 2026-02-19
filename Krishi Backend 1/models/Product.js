const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    category: { type: String, required: true },
    price: { type: Number, required: true },
    stock: { type: Number, required: true },
    description: { type: String },
    use: { type: String },
    benefits: { type: String },
    applicationMethod: { type: String },
    image: { type: String }, // image filename or url
    sections: [{ type: String }], // product sections array
    featured: { type: Boolean, default: false },
    originalPrice: { type: Number },
    rating: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Product', productSchema);
