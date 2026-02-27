const Timeline = require('../models/Timeline');

// Get all milestones
exports.getAllTimeline = async (req, res) => {
  try {
    const milestones = await Timeline.find().sort({ year: 1 });
    res.json(milestones);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Add new milestone
exports.createTimeline = async (req, res) => {
  try {
    const milestone = new Timeline(req.body);
    await milestone.save();
    res.status(201).json(milestone);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Edit milestone
exports.updateTimeline = async (req, res) => {
  try {
    const milestone = await Timeline.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!milestone) return res.status(404).json({ error: 'Not found' });
    res.json(milestone);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Delete milestone
exports.deleteTimeline = async (req, res) => {
  try {
    const result = await Timeline.findByIdAndDelete(req.params.id);
    if (!result) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
