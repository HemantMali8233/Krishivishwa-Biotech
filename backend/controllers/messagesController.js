const Message = require('../models/Message');
const Testimonial = require("../models/Testimonial");

// Create message (from form)
// Create message (from form)
exports.createMessage = async (req, res) => {
  try {
    const { name, email, phone, message, category } = req.body;

    if (!name || !phone || !message || !category) {
      return res.status(400).json({
        message: 'Name, phone, message and category are required',
      });
    }

    if (!['contact us', 'write us', 'write to us'].includes(category)) {
      return res.status(400).json({ message: 'Invalid category' });
    }

    const newMessage = new Message({
      name,
      email,
      phone,
      message,
      category,
    });

    // ✅ ATTACH LOGGED-IN USER (NEW LOGIC)
    if (req.user) {
      newMessage.user = req.user._id;
    }

    await newMessage.save();

    res.status(201).json({
      message: 'Message received successfully',
      data: newMessage,
    });
  } catch (error) {
    res.status(500).json({
      message: 'Server error',
      error: error.message,
    });
  }
};


// Admin: get messages paginated/filter + GLOBAL STATS

exports.getMessages = async (req, res) => {
  try {
    let { page = 1, limit = 10, search, status, category, starred, testimonial } = req.query;
    page = parseInt(page, 10);
    limit = parseInt(limit, 10);

    const query = {};

    if (search) {
      query.$or = [
        { name: new RegExp(search, "i") },
        { email: new RegExp(search, "i") },
        { phone: new RegExp(search, "i") },
        { message: new RegExp(search, "i") },
      ];
    }

    if (status && status !== "all") query.status = status;

    // Handle category filter; if "testimonial" selected, ignore category filter and use testimonial flag
    if (testimonial === "true") {
      // Will set query later for testimonial messages
    } else if (category && category !== "all") {
      query.category = category;
    }

    if (starred === "true") query.starred = true;

    // If testimonial filter active, find message IDs from testimonials collection
    if (testimonial === "true") {
      const testimonialDocs = await Testimonial.find({}, "messageId");
      const testimonialMsgIds = testimonialDocs.map((t) => t.messageId);
      query._id = { $in: testimonialMsgIds };
    }

    const total = await Message.countDocuments(query);
    const messages = await Message.find(query)
      .sort({ date: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    // Global stats
    const globalTotal = await Message.countDocuments();
    const globalUnread = await Message.countDocuments({ status: "unread" });
    const globalRead = await Message.countDocuments({ status: "read" });
    const globalContactUs = await Message.countDocuments({ category: "contact us" });
    const globalWriteUs = await Message.countDocuments({
      $or: [{ category: "write us" }, { category: "write to us" }],
    });

    res.json({
      messages,
      total,
      stats: {
        total: globalTotal,
        unread: globalUnread,
        read: globalRead,
        contactUs: globalContactUs,
        writeUs: globalWriteUs,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch messages", error: error.message });
  }
};


// Admin: update message status/starred
exports.updateMessage = async (req, res) => {
  try {
    const { status, starred } = req.body;
    const updateData = {};
    if (status) updateData.status = status;
    if (typeof starred === 'boolean') updateData.starred = starred;

    const message = await Message.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!message) return res.status(404).json({ message: 'Message not found' });

    res.json(message);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update message', error: error.message });
  }
};

// User: get own messages (My Details)
exports.getMyMessages = async (req, res) => {
  try {
    const messages = await Message.find({ user: req.user._id })
      .sort({ createdAt: -1 });

    res.json(messages);
  } catch (error) {
    res.status(500).json({
      message: 'Failed to fetch user messages',
      error: error.message,
    });
  }
};
