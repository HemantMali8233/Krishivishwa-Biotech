const Product = require('../models/Product');
const fs = require('fs');
const path = require('path');
const PRODUCT_SECTIONS = ['new-arrivals', 'best-sellers', 'top-rated'];

const removeImageFile = (imagePath) => {
  if (imagePath && imagePath.startsWith('/uploads/')) {
    const absolutePath = path.join(__dirname, "..", imagePath);
    if (fs.existsSync(absolutePath)) fs.unlinkSync(absolutePath);
  }
};

const collectProductImagePaths = (product) => {
  const paths = [];
  if (product?.image) paths.push(product.image);
  if (product?.variants?.length) {
    product.variants.forEach((v) => {
      if (v.image) paths.push(v.image);
    });
  }
  return paths;
};

const variantQuantitySortKey = (v) => {
  const n = Number(v.quantityValue) || 0;
  const u = String(v.quantityUnit || 'ml');
  if (u === 'L') return n * 1000;
  if (u === 'ml') return n;
  if (u === 'kg') return n * 1000000;
  if (u === 'g') return n * 1000;
  return n;
};

const sortVariantsByQuantityDesc = (variants) => {
  if (!variants?.length) return [];
  return [...variants].sort((a, b) => variantQuantitySortKey(b) - variantQuantitySortKey(a));
};

const syncTopLevelFromVariants = (variants) => {
  if (!variants || !variants.length) {
    return { price: 0, stock: 0, image: '', originalPrice: undefined };
  }
  const sorted = sortVariantsByQuantityDesc(variants);
  const price = Math.min(...sorted.map((v) => v.price));
  const stock = sorted.reduce((sum, v) => sum + (Number(v.stock) || 0), 0);
  const image = sorted[0].image || '';
  const originalPrice =
    sorted[0].originalPrice != null && !Number.isNaN(Number(sorted[0].originalPrice))
      ? Number(sorted[0].originalPrice)
      : undefined;
  return { price, stock, image, originalPrice };
};

const parseVariantsPayload = (body, files, previousVariants = []) => {
  let raw = body.variants;
  if (!raw) return [];
  let arr;
  try {
    arr = typeof raw === 'string' ? JSON.parse(raw) : raw;
  } catch {
    return [];
  }
  if (!Array.isArray(arr)) return [];

  const prevByIdentity = (v) =>
    previousVariants.find(
      (p) =>
        Number(p.quantityValue) === Number(v.quantityValue) &&
        String((p.quantityUnit || '')).trim() === String((v.quantityUnit || '')).trim()
    );

  return arr.map((v, i) => {
    const uploaded = files?.[`variantImage_${i}`]?.[0];
    let image = typeof v.image === 'string' ? v.image.trim() : '';
    if (uploaded) {
      image = `/uploads/products/${uploaded.filename}`;
    } else if (!image) {
      const prevMatch = prevByIdentity(v);
      if (prevMatch?.image) image = prevMatch.image;
    }
    const op =
      v.originalPrice !== '' &&
      v.originalPrice !== undefined &&
      v.originalPrice !== null &&
      !Number.isNaN(Number(v.originalPrice))
        ? Number(v.originalPrice)
        : undefined;
    return {
      quantityValue: Number(v.quantityValue),
      quantityUnit: String(v.quantityUnit || 'ml').trim(),
      price: Number(v.price),
      originalPrice: op,
      stock: Number(v.stock),
      image,
    };
  }).filter(
    (row) =>
      row.quantityValue > 0 &&
      row.quantityUnit &&
      !Number.isNaN(row.price) &&
      row.price >= 0 &&
      !Number.isNaN(row.stock) &&
      row.stock >= 0
  );
};

/** MRP / originalPrice must not be below selling price when set */
const validateVariantPricing = (variants) => {
  for (let i = 0; i < variants.length; i++) {
    const v = variants[i];
    const sale = Number(v.price);
    if (v.originalPrice == null || Number.isNaN(Number(v.originalPrice))) continue;
    const mrp = Number(v.originalPrice);
    if (mrp >= 0 && sale >= 0 && mrp < sale) {
      return `Variant ${i + 1}: MRP must be greater than or equal to selling price (₹${sale}).`;
    }
  }
  return null;
};

const variantIdentityKey = (v) =>
  `${Number(v.quantityValue)}__${String(v.quantityUnit || '').trim()}`;

const removeReplacedVariantImages = (oldVariants, newVariants, newlyUploadedIndices) => {
  if (!oldVariants?.length) return;
  const findOldVariant = (nv) =>
    oldVariants.find((p) => variantIdentityKey(p) === variantIdentityKey(nv));

  newVariants.forEach((nv, i) => {
    if (!newlyUploadedIndices.has(i)) return;
    const ov = findOldVariant(nv);
    const oldImg = ov?.image;
    if (!oldImg?.startsWith('/uploads/')) return;
    if (oldImg !== nv.image) removeImageFile(oldImg);
  });

  if (newVariants.length < oldVariants.length) {
    const kept = new Set(newVariants.map((nv) => variantIdentityKey(nv)));
    oldVariants.forEach((ov) => {
      if (!kept.has(variantIdentityKey(ov)) && ov.image?.startsWith('/uploads/')) {
        removeImageFile(ov.image);
      }
    });
  }
};

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
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const raw = await Product.find(query)
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 })
      .lean();

    const products = raw.map((p) => ({
      ...p,
      variants: p.variants?.length ? sortVariantsByQuantityDesc(p.variants) : p.variants,
    }));

    const total = await Product.countDocuments(query);

    res.json({ products, total });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).lean();
    if (!product)
      return res.status(404).json({ message: 'Product not found' });
    if (product.variants?.length) {
      product.variants = sortVariantsByQuantityDesc(product.variants);
    }
    return res.json(product);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.createProduct = async (req, res) => {
  try {
    const {
      name, category, description,
      use, benefits, applicationMethod, sections, featured, rating
    } = req.body;

    let variants = parseVariantsPayload(req.body, req.files, []);

    if (!variants.length) {
      return res.status(400).json({ message: 'Add at least one size with price, stock, and image' });
    }

    const missingImage = variants.some((v) => !v.image);
    if (missingImage) {
      return res.status(400).json({ message: 'Each size must have an image' });
    }

    const pricingErr = validateVariantPricing(variants);
    if (pricingErr) {
      return res.status(400).json({ message: pricingErr });
    }

    variants = sortVariantsByQuantityDesc(variants);

    const { price, stock, image, originalPrice } = syncTopLevelFromVariants(variants);

    let sectionArr = [];
    if (typeof sections === "string") {
      sectionArr = sections.split(",").map(s => s.trim()).filter(Boolean);
    } else if (Array.isArray(sections)) {
      sectionArr = sections;
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
      variants,
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

exports.updateProduct = async (req, res) => {
  try {
    const {
      name, category, description,
      use, benefits, applicationMethod, sections, featured, rating
    } = req.body;
    const product = await Product.findById(req.params.id);
    if (!product)
      return res.status(404).json({ message: 'Product not found' });

    const newlyUploaded = new Set();
    if (req.files && typeof req.files === 'object') {
      Object.keys(req.files).forEach((k) => {
        const m = /^variantImage_(\d+)$/.exec(k);
        if (m) newlyUploaded.add(Number(m[1]));
      });
    }

    const prevVariants = product.variants?.length ? [...product.variants] : [];
    let variants = parseVariantsPayload(req.body, req.files, prevVariants);

    if (!variants.length) {
      return res.status(400).json({ message: 'Add at least one size with price, stock, and image' });
    }

    const missingImage = variants.some((v) => !v.image);
    if (missingImage) {
      return res.status(400).json({ message: 'Each size must have an image' });
    }

    const pricingErrUpdate = validateVariantPricing(variants);
    if (pricingErrUpdate) {
      return res.status(400).json({ message: pricingErrUpdate });
    }

    removeReplacedVariantImages(prevVariants, variants, newlyUploaded);

    variants = sortVariantsByQuantityDesc(variants);

    const { price, stock, image, originalPrice } = syncTopLevelFromVariants(variants);

    product.name = name || product.name;
    product.category = category || product.category;
    product.price = price;
    product.stock = stock;
    product.image = image;
    product.variants = variants;
    product.description = description || product.description;
    product.use = use || product.use;
    product.benefits = benefits || product.benefits;
    product.applicationMethod = applicationMethod || product.applicationMethod;

    if (typeof sections === "string") {
      product.sections = sections.split(",").map(s => s.trim()).filter(Boolean);
    } else if (Array.isArray(sections)) {
      product.sections = sections;
    }

    product.featured = featured ?? product.featured;
    product.originalPrice = originalPrice;
    product.rating = rating ?? product.rating;

    await product.save();
    return res.json(product);
  } catch (err) {
    res.status(400).json({ message: 'Update failed', error: err.message });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product)
      return res.status(404).json({ message: 'Product not found' });
    collectProductImagePaths(product).forEach((p) => {
      if (p && p.startsWith('/uploads/')) removeImageFile(p);
    });
    return res.json({ message: 'Product deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Delete failed', error: err.message });
  }
};
