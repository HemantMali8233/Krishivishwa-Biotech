const mongoose = require("mongoose");

const milestoneSchema = new mongoose.Schema({
  year: String,
  title: String,
  description: String,
  achievement: String,
  metric: String,
  highlight: String,
  icon: String,
  image: String, // stores uploaded image URL
}, { timestamps: true });

module.exports = mongoose.model("Milestone", milestoneSchema);
