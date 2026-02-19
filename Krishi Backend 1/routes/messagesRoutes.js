const express = require('express');
const router = express.Router();
const messagesController = require('../controllers/messagesController');
const userAuthMiddleware = require('../middleware/userAuthMiddleware');

// 🔐 USER: get own messages
router.get('/my', userAuthMiddleware, messagesController.getMyMessages);

// 📝 CREATE MESSAGE
// Auth is OPTIONAL here
router.post(
  '/',
  (req, res, next) => {
    // if token exists → attach user
    if (req.headers.authorization?.startsWith("Bearer ")) {
      userAuthMiddleware(req, res, next);
    } else {
      next();
    }
  },
  messagesController.createMessage
);

// 🛠 ADMIN ROUTES
router.get('/', messagesController.getMessages);
router.put('/:id', messagesController.updateMessage);

module.exports = router;
