const Category = require("../models/Category");
const GalleryItem = require("../models/GalleryItem");

exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.find({});
    const counts = await GalleryItem.aggregate([
      { $group: { _id: "$categoryId", count: { $sum: 1 } } }
    ]);
    const categoriesWithCount = categories.map(cat => {
      const found = counts.find(c => String(c._id) === String(cat._id));
      return { ...cat.toObject(), itemCount: found ? found.count : 0 };
    });
    res.json(categoriesWithCount);
  } catch {
    res.status(500).json({ message: "Failed to fetch categories" });
  }
};

exports.createCategory = async (req, res) => {
  try {
    const { name, color } = req.body;
    const newCat = new Category({ name, color });
    await newCat.save();
    res.status(201).json({ ...newCat.toObject(), itemCount: 0 });
  } catch {
    res.status(400).json({ message: "Failed to create category" });
  }
};

exports.updateCategory = async (req, res) => {
  try {
    const { name, color } = req.body;
    const updated = await Category.findByIdAndUpdate(
      req.params.id,
      { name, color },
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: "Category not found" });
    const count = await GalleryItem.countDocuments({ categoryId: updated._id });
    res.json({ ...updated.toObject(), itemCount: count });
  } catch {
    res.status(400).json({ message: "Failed to update category" });
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    const deleted = await Category.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Category not found" });
    await GalleryItem.deleteMany({ categoryId: deleted._id });
    res.json({ message: "Category and its items deleted" });
  } catch {
    res.status(500).json({ message: "Failed to delete category" });
  }
};
