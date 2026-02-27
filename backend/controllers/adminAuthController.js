const Admin = require('../models/Admin');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Admin registration disabled - only predefined admins can access
exports.register = async (req, res) => {
  return res.status(403).json({ message: 'Admin registration is disabled. Only predefined administrators can access the system.' });
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: admin._id, role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '1d' });

    res.json({
      token,
      admin: { username: admin.username, email: admin.email }
    });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server error' });
  }
};
