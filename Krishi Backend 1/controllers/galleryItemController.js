const GalleryItem = require("../models/GalleryItem");

exports.getGalleryItems = async (req, res) => {
  try {
    const items = await GalleryItem.find({});
    res.json(items);
  } catch {
    res.status(500).json({ message: "Failed to fetch gallery items" });
  }
};

exports.createGalleryItem = async (req, res) => {
  try {
    const data = req.body;
    const newItem = new GalleryItem(data);
    await newItem.save();
    res.status(201).json(newItem);
  } catch {
    res.status(400).json({ message: "Failed to create gallery item" });
  }
};

exports.updateGalleryItem = async (req, res) => {
  try {
    const updated = await GalleryItem.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: "Gallery item not found" });
    res.json(updated);
  } catch {
    res.status(400).json({ message: "Failed to update gallery item" });
  }
};

exports.deleteGalleryItem = async (req, res) => {
  try {
    const deleted = await GalleryItem.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Gallery item not found" });
    res.json({ message: "Gallery item deleted" });
  } catch {
    res.status(500).json({ message: "Failed to delete gallery item" });
  }
};
