// krishivishwa-backend/controllers/authController.js
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret"; // store securely in .env!
const JWT_EXPIRY = "7d"; // Token valid for 7 days

// Simple validators for identifier
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRegex = /^[6-9]\d{9}$/; // Indian 10‑digit phone

// Register new user
exports.registerUser = async (req, res) => {
  const { name, identifier, password } = req.body;

  try {
    if (!name || !identifier || !password) {
      return res
        .status(400)
        .json({ message: "Name, email/phone, and password are required" });
    }

    const trimmedIdentifier = identifier.trim();
    let email = null;
    let phone = null;

    if (emailRegex.test(trimmedIdentifier)) {
      email = trimmedIdentifier.toLowerCase();
    } else if (phoneRegex.test(trimmedIdentifier)) {
      phone = trimmedIdentifier;
    } else {
      return res
        .status(400)
        .json({ message: "Please provide a valid email or 10‑digit phone number" });
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [
        email ? { email } : null,
        phone ? { phone } : null,
      ].filter(Boolean),
    });

    if (existingUser) {
      return res
        .status(400)
        .json({ message: "User already exists with this email/phone" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user (omit null fields so indexes ignore missing values)
    const data = { name, password: hashedPassword };
    if (email) data.email = email;
    if (phone) data.phone = phone;
    const newUser = new User(data);

    await newUser.save();

    // Sign JWT token
    const token = jwt.sign({ id: newUser._id }, JWT_SECRET, { expiresIn: JWT_EXPIRY });

    res.status(201).json({
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
      },
      message: "Registration successful",
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Login user
exports.loginUser = async (req, res) => {
  const { identifier, password } = req.body;

  try {
    if (!identifier || !password) {
      return res
        .status(400)
        .json({ message: "Email/phone and password are required" });
    }

    const trimmedIdentifier = identifier.trim();
    let query = {};

    if (emailRegex.test(trimmedIdentifier)) {
      query = { email: trimmedIdentifier.toLowerCase() };
    } else if (phoneRegex.test(trimmedIdentifier)) {
      query = { phone: trimmedIdentifier };
    } else {
      // If identifier doesn't clearly match either pattern, try both fields
      query = {
        $or: [
          { email: trimmedIdentifier.toLowerCase() },
          { phone: trimmedIdentifier },
        ],
      };
    }

    // Find user by email or phone
    const user = await User.findOne(query);
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    // Sign JWT token
    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: JWT_EXPIRY });

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
      },
      message: "Login successful",
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Update profile (requires auth)
exports.updateProfile = async (req, res) => {
  try {
    const { name, email, phone } = req.body;
    const user = await User.findById(req.user._id || req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (name !== undefined && name !== null) {
      const t = String(name).trim();
      if (!t) return res.status(400).json({ message: "Name cannot be empty" });
      user.name = t;
    }

    if (email !== undefined) {
      const val = email === "" || email === null ? null : String(email).trim().toLowerCase();
      if (val && !emailRegex.test(val))
        return res.status(400).json({ message: "Please provide a valid email" });
      if (val) {
        const existing = await User.findOne({ email: val, _id: { $ne: user._id } });
        if (existing) return res.status(400).json({ message: "Email already in use" });
      }
      user.email = val;
    }

    if (phone !== undefined) {
      const val = phone === "" || phone === null ? null : String(phone).trim().replace(/\D/g, "");
      if (val && !phoneRegex.test(val))
        return res.status(400).json({ message: "Please provide a valid 10-digit phone number" });
      if (val) {
        const existing = await User.findOne({ phone: val, _id: { $ne: user._id } });
        if (existing) return res.status(400).json({ message: "Phone already in use" });
      }
      user.phone = val;
    }

    if (!user.email && !user.phone)
      return res.status(400).json({ message: "At least one of email or phone is required for login" });

    await user.save();

    res.json({
      message: "Profile updated successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Change password (requires auth)
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword)
      return res.status(400).json({ message: "Current password and new password are required" });
    if (String(newPassword).length < 6)
      return res.status(400).json({ message: "New password must be at least 6 characters" });

    const user = await User.findById(req.user._id || req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) return res.status(400).json({ message: "Current password is incorrect" });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.json({ message: "Password changed successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};
