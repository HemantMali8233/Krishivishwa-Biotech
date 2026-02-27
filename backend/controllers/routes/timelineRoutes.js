const express = require('express');
const router = express.Router();
const timelineController = require('../controllers/timelineController');

// Get all milestones (public)
router.get('/', timelineController.getAllTimeline);

// Admin routes
router.post('/', timelineController.createTimeline);
router.put('/:id', timelineController.updateTimeline);
router.delete('/:id', timelineController.deleteTimeline);

module.exports = router;
