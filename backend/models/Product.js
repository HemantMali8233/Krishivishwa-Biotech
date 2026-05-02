const mongoose = require('mongoose');

const productVariantSchema = new mongoose.Schema(
  {
    quantityValue: { type: Number, required: true },
    quantityUnit: { type: String, required: true },
    price: { type: Number, required: true },
    originalPrice: { type: Number },
    stock: { type: Number, required: true },
    image: { type: String, default: '' },
  },
  { _id: false }
);

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
    image: { type: String },
    variants: { type: [productVariantSchema], default: undefined },
    sections: [{ type: String }],
    featured: { type: Boolean, default: false },
    originalPrice: { type: Number },
    rating: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Product', productSchema);
