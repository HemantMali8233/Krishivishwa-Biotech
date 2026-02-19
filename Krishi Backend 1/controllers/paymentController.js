const Razorpay = require('razorpay');
const crypto = require('crypto');

// Initialize Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Create Razorpay order
exports.createRazorpayOrder = async (req, res) => {
  try {
    const { amount, currency = 'INR', receipt } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Amount is required and must be greater than 0'
      });
    }

    // Convert amount to paise (Razorpay expects amount in smallest currency unit)
    const amountInPaise = Math.round(amount * 100);

    const options = {
      amount: amountInPaise,
      currency: currency,
      receipt: receipt || `receipt_${Date.now()}`,
      payment_capture: 1, // Auto capture payment
    };

    const order = await razorpay.orders.create(options);

    res.json({
      success: true,
      order: {
        id: order.id,
        amount: order.amount,
        currency: order.currency,
        receipt: order.receipt,
        status: order.status,
      },
      keyId: process.env.RAZORPAY_KEY_ID,
    });

  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create payment order',
      error: error.message
    });
  }
};

// Verify Razorpay payment signature
exports.verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: 'Missing payment verification details'
      });
    }

    // Create signature string
    const text = `${razorpay_order_id}|${razorpay_payment_id}`;
    
    // Generate expected signature
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(text)
      .digest('hex');

    // Verify signature
    const isSignatureValid = expectedSignature === razorpay_signature;

    if (!isSignatureValid) {
      return res.status(400).json({
        success: false,
        message: 'Payment verification failed: Invalid signature'
      });
    }

    // Optionally fetch payment details from Razorpay
    try {
      const payment = await razorpay.payments.fetch(razorpay_payment_id);
      
      res.json({
        success: true,
        message: 'Payment verified successfully',
        payment: {
          id: payment.id,
          order_id: payment.order_id,
          amount: payment.amount,
          currency: payment.currency,
          status: payment.status,
          method: payment.method,
          created_at: payment.created_at,
        }
      });
    } catch (razorpayError) {
      // Even if fetching payment details fails, signature verification passed
      res.json({
        success: true,
        message: 'Payment verified successfully',
        payment: {
          id: razorpay_payment_id,
          order_id: razorpay_order_id,
        }
      });
    }

  } catch (error) {
    console.error('Error verifying payment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify payment',
      error: error.message
    });
  }
};

// Get payment details by payment ID
exports.getPaymentDetails = async (req, res) => {
  try {
    const { paymentId } = req.params;

    if (!paymentId) {
      return res.status(400).json({
        success: false,
        message: 'Payment ID is required'
      });
    }

    const payment = await razorpay.payments.fetch(paymentId);

    res.json({
      success: true,
      payment: {
        id: payment.id,
        order_id: payment.order_id,
        amount: payment.amount,
        currency: payment.currency,
        status: payment.status,
        method: payment.method,
        created_at: payment.created_at,
      }
    });

  } catch (error) {
    console.error('Error fetching payment details:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch payment details',
      error: error.message
    });
  }
};

// Verify Razorpay refund ID and amount
exports.verifyRefund = async (req, res) => {
  try {
    const { refundId, paymentId } = req.body;

    if (!refundId || !paymentId) {
      return res.status(400).json({
        success: false,
        message: 'Refund ID and Payment ID are required'
      });
    }

    try {
      // Fetch refund details from Razorpay
      const refund = await razorpay.refunds.fetch(refundId);
      
      // Verify refund belongs to the payment
      if (refund.payment_id !== paymentId) {
        return res.status(400).json({
          success: false,
          message: 'Refund ID does not match the payment',
          verified: false
        });
      }

      // Check refund status
      if (refund.status !== 'processed') {
        return res.status(400).json({
          success: false,
          message: `Refund status is ${refund.status}, not processed`,
          verified: false,
          refundStatus: refund.status
        });
      }

      res.json({
        success: true,
        verified: true,
        refund: {
          id: refund.id,
          payment_id: refund.payment_id,
          amount: refund.amount, // in paise
          amountInRupees: refund.amount / 100,
          currency: refund.currency,
          status: refund.status,
          created_at: refund.created_at,
          notes: refund.notes || {}
        }
      });

    } catch (razorpayError) {
      // Refund ID not found or invalid
      if (razorpayError.statusCode === 404 || razorpayError.error?.code === 'BAD_REQUEST_ERROR') {
        return res.status(400).json({
          success: false,
          message: 'Invalid refund ID. Refund not found in Razorpay.',
          verified: false
        });
      }
      throw razorpayError;
    }

  } catch (error) {
    console.error('Error verifying refund:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify refund',
      error: error.message,
      verified: false
    });
  }
};
