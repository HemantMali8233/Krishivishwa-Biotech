const Product = require('../models/Product');
const fs = require('fs');
const path = require('path');
const PRODUCT_SECTIONS = ['new-arrivals', 'best-sellers', 'top-rated'];

// Helper to delete image file
const removeImageFile = (imagePath) => {
  if (imagePath && imagePath.startsWith('/uploads/')) {
    // Only delete local files, not external URLs
    const absolutePath = path.join(__dirname, "..", imagePath);
    if (fs.existsSync(absolutePath)) fs.unlinkSync(absolutePath);
  }
};

// GET all products with filters
exports.getProducts = async (req, res) => {
  try {
    const { page = 1, limit = 100, search = '', category, section } = req.query;
    const query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
      ];
    }
    if (category) query.category = category;
    if (section && PRODUCT_SECTIONS.includes(section)) {
      query.sections = section;
      // or: query.sections = { $in: [section] };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const products = await Product.find(query)
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Product.countDocuments(query);

    res.json({ products, total });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product)
      return res.status(404).json({ message: 'Product not found' });
    return res.json(product);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// CREATE product
exports.createProduct = async (req, res) => {
  try {
    const {
      name, category, price, stock, description,
      use, benefits, applicationMethod, sections, featured, originalPrice, rating
    } = req.body;
    // Parse sections input
    let sectionArr = [];
    if (typeof sections === "string") {
      sectionArr = sections.split(",").map(s => s.trim());
    } else if (Array.isArray(sections)) {
      sectionArr = sections;
    }
    // Handle image
    let image = '';
    if (req.file) {
      image = `/uploads/products/${req.file.filename}`;
    } else if (req.body.image) {
      image = req.body.image;
    }
    const product = new Product({
      name,
      category,
      price,
      stock,
      description,
      use,
      benefits,
      applicationMethod,
      image,
      sections: sectionArr,
      featured,
      originalPrice,
      rating
    });

    await product.save();
    return res.status(201).json(product);
  } catch (err) {
    res.status(400).json({ message: 'Invalid data', error: err.message });
  }
};

// UPDATE product, remove old image if new uploaded
exports.updateProduct = async (req, res) => {
  try {
    const {
      name, category, price, stock, description,
      use, benefits, applicationMethod, sections, featured, originalPrice, rating
    } = req.body;
    const product = await Product.findById(req.params.id);
    if (!product)
      return res.status(404).json({ message: 'Product not found' });

    product.name = name || product.name;
    product.category = category || product.category;
    product.price = price ?? product.price;
    product.stock = stock ?? product.stock;
    product.description = description || product.description;
    product.use = use || product.use;
    product.benefits = benefits || product.benefits;
    product.applicationMethod = applicationMethod || product.applicationMethod;

    // If new image uploaded, delete old one and update path
    if (req.file) {
      if (product.image && product.image.startsWith('/uploads/')) {
        removeImageFile(product.image);
      }
      product.image = `/uploads/products/${req.file.filename}`;
    } else if (req.body.image) {
      product.image = req.body.image;
    }

    // Handle sections
    if (typeof sections === "string") {
      product.sections = sections.split(",").map(s => s.trim());
    } else if (Array.isArray(sections)) {
      product.sections = sections;
    }

    product.featured = featured ?? product.featured;
    product.originalPrice = originalPrice ?? product.originalPrice;
    product.rating = rating ?? product.rating;

    await product.save();
    return res.json(product);
  } catch (err) {
    res.status(400).json({ message: 'Update failed', error: err.message });
  }
};

// DELETE product and image file
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product)
      return res.status(404).json({ message: 'Product not found' });
    // Also delete file
    if (product.image && product.image.startsWith('/uploads/')) {
      removeImageFile(product.image);
    }
    return res.json({ message: 'Product deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Delete failed', error: err.message });
  }
};
