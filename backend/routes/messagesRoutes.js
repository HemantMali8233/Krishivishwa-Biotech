const express = require('express');
const router = express.Router();
const messagesController = require('../controllers/messagesController');
const userAuthMiddleware = require('../middleware/userAuthMiddleware');

// 🔐 USER: get own messages
router.get('/my', userAuthMiddleware, messagesController.getMyMessages);

// 📝 CREATE MESSAGE (Login required)
router.post('/', userAuthMiddleware, messagesController.createMessage);

// 🛠 ADMIN ROUTES
router.get('/', messagesController.getMessages);
router.put('/:id', messagesController.updateMessage);

module.exports = router;
