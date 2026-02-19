const Order = require('../models/Order');
const Product = require('../models/Product'); // ADD THIS IMPORT
const path = require('path');
const fs = require('fs');

// GET /api/orders - with filtering, pagination, search
exports.getOrders = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      status, 
      search, 
      year,
      fromDate,
      toDate,
      pendingRefunds,
      paymentMethod,
      pendingRefund,
      hasRefund,
      sortBy = 'orderDate',
      sortOrder = 'desc'
    } = req.query;

    // Build query object
    const query = {};
    const andConditions = [];

    // Pending refunds filter: cancelled/rejected online orders without refund ID (for traceability)
    if (pendingRefunds === '1' || pendingRefunds === true) {
      query.status = { $in: ['cancelled', 'rejected'] };
      query.paymentMethod = 'online';
      andConditions.push({
        $or: [
        { refundTransactionId: null },
        { refundTransactionId: '' },
        { refundTransactionId: { $exists: false } }
        ]
      });
    } else if (status && ['pending', 'assigned', 'delivered', 'rejected', 'cancelled'].includes(status)) {
      query.status = status;
      
      // Additional filters for cancelled orders breakdown
      if (paymentMethod && ['cod', 'online'].includes(paymentMethod)) {
        query.paymentMethod = paymentMethod;
      }
      
      if (pendingRefund === '1') {
        andConditions.push({
          $or: [
            { refundTransactionId: null },
            { refundTransactionId: '' },
            { refundTransactionId: { $exists: false } }
          ]
        });
      }
      
      if (hasRefund === '1') {
        query.refundTransactionId = { $exists: true, $nin: [null, ''] };
      }
    }

    // Year filter
    if (year && year !== 'all') {
      const startDate = new Date(`${year}-01-01T00:00:00.000Z`);
      const endDate = new Date(`${parseInt(year) + 1}-01-01T00:00:00.000Z`);
      query.orderDate = { $gte: startDate, $lt: endDate };
    }

    // Date range filter (overrides / narrows year filter if provided)
    if (fromDate || toDate) {
      const range = {};
      if (fromDate) {
        const d = new Date(fromDate);
        if (!Number.isNaN(d.getTime())) range.$gte = d;
      }
      if (toDate) {
        const d = new Date(toDate);
        if (!Number.isNaN(d.getTime())) {
          // include the whole end day if date-only passed
          d.setHours(23, 59, 59, 999);
          range.$lte = d;
        }
      }
      if (Object.keys(range).length) {
        query.orderDate = { ...(query.orderDate || {}), ...range };
      }
    }

    // Search filter
    if (search) {
      andConditions.push({
        $or: [
          { 'customerInfo.firstName': { $regex: search, $options: 'i' } },
          { 'customerInfo.lastName': { $regex: search, $options: 'i' } },
          { 'customerInfo.email': { $regex: search, $options: 'i' } },
          { 'customerInfo.phone': { $regex: search, $options: 'i' } },
          { orderId: { $regex: search, $options: 'i' } },
          { 'items.name': { $regex: search, $options: 'i' } }
        ]
      });
    }

    if (andConditions.length) {
      query.$and = andConditions;
    }

    // Pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Sort options
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Execute queries
    const [orders, total] = await Promise.all([
      Order.find(query)
        .sort(sortOptions)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Order.countDocuments(query)
    ]);

    // Calculate pagination info
    const totalPages = Math.ceil(total / limitNum);
    const hasNextPage = pageNum < totalPages;
    const hasPrevPage = pageNum > 1;

    res.json({
      success: true,
      orders,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalOrders: total,
        hasNextPage,
        hasPrevPage,
        ordersPerPage: limitNum
      },
      total // For backward compatibility
    });

  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while fetching orders', 
      error: error.message 
    });
  }
};

// GET /api/orders/:id - get single order
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({ 
        success: false, 
        message: 'Order not found' 
      });
    }

    res.json({
      success: true,
      order
    });

  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while fetching order', 
      error: error.message 
    });
  }
};

// POST /api/orders - create new order with stock management
exports.createOrder = async (req, res) => {
  try {
    let orderData;

    // Check if it's multipart form data with file upload
    if (req.body.orderData) {
      // Parse JSON data from multipart form
      orderData = JSON.parse(req.body.orderData);
      
      // Handle screenshot upload
      if (req.file && orderData.paymentData) {
        orderData.paymentData.transactionScreenshot = `/uploads/${req.file.filename}`;
        orderData.paymentData.hasScreenshot = true;
      }
      // Attach logged-in user if available
      if (req.user && req.user._id) {
        orderData.user = req.user._id;
        orderData.userId = String(req.user._id);
      }
    } else {
      // Direct JSON payload
      orderData = req.body;

      // Attach logged-in user if available
      if (req.user && req.user._id) {
        orderData.user = req.user._id;
        orderData.userId = String(req.user._id);
      }
    }

    // Normalize customer contact info for consistent matching
    if (orderData.customerInfo) {
      if (orderData.customerInfo.email) {
        orderData.customerInfo.email = String(orderData.customerInfo.email).trim().toLowerCase();
      }
      if (orderData.customerInfo.phone) {
        orderData.customerInfo.phone = String(orderData.customerInfo.phone).trim();
      }
    }

    // Validate required fields
    if (!orderData.orderId || !orderData.customerInfo || !orderData.items || !orderData.pricing) {
      return res.status(400).json({
        success: false,
        message: 'Missing required order data'
      });
    }

    // **STOCK VALIDATION AND MANAGEMENT**
    const stockUpdates = [];
    
    // Validate stock availability for all items
    for (const item of orderData.items) {
      const product = await Product.findById(item._id || item.id);
      
      if (!product) {
        return res.status(400).json({
          success: false,
          message: `Product "${item.name || item.title}" not found`
        });
      }

      // Check if sufficient stock is available
      if (product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for "${product.name}". Available: ${product.stock}, Requested: ${item.quantity}`
        });
      }

      // Prepare stock update
      stockUpdates.push({
        productId: product._id,
        quantityToReduce: item.quantity
      });
    }

    // **UPDATE PRODUCT STOCK FIRST**
    for (const update of stockUpdates) {
      await Product.findByIdAndUpdate(
        update.productId,
        { $inc: { stock: -update.quantityToReduce } },
        { new: true }
      );
    }

    // Create and save order after successful stock updates
    const order = new Order(orderData);
    await order.save();

    res.status(201).json({
      success: true,
      message: 'Order created successfully and stock updated',
      order
    });

  } catch (error) {
    console.error('Error creating order:', error);
    
    // If order creation fails and we have a file, clean it up
    if (req.file) {
      const filePath = path.join(__dirname, '..', 'uploads', req.file.filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: validationErrors
      });
    }

    // Handle duplicate order ID
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Order ID already exists'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error while creating order',
      error: error.message
    });
  }
};

// PUT /api/orders/:id - update order
exports.updateOrder = async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id, 
      req.body, 
      { new: true, runValidators: true }
    );

    if (!order) {
      return res.status(404).json({ 
        success: false, 
        message: 'Order not found' 
      });
    }

    res.json({
      success: true,
      message: 'Order updated successfully',
      order
    });

  } catch (error) {
    console.error('Error updating order:', error);
    res.status(400).json({ 
      success: false, 
      message: 'Error updating order', 
      error: error.message 
    });
  }
};

// DELETE /api/orders/:id - delete order and restore stock
exports.deleteOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ 
        success: false, 
        message: 'Order not found' 
      });
    }

    // **RESTORE STOCK WHEN DELETING ORDER**
    for (const item of order.items) {
      await Product.findByIdAndUpdate(
        item._id || item.id,
        { $inc: { stock: item.quantity } },
        { new: true }
      );
    }

    // Delete the order
    await Order.findByIdAndDelete(req.params.id);

    // Delete associated screenshot file if exists
    if (order.paymentData?.transactionScreenshot) {
      const filePath = path.join(__dirname, '..', order.paymentData.transactionScreenshot);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    res.json({
      success: true,
      message: 'Order deleted successfully and stock restored'
    });

  } catch (error) {
    console.error('Error deleting order:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while deleting order', 
      error: error.message 
    });
  }
};

// PATCH /api/orders/update-status/:id - assign, deliver, or reject with proper metadata
exports.updateStatus = async (req, res) => {
  try {
    const { newStatus, assignedTo, assignedFrom, deliveredBy, confirmedBy, refundTransactionId } = req.body;
    
    if (!newStatus || !['assigned', 'delivered', 'rejected'].includes(newStatus)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Valid status is required (assigned, delivered, rejected)' 
      });
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ 
        success: false, 
        message: 'Order not found' 
      });
    }

    const oldStatus = order.status;

    // Validate transitions
    if (newStatus === 'assigned') {
      if (oldStatus !== 'pending') {
        return res.status(400).json({ success: false, message: 'Only pending orders can be assigned' });
      }
      if (!assignedTo?.trim() || !assignedFrom?.trim()) {
        return res.status(400).json({ success: false, message: 'Assigned to and Assigned from are required' });
      }
      order.assignedTo = assignedTo.trim();
      order.assignedFrom = assignedFrom.trim();
      order.assignedAt = new Date();
    } else if (newStatus === 'delivered') {
      if (oldStatus !== 'assigned') {
        return res.status(400).json({ success: false, message: 'Only assigned orders can be marked delivered' });
      }
      if (!deliveredBy?.trim() || !confirmedBy?.trim()) {
        return res.status(400).json({ success: false, message: 'Delivered by and Confirmed by are required' });
      }
      order.deliveredBy = deliveredBy.trim();
      order.confirmedBy = confirmedBy.trim();
      order.deliveredAt = new Date();
      order.confirmedAt = new Date();
    } else if (newStatus === 'rejected') {
      if (order.paymentMethod === 'online' && !refundTransactionId?.trim()) {
        return res.status(400).json({ 
          success: false, 
          message: 'For online payment orders, Refund Transaction ID is required before rejection' 
        });
      }
      if (order.paymentMethod === 'online') {
        order.refundTransactionId = refundTransactionId.trim();
        order.refundedAt = new Date();
      }
    }

    order.status = newStatus;

    if (!order.statusHistory) order.statusHistory = [];
    order.statusHistory.push({
      status: newStatus,
      changedBy: assignedFrom?.trim() || confirmedBy?.trim() || 'Admin',
      changedAt: new Date()
    });

    await order.save();

    res.json({
      success: true,
      message: `Order status updated from ${oldStatus} to ${newStatus}`,
      order
    });

  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while updating status', 
      error: error.message 
    });
  }
};

// PATCH /api/orders/user-cancel/:id - user cancels own order (pending only)
exports.userCancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (order.status !== 'pending') {
      return res.status(400).json({ 
        success: false, 
        message: 'Only pending orders can be cancelled. Once assigned, orders cannot be cancelled by user.' 
      });
    }

    // Restore stock
    for (const item of order.items) {
      const productId = item._id || item.id;
      if (productId) {
        await Product.findByIdAndUpdate(productId, { $inc: { stock: item.quantity } }, { new: true });
      }
    }

    order.status = 'cancelled';
    order.cancelledBy = req.user?.name || 'Customer';
    order.cancelledAt = new Date();
    order.cancelledByUser = true;

    if (!order.statusHistory) order.statusHistory = [];
    order.statusHistory.push({
      status: 'cancelled',
      changedBy: order.cancelledBy,
      changedAt: new Date()
    });

    await order.save();

    res.json({
      success: true,
      message: 'Order cancelled successfully',
      order
    });

  } catch (error) {
    console.error('Error cancelling order:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while cancelling order', 
      error: error.message 
    });
  }
};

// PATCH /api/orders/cancel/:id - admin cancel order and restore stock
exports.cancelOrder = async (req, res) => {
  try {
    const { adminName, reason, refundTransactionId } = req.body;
    
    if (!adminName || !adminName.trim()) {
      return res.status(400).json({ 
        success: false, 
        message: 'Admin name is required for order cancellation' 
      });
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ 
        success: false, 
        message: 'Order not found' 
      });
    }

    if (order.status === 'cancelled') {
      return res.status(400).json({ 
        success: false, 
        message: 'Order is already cancelled' 
      });
    }

    // **RESTORE STOCK WHEN CANCELLING ORDER**
    for (const item of order.items) {
      await Product.findByIdAndUpdate(
        item._id || item.id,
        { $inc: { stock: item.quantity } },
        { new: true }
      );
    }

    // Update order status
    order.status = 'cancelled';
    order.cancelledBy = adminName.trim();
    order.cancelledAt = new Date();
    order.cancellationReason = reason || 'No reason provided';
    if (order.paymentMethod === 'online' && refundTransactionId?.trim()) {
      order.refundTransactionId = refundTransactionId.trim();
      order.refundedAt = new Date();
    }

    // Add to status history
    if (!order.statusHistory) {
      order.statusHistory = [];
    }
    
    order.statusHistory.push({
      status: 'cancelled',
      changedBy: adminName.trim(),
      changedAt: new Date()
    });

    await order.save();

    res.json({
      success: true,
      message: `Order cancelled successfully by ${adminName}. Stock has been restored.`,
      order
    });

  } catch (error) {
    console.error('Error cancelling order:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while cancelling order', 
      error: error.message 
    });
  }
};

// PATCH /api/orders/:id/refund - record refund transaction ID (for cancelled/rejected online orders)
exports.recordRefund = async (req, res) => {
  try {
    const { refundTransactionId, skipVerification } = req.body;
    if (!refundTransactionId || !refundTransactionId.trim()) {
      return res.status(400).json({ success: false, message: 'Refund transaction ID is required' });
    }

    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    if (order.paymentMethod !== 'online') {
      return res.status(400).json({ success: false, message: 'Refund applies only to online orders' });
    }

    if (!['cancelled', 'rejected'].includes(order.status)) {
      return res.status(400).json({ success: false, message: 'Refund can only be recorded for cancelled or rejected orders' });
    }

    const paymentId = order.paymentData?.razorpayPaymentId;
    if (!paymentId && !skipVerification) {
      return res.status(400).json({ 
        success: false, 
        message: 'Payment ID not found. Cannot verify refund.',
        requiresVerification: true
      });
    }

    // Verify refund with Razorpay (unless skipped)
    let refundVerification = null;
    if (!skipVerification && paymentId) {
      try {
        const Razorpay = require('razorpay');
        const razorpay = new Razorpay({
          key_id: process.env.RAZORPAY_KEY_ID,
          key_secret: process.env.RAZORPAY_KEY_SECRET,
        });

        const refund = await razorpay.refunds.fetch(refundTransactionId.trim());
        
        // Verify refund belongs to this payment
        if (refund.payment_id !== paymentId) {
          return res.status(400).json({
            success: false,
            message: `Refund ID does not match this payment. Expected payment: ${paymentId}, Found: ${refund.payment_id}`,
            verified: false
          });
        }

        // Verify refund status
        if (refund.status !== 'processed') {
          return res.status(400).json({
            success: false,
            message: `Refund is not processed yet. Status: ${refund.status}`,
            verified: false,
            refundStatus: refund.status
          });
        }

        // Verify refund amount matches order amount (allow small difference for fees)
        const orderAmountPaise = Math.round((order.pricing?.total || 0) * 100);
        const refundAmountPaise = refund.amount;
        const amountDifference = Math.abs(orderAmountPaise - refundAmountPaise);
        const tolerance = Math.round(orderAmountPaise * 0.02); // 2% tolerance for fees

        if (amountDifference > tolerance) {
          return res.status(400).json({
            success: false,
            message: `Refund amount mismatch. Order: ₹${order.pricing?.total}, Refund: ₹${refundAmountPaise / 100}. Difference: ₹${amountDifference / 100}`,
            verified: false,
            orderAmount: order.pricing?.total,
            refundAmount: refundAmountPaise / 100
          });
        }

        refundVerification = {
          verified: true,
          refundId: refund.id,
          refundAmount: refundAmountPaise / 100,
          refundStatus: refund.status,
          refundedAt: new Date(refund.created_at * 1000)
        };

      } catch (razorpayError) {
        if (razorpayError.statusCode === 404 || razorpayError.error?.code === 'BAD_REQUEST_ERROR') {
          return res.status(400).json({
            success: false,
            message: 'Invalid refund ID. Refund not found in Razorpay. Please check the Refund ID.',
            verified: false
          });
        }
        throw razorpayError;
      }
    }

    // Save refund details
    order.refundTransactionId = refundTransactionId.trim();
    order.refundedAt = refundVerification?.refundedAt || new Date();
    if (refundVerification) {
      order.refundAmount = refundVerification.refundAmount;
      order.refundVerified = true;
    }
    await order.save();

    res.json({ 
      success: true, 
      message: refundVerification ? 'Refund verified and recorded successfully' : 'Refund recorded (verification skipped)',
      order,
      verification: refundVerification
    });
  } catch (error) {
    console.error('Error recording refund:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// GET /api/orders/analytics/stats - get dashboard statistics
exports.getOrderStats = async (req, res) => {
  try {
    const { year } = req.query;
    
    // Build date filter
    let dateFilter = {};
    if (year && year !== 'all') {
      const startDate = new Date(`${year}-01-01T00:00:00.000Z`);
      const endDate = new Date(`${parseInt(year) + 1}-01-01T00:00:00.000Z`);
      dateFilter = { orderDate: { $gte: startDate, $lt: endDate } };
    }

    // Get various statistics
    const pendingRefundsQuery = {
      ...dateFilter,
      status: { $in: ['cancelled', 'rejected'] },
      paymentMethod: 'online',
      $or: [
        { refundTransactionId: null },
        { refundTransactionId: '' },
        { refundTransactionId: { $exists: false } }
      ]
    };

    const [
      totalOrders,
      pendingOrders,
      deliveredOrders,
      pendingRefundsCount,
      totalRevenue,
      recentOrders,
      paymentMethodStats
    ] = await Promise.all([
      Order.countDocuments(dateFilter),
      Order.countDocuments({ ...dateFilter, status: 'pending' }),
      Order.countDocuments({ ...dateFilter, status: 'delivered' }),
      Order.countDocuments(pendingRefundsQuery),
      Order.aggregate([
        { $match: { ...dateFilter, status: { $nin: ['cancelled', 'rejected'] } } },
        { $group: { _id: null, total: { $sum: '$pricing.total' } } }
      ]),
      Order.find(dateFilter).sort({ orderDate: -1 }).limit(5).lean(),
      Order.aggregate([
        { $match: dateFilter },
        { $group: { _id: '$paymentMethod', count: { $sum: 1 } } }
      ])
    ]);

    res.json({
      success: true,
      stats: {
        totalOrders,
        pendingOrders,
        deliveredOrders,
        pendingRefundsCount,
        totalRevenue: totalRevenue[0]?.total || 0,
        recentOrders,
        paymentMethodStats
      }
    });

  } catch (error) {
    console.error('Error fetching order statistics:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while fetching statistics', 
      error: error.message 
    });
  }
};


// User: get own orders
exports.getMyOrders = async (req, res) => {
  try {
    const userId = req.user._id.toString();
    const orConditions = [{ user: req.user._id }, { userId }];

    // Also include historical orders matched by email/phone (flexible matching)
    if (req.user.email) {
      const emailEscaped = req.user.email.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      orConditions.push({
        'customerInfo.email': { $regex: `^${emailEscaped}$`, $options: 'i' },
      });
    }
    if (req.user.phone) {
      const digits = String(req.user.phone).replace(/\D/g, '');
      if (digits.length >= 4) {
        const lastDigits = digits.slice(-4);
        orConditions.push({
          'customerInfo.phone': { $regex: `${lastDigits}$` },
        });
      } else {
        orConditions.push({ 'customerInfo.phone': req.user.phone });
      }
    }

    const orders = await Order.find({ $or: orConditions }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch user orders', error: error.message });
  }
};
