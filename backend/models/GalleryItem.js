const mongoose = require("mongoose");

const galleryItemSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  categoryId: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true },
  imageUrl: String,
  date: String
}, { timestamps: true });

module.exports = mongoose.model("GalleryItem", galleryItemSchema);
