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
      required: false, // optional if phone is used
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      required: false, // optional if email is used
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Please add a password"],
    },
  },
  { timestamps: true }
);

// Use partial unique indexes so multiple null/absent values are allowed
userSchema.index(
  { email: 1 },
  { unique: true, partialFilterExpression: { email: { $type: "string" } } }
);
userSchema.index(
  { phone: 1 },
  { unique: true, partialFilterExpression: { phone: { $type: "string" } } }
);

module.exports = mongoose.model("User", userSchema);
