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

// Ensure predefined admins from environment exist
try {
  const Admin = require('./models/Admin');
  const ensurePredefinedAdmins = async () => {
    const raw = process.env.ADMIN_EMAILS || '';
    const password = process.env.ADMIN_PASSWORD || '';
    const emails = raw.split(',').map(e => e.trim().toLowerCase()).filter(Boolean);
    if (!emails.length || !password) return;
    for (const email of emails) {
      const existing = await Admin.findOne({ email });
      if (!existing) {
        const username = email.split('@')[0] || 'admin';
        const admin = new Admin({ username, email, password });
        await admin.save();
        console.log(`Created admin: ${email}`);
      }
    }
  };
  // Fire and forget; mongoose will buffer ops until connected
  ensurePredefinedAdmins().catch(err => console.error('Admin init error:', err.message));
} catch (e) {
  console.error('Admin init setup error:', e.message);
}

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Ensure critical indexes exist (and fix mismatches) at startup
try {
  const User = require('./models/User');
  // syncIndexes will create missing indexes and drop indexes not in schema
  User.syncIndexes().catch((e) => console.error('User index sync error:', e.message));
} catch (e) {
  console.error('Index init error:', e.message);
}

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


app.get("/", (req, res) => {
  res.send("Backend is running successfully 🚀");
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
