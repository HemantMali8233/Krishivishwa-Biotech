const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const userAuthMiddleware = require('../middleware/userAuthMiddleware');

// Multer setup for transaction screenshots
const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, `transaction-${Date.now()}-${file.originalname}`)
});

const upload = multer({ 
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Only image files are allowed'));
  },
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

// ✅ User: get own orders
router.get('/my', userAuthMiddleware, orderController.getMyOrders);

// Admin/public routes
router.get('/', orderController.getOrders);
router.get('/analytics/stats', orderController.getOrderStats);
router.get('/:id', orderController.getOrderById);

// Create order (auth OPTIONAL: attach user if token present)
router.post(
  '/',
  (req, res, next) => {
    if (req.headers.authorization?.startsWith('Bearer ')) {
      return userAuthMiddleware(req, res, next);
    }
    next();
  },
  upload.single('transactionScreenshot'),
  orderController.createOrder
);
router.put('/:id', orderController.updateOrder);
router.delete('/:id', orderController.deleteOrder);
router.patch('/update-status/:id', orderController.updateStatus);
router.patch('/cancel/:id', orderController.cancelOrder);
router.patch('/user-cancel/:id', userAuthMiddleware, orderController.userCancelOrder);
router.patch('/refund/:id', orderController.recordRefund);

module.exports = router;
