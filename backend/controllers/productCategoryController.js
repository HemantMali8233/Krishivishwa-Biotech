const ProductCategory = require('../models/ProductCategory');

// Get all product categories
exports.getProductCategories = async (req, res) => {
  try {
    const categories = await ProductCategory.find().sort({ createdAt: -1 });
    const total = await ProductCategory.countDocuments();
    res.json({ categories, total });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch product categories', error: err.message });
  }
};

// Get single category by ID (optional)
exports.getProductCategoryById = async (req, res) => {
  try {
    const category = await ProductCategory.findById(req.params.id);
    if (!category) return res.status(404).json({ message: "Product category not found" });
    res.json(category);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch product category', error: err.message });
  }
};

// Create product category
exports.createProductCategory = async (req, res) => {
  try {
    const { name, description, color } = req.body;
    if (!name) return res.status(400).json({ message: "Name is required" });
    
    const category = new ProductCategory({ 
      name, 
      description,
      color: color || '#10b981' // Use provided color or default
    });
    
    await category.save();
    res.status(201).json(category);
  } catch (err) {
    res.status(400).json({ message: 'Failed to create product category', error: err.message });
  }
};

// Update product category
exports.updateProductCategory = async (req, res) => {
  try {
    const { name, description, color } = req.body;
    const category = await ProductCategory.findById(req.params.id);
    
    if (!category) return res.status(404).json({ message: "Product category not found" });
    
    if (name) category.name = name;
    if (description !== undefined) category.description = description;
    if (color) category.color = color;
    
    await category.save();
    res.json(category);
  } catch (err) {
    res.status(400).json({ message: 'Failed to update product category', error: err.message });
  }
};

// Delete product category
exports.deleteProductCategory = async (req, res) => {
  try {
    const category = await ProductCategory.findByIdAndDelete(req.params.id);
    if (!category) return res.status(404).json({ message: "Product category not found" });
    res.json({ message: "Product category deleted" });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete product category', error: err.message });
  }
};