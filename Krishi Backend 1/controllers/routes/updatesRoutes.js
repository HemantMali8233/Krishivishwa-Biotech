const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const updatesController = require('../controllers/updatesController');

const router = express.Router();

// Create uploads directory for news images
const newsUploadDir = path.join(__dirname, '..', 'uploads', 'news');
if (!fs.existsSync(newsUploadDir)) {
  fs.mkdirSync(newsUploadDir, { recursive: true });
}

// Multer configuration for news images
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, newsUploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'news-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  // Accept only image files
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

const upload = multer({ 
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// MARQUEE ROUTES
router.get('/marquee', updatesController.getMarquees);
router.post('/marquee', updatesController.createMarquee);
router.put('/marquee/:id', updatesController.updateMarquee);
router.delete('/marquee/:id', updatesController.deleteMarquee);

// NEWS CAROUSEL ROUTES
router.get('/news', updatesController.getNewsCarousel);
router.get('/news/all', updatesController.getAllNewsCarousel);
router.post('/news', upload.single('image'), updatesController.createNewsCarousel);
router.put('/news/:id', upload.single('image'), updatesController.updateNewsCarousel);
router.delete('/news/:id', updatesController.deleteNewsCarousel);
router.patch('/news/:id/like', updatesController.likeNewsCarousel);

// NEWSLETTER ROUTES
router.get('/newsletters', updatesController.getNewsletters);
router.post('/newsletter/subscribe', updatesController.subscribeNewsletter);
router.put('/newsletters/:id', updatesController.updateNewsletterStatus);
router.delete('/newsletters/:id', updatesController.deleteNewsletter);

// NEWSLETTER SETTINGS ROUTES
router.get('/newsletter-settings', updatesController.getNewsletterSettings);
router.put('/newsletter-settings', updatesController.updateNewsletterSettings);

// VIDEO ROUTES
router.get('/videos', updatesController.getVideos);
router.get('/videos/all', updatesController.getAllVideos);
router.post('/videos', updatesController.createVideo);
router.put('/videos/:id', updatesController.updateVideo);
router.delete('/videos/:id', updatesController.deleteVideo);

module.exports = router;
