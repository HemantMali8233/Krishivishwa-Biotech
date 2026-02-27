// krishivishwa-backend/models/User.js
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please add your name"],
      trim: true,
    },
    email: {
      type: String,
      required: false, // email is optional if phone is used
      unique: true,
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      required: false, // phone is optional if email is used
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Please add a password"],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
