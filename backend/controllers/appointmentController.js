// krishivishwa-backend/controllers/appointmentController.js
const Appointment = require("../models/Appointment");

// Create (from frontend form)
exports.createAppointment = async (req, res) => {
  try {
    const {
      name, email, phone, farmSize, cropType,
      location, consultationType, description
    } = req.body;

    if (!name || !phone || !consultationType)
      return res.status(400).json({ message: "Name, Phone, and Consultation Type are required." });

    // Use current date/time for 'date' and 'time' (no calendar/time in frontend)
    const now = new Date();
    const date = now;
    const hours = now.getHours().toString().padStart(2, '0');
    const mins = now.getMinutes().toString().padStart(2, '0');
    const time = `${hours}:${mins}`;

    // Default amount based on consultation type
    let amount = undefined;
    if (consultationType === "Phone Call") {
      amount = 500;
    } else if (consultationType === "Field Visit") {
      amount = 2500;
    }

    const appointment = new Appointment({
      farmerName: name,
      email,
      mobile: phone,
      farmSize,
      cropType,
      location,
      consultationType,
      description,
      date,
      time,
      amount,
      status: "Pending",
      paymentStatus: "Pending"
    });

    // ✅ Attach user if logged in
    if (req.user) {
      appointment.user = req.user._id;
    }

    await appointment.save();
    res.status(201).json({ message: "Appointment booked successfully!", appointment });
  } catch (error) {
    res.status(500).json({ message: "Server error while booking appointment", error: error.message });
  }
};

// List for admin (optional: add search, status, paymentStatus filters)
exports.getAppointments = async (req, res) => {
  try {
    let { page = 1, limit = 10, search, status, paymentStatus, fromDate, toDate, scheduledDate } = req.query;
    page = parseInt(page);
    limit = parseInt(limit);

    const query = {};
    if (search) {
      query.$or = [
        { farmerName: new RegExp(search, "i") },
        { cropType: new RegExp(search, "i") },
        { mobile: new RegExp(search, "i") },
        { email: new RegExp(search, "i") }
      ];
    }
    if (status && status !== "All Status") query.status = status;
    if (paymentStatus && paymentStatus !== "All Payments") query.paymentStatus = paymentStatus;

    // Date range filter for booking date
    if (fromDate || toDate) {
      query.date = {};
      if (fromDate) {
        const start = new Date(fromDate);
        start.setHours(0, 0, 0, 0);
        query.date.$gte = start;
      }
      if (toDate) {
        const end = new Date(toDate);
        end.setHours(23, 59, 59, 999);
        query.date.$lte = end;
      }
    }

    // Scheduled date filter
    if (scheduledDate) {
      const start = new Date(scheduledDate);
      start.setHours(0, 0, 0, 0);
      const end = new Date(scheduledDate);
      end.setHours(23, 59, 59, 999);

      query.scheduledDateTime = { $gte: start, $lte: end };
    }

    const total = await Appointment.countDocuments(query);
    const appointments = await Appointment.find(query)
      .sort({ date: -1, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    res.json({ appointments, total });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch appointments", error: error.message });
  }
};


// Update (e.g., admin approve/cancel)
exports.updateAppointment = async (req, res) => {
  try {
    const updateData = req.body;
    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );
    if (!appointment) return res.status(404).json({ message: "Appointment not found" });
    res.json(appointment);
  } catch (error) {
    res.status(500).json({ message: "Failed to update appointment", error: error.message });
  }
};

// Delete (admin - optional)
exports.deleteAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findByIdAndDelete(req.params.id);
    if (!appointment) return res.status(404).json({ message: "Appointment not found" });
    res.json({ message: "Appointment deleted." });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete appointment", error: error.message });
  }
};

// Get logged-in user's appointments
exports.getMyAppointments = async (req, res) => {
  try {
    const orConditions = [{ user: req.user._id }];

    // Also include historical appointments matched by email/phone
    if (req.user.email) {
      orConditions.push({ email: req.user.email });
    }
    if (req.user.phone) {
      orConditions.push({ mobile: req.user.phone });
    }

    const appointments = await Appointment.find({ $or: orConditions }).sort({
      createdAt: -1,
    });
    
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch user appointments', error: error.message });
  }
};
