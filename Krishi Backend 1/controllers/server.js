require('dotenv').config();
const express = require('express');
const connectDB = require('./config/db');
const cors = require('cors');
const path = require('path');

// Import routes
const productRoutes = require('./routes/productRoutes');
const appointmentRoutes = require("./routes/appointmentRoutes");
const authRoutes = require('./routes/authRoutes');
const messagesRoutes = require('./routes/messagesRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const galleryItemRoutes = require('./routes/galleryItemRoutes');
const uploadRoutes = require("./routes/uploadRoutes");
const adminAuthRoutes = require('./routes/adminAuthRoutes');
const adminProfileRoutes = require('./routes/adminProfileRoutes');
const testimonialRoutes = require("./routes/testimonialRoutes");
const timelineRoutes = require('./routes/timelineRoutes');
const productCategoryRoutes = require('./routes/productCategoryRoutes');
const orderRoutes = require('./routes/orderRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const bannerRoutes = require('./routes/bannerRoutes');
const updatesRoutes = require('./routes/updatesRoutes'); // ADD THIS LINE

const app = express(); 
connectDB();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Static uploads (images, screenshots etc.)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// API routes
app.use("/api/upload", uploadRoutes);
app.use('/api/products', productRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/messages', messagesRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/gallery-items', galleryItemRoutes);
app.use('/api/admin', adminAuthRoutes);
app.use('/api/admin/profile', adminProfileRoutes);
app.use("/api/testimonials", testimonialRoutes);
app.use('/api/timeline', timelineRoutes);
app.use('/api/product-categories', productCategoryRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/banners', bannerRoutes);
app.use('/api/updates', updatesRoutes); // ADD THIS LINE

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Server error', error: err.message });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
