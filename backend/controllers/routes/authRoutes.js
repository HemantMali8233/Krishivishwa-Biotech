// krishivishwa-backend/routes/authRoutes.js
const express = require("express");
const router = express.Router();
const userAuthMiddleware = require("../middleware/userAuthMiddleware");
const { registerUser, loginUser, updateProfile, changePassword } = require("../controllers/authController");

router.post("/register", registerUser);
router.post("/login", loginUser);
router.patch("/profile", userAuthMiddleware, updateProfile);
router.post("/change-password", userAuthMiddleware, changePassword);

module.exports = router;
