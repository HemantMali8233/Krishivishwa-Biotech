const Banner = require('../models/Banner');
const path = require('path');
const fs = require('fs');

// Get all banners
exports.getAllBanners = async (req, res) => {
  try {
    const banners = await Banner.find().sort({ pageName: 1, order: 1 });
    res.json(banners);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching banners', error: error.message });
  }
};

// Get banners by page name
exports.getBannersByPage = async (req, res) => {
  try {
    const { pageName } = req.params;
    const banners = await Banner.find({ 
      pageName, 
      isActive: true 
    }).sort({ order: 1 });
    
    res.json(banners);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching banners for page', error: error.message });
  }
};

// Get single banner
exports.getBanner = async (req, res) => {
  try {
    const banner = await Banner.findById(req.params.id);
    if (!banner) {
      return res.status(404).json({ message: 'Banner not found' });
    }
    res.json(banner);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching banner', error: error.message });
  }
};

// Create new banner
exports.createBanner = async (req, res) => {
  try {
    const { 
      title, 
      description, 
      pageName, 
      isActive, 
      order,
      titleColors,
      descriptionColor,
      alignment,
      titleStyle,
      descriptionStyle,
      useGradient,
      gradientColors,
      gradientDirection
    } = req.body;
    
    if (!req.file) {
      return res.status(400).json({ message: 'Image is required' });
    }

    // Create image URL
    const imageUrl = `/uploads/banners/${req.file.filename}`;

    const banner = new Banner({
      title,
      description,
      image: imageUrl,
      pageName,
      isActive: isActive !== undefined ? isActive : true,
      order: order || 0,
      // Parse JSON fields
      titleColors: titleColors ? JSON.parse(titleColors) : [],
      descriptionColor: descriptionColor || '#ffffff',
      alignment: alignment || 'center',
      titleStyle: titleStyle ? JSON.parse(titleStyle) : {
        fontSize: '3.5rem',
        fontWeight: '600',
        textShadow: '2px 2px 4px rgba(0,0,0,0.5)'
      },
      descriptionStyle: descriptionStyle ? JSON.parse(descriptionStyle) : {
        fontSize: '1.2rem',
        fontWeight: '300',
        textShadow: '1px 1px 2px rgba(0,0,0,0.3)'
      },
      useGradient: useGradient === 'true',
      gradientColors: gradientColors ? JSON.parse(gradientColors) : ['#ffffff', '#f0f0f0'],
      gradientDirection: gradientDirection || '90deg'
    });

    const savedBanner = await banner.save();
    res.status(201).json(savedBanner);
  } catch (error) {
    // Delete uploaded file if banner creation fails
    if (req.file) {
      fs.unlink(req.file.path, (err) => {
        if (err) console.error('Error deleting file:', err);
      });
    }
    res.status(400).json({ message: 'Error creating banner', error: error.message });
  }
};

// Update banner
exports.updateBanner = async (req, res) => {
  try {
    const { 
      title, 
      description, 
      pageName, 
      isActive, 
      order,
      titleColors,
      descriptionColor,
      alignment,
      titleStyle,
      descriptionStyle,
      useGradient,
      gradientColors,
      gradientDirection
    } = req.body;
    
    const banner = await Banner.findById(req.params.id);
    
    if (!banner) {
      if (req.file) {
        fs.unlink(req.file.path, (err) => {
          if (err) console.error('Error deleting file:', err);
        });
      }
      return res.status(404).json({ message: 'Banner not found' });
    }

    // Update basic fields
    banner.title = title || banner.title;
    banner.description = description || banner.description;
    banner.pageName = pageName || banner.pageName;
    banner.isActive = isActive !== undefined ? isActive : banner.isActive;
    banner.order = order !== undefined ? order : banner.order;

    // Update styling fields
    if (titleColors) banner.titleColors = JSON.parse(titleColors);
    if (descriptionColor) banner.descriptionColor = descriptionColor;
    if (alignment) banner.alignment = alignment;
    if (titleStyle) banner.titleStyle = JSON.parse(titleStyle);
    if (descriptionStyle) banner.descriptionStyle = JSON.parse(descriptionStyle);
    if (useGradient !== undefined) banner.useGradient = useGradient === 'true';
    if (gradientColors) banner.gradientColors = JSON.parse(gradientColors);
    if (gradientDirection) banner.gradientDirection = gradientDirection;

    // Update image if new one uploaded
    if (req.file) {
      // Delete old image file
      const oldImagePath = path.join(__dirname, '..', banner.image);
      if (fs.existsSync(oldImagePath)) {
        fs.unlink(oldImagePath, (err) => {
          if (err) console.error('Error deleting old file:', err);
        });
      }
      banner.image = `/uploads/banners/${req.file.filename}`;
    }

    const updatedBanner = await banner.save();
    res.json(updatedBanner);
  } catch (error) {
    if (req.file) {
      fs.unlink(req.file.path, (err) => {
        if (err) console.error('Error deleting file:', err);
      });
    }
    res.status(400).json({ message: 'Error updating banner', error: error.message });
  }
};

// Delete banner
exports.deleteBanner = async (req, res) => {
  try {
    const banner = await Banner.findById(req.params.id);
    if (!banner) {
      return res.status(404).json({ message: 'Banner not found' });
    }

    // Delete associated image file
    const imagePath = path.join(__dirname, '..', banner.image);
    if (fs.existsSync(imagePath)) {
      fs.unlink(imagePath, (err) => {
        if (err) console.error('Error deleting file:', err);
      });
    }

    await Banner.findByIdAndDelete(req.params.id);
    res.json({ message: 'Banner deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting banner', error: error.message });
  }
};

// Toggle banner active status
exports.toggleBannerStatus = async (req, res) => {
  try {
    const banner = await Banner.findById(req.params.id);
    if (!banner) {
      return res.status(404).json({ message: 'Banner not found' });
    }

    banner.isActive = !banner.isActive;
    const updatedBanner = await banner.save();
    
    res.json(updatedBanner);
  } catch (error) {
    res.status(500).json({ message: 'Error toggling banner status', error: error.message });
  }
};
