const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const userAuthMiddleware = require('../middleware/userAuthMiddleware');

// Create Razorpay order (auth optional but recommended)
router.post(
  '/create-order',
  (req, res, next) => {
    if (req.headers.authorization?.startsWith('Bearer ')) {
      return userAuthMiddleware(req, res, next);
    }
    next();
  },
  paymentController.createRazorpayOrder
);

// Verify payment signature
router.post('/verify', paymentController.verifyPayment);

// Get payment details
router.get('/:paymentId', paymentController.getPaymentDetails);

// Verify refund
router.post('/verify-refund', paymentController.verifyRefund);

module.exports = router;
