const express = require('express');
const { getProfile, updateProfile, changePassword } = require('../controllers/adminProfileController');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

router.get('/profile', authMiddleware, getProfile);
router.patch('/profile', authMiddleware, updateProfile);
router.post('/change-password', authMiddleware, changePassword);

module.exports = router;
