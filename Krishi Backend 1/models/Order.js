const mongoose = require('mongoose');

const paymentDataSchema = new mongoose.Schema({
  transactionId: { type: String, default: null },
  transactionScreenshot: { type: String, default: null },
  hasScreenshot: { type: Boolean, default: false },
  // Razorpay payment fields
  razorpayOrderId: { type: String, default: null },
  razorpayPaymentId: { type: String, default: null },
  razorpaySignature: { type: String, default: null },
  paymentMethod: { type: String, default: null } // e.g., 'razorpay', 'manual'
}, { _id: false });

const customerInfoSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: false },
  phone: { type: String, required: true },
  address: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  zipCode: { type: String, required: true },
  country: { type: String, default: 'India' }
}, { _id: false });

const itemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  title: { type: String },
  image: { type: String },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true },
  category: { type: String }
}, { _id: false });

const pricingSchema = new mongoose.Schema({
  subtotal: { type: Number, required: true },
  shippingFee: { type: Number, default: 0 },
  tax: { type: Number, default: 0 },
  total: { type: Number, required: true }
}, { _id: false });

const orderSchema = new mongoose.Schema({
  orderId: { type: String, required: true, unique: true },
  orderDate: { type: Date, required: true },
  customerInfo: { type: customerInfoSchema, required: true },
  items: [itemSchema],
  pricing: { type: pricingSchema, required: true },
  paymentMethod: { 
    type: String, 
    enum: ['online', 'cod'], 
    required: true 
  },
  status: { 
    type: String, 
    enum: ['pending', 'assigned', 'delivered', 'rejected', 'cancelled'], 
    default: 'pending' 
  },
  specialInstructions: { type: String, default: '' },
  paymentData: { type: paymentDataSchema, default: null },
  
  // Assignment tracking
  assignedTo: { type: String, default: null },
  assignedFrom: { type: String, default: null },
  assignedAt: { type: Date, default: null },
  
  // Delivery tracking
  deliveredBy: { type: String, default: null },
  deliveredAt: { type: Date, default: null },
  confirmedBy: { type: String, default: null },
  confirmedAt: { type: Date, default: null },
  
  // Rejection / Refund (for online payment reject)
  refundTransactionId: { type: String, default: null },
  refundedAt: { type: Date, default: null },
  refundAmount: { type: Number, default: null }, // Refunded amount in rupees
  refundVerified: { type: Boolean, default: false }, // Whether refund was verified with Razorpay
  
  // User cancellation (from My Details)
  cancelledBy: { type: String, default: null },
  cancelledAt: { type: Date, default: null },
  cancellationReason: { type: String, default: null },
  cancelledByUser: { type: Boolean, default: false },
  
  // Logged-in user references
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  userId: { type: String, index: true },
  statusHistory: [{
    status: { type: String, required: true },
    changedBy: { type: String, required: true },
    changedAt: { type: Date, default: Date.now },
    _id: false
  }]
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
orderSchema.index({ orderDate: -1 });
orderSchema.index({ status: 1 });
orderSchema.index({ orderId: 1 });
orderSchema.index({ 'customerInfo.email': 1 });

module.exports = mongoose.model('Order', orderSchema);
