const ProductSection = require('../models/ProductSection');

// List all product sections
exports.getProductSections = async (req, res) => {
  try {
    const sections = await ProductSection.find().sort({ createdAt: -1 });
    const total = await ProductSection.countDocuments();
    res.json({ sections, total });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch sections', error: err.message });
  }
};

// Get one section by ID
exports.getProductSection = async (req, res) => {
  try {
    const section = await ProductSection.findById(req.params.id);
    if (!section) return res.status(404).json({ message: 'Section not found' });
    res.json(section);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch section', error: err.message });
  }
};

// Create a section
exports.createProductSection = async (req, res) => {
  try {
    const { name, color, icon, description } = req.body;
    if (!name) return res.status(400).json({ message: 'Name is required' });
    const section = new ProductSection({ name, color, icon, description });
    await section.save();
    res.status(201).json(section);
  } catch (err) {
    res.status(400).json({ message: 'Failed to create section', error: err.message });
  }
};

// Update a section
exports.updateProductSection = async (req, res) => {
  try {
    const { name, color, icon, description } = req.body;
    const section = await ProductSection.findById(req.params.id);
    if (!section) return res.status(404).json({ message: 'Section not found' });
    if (name) section.name = name;
    if (color !== undefined) section.color = color;
    if (icon !== undefined) section.icon = icon;
    if (description !== undefined) section.description = description;
    await section.save();
    res.json(section);
  } catch (err) {
    res.status(400).json({ message: 'Failed to update section', error: err.message });
  }
};

// Delete a section
exports.deleteProductSection = async (req, res) => {
  try {
    const section = await ProductSection.findByIdAndDelete(req.params.id);
    if (!section) return res.status(404).json({ message: 'Section not found' });
    res.json({ message: 'Section deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete section', error: err.message });
  }
};
