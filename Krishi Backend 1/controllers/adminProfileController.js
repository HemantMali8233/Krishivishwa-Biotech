const Admin = require('../models/Admin');
const bcrypt = require('bcryptjs');

exports.getProfile = async (req, res) => {
  try {
    res.json({
      username: req.admin.username,
      email: req.admin.email,
      role: req.admin.role || 'admin',
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to load profile' });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { name, email } = req.body;

    if (!name || !email) {
      return res.status(400).json({ message: 'Name and email are required' });
    }

    const existingAdmin = await Admin.findOne({ email, _id: { $ne: req.admin._id } });
    if (existingAdmin) {
      return res.status(400).json({ message: 'Email already in use' });
    }

    req.admin.username = name;
    req.admin.email = email;
    await req.admin.save();

    res.json({ message: 'Profile updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update profile' });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current and new passwords are required' });
    }

    const isMatch = await bcrypt.compare(currentPassword, req.admin.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    const salt = await bcrypt.genSalt(10);
    req.admin.password = await bcrypt.hash(newPassword, salt);
    await req.admin.save();

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to change password' });
  }
};
