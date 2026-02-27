const Milestone = require("../models/Milestone");

exports.getMilestones = async (req, res) => {
  try {
    const milestones = await Milestone.find().sort({ year: 1 });
    res.json(milestones);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

exports.createMilestone = async (req, res) => {
  try {
    const data = req.body;
    if (req.file) data.image = `/uploads/${req.file.filename}`;
    const milestone = new Milestone(data);
    await milestone.save();
    res.json(milestone);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.updateMilestone = async (req, res) => {
  try {
    const data = req.body;
    if (req.file) data.image = `/uploads/${req.file.filename}`;
    const milestone = await Milestone.findByIdAndUpdate(req.params.id, data, {
      new: true,
    });
    res.json(milestone);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.deleteMilestone = async (req, res) => {
  try {
    await Milestone.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch {
    res.status(400).json({ error: "Failed to delete" });
  }
};
