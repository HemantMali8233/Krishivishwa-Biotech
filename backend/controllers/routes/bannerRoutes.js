const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const bannerController = require('../controllers/bannerController');

const router = express.Router();

// Create uploads directory if it doesn't exist
const uploadDir = 'uploads/banners';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'banner-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Routes
router.get('/', bannerController.getAllBanners);
router.get('/page/:pageName', bannerController.getBannersByPage);
router.get('/:id', bannerController.getBanner);
router.post('/', upload.single('image'), bannerController.createBanner);
router.put('/:id', upload.single('image'), bannerController.updateBanner);
router.delete('/:id', bannerController.deleteBanner);
router.put('/:id/toggle', bannerController.toggleBannerStatus);

module.exports = router;
