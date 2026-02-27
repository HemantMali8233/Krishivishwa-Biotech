const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema(
  {
    farmerName: { type: String, required: true, trim: true },
    date: { type: Date, required: true },
    time: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: [
        "Pending",
        "Approved",
        "Confirmed",
        "Cancelled",
        "Meeting Finished",
        "Finished",
      ],
      default: "Pending",
    },
    consultationType: {
      type: String,
      enum: ["Phone Call", "Field Visit"],
      required: true,
    },
    location: { type: String, trim: true },
    mobile: { type: String, required: true, trim: true },
    email: { type: String, trim: true },
    farmSize: { type: String, trim: true },
    cropType: { type: String, trim: true },
    description: { type: String, trim: true },
    paymentStatus: {
      type: String,
      enum: ["Paid", "Pending", "Refunded", "COD Collected"],
      default: "Pending",
    },
    paymentDate: { type: Date }, // Date when payment was made/collected

    // Fixed amount per flow (can be overridden if needed)
    amount: { type: Number }, // e.g. 500 for Phone Call, 2500 for Field Visit

    // Approval metadata (admin panel)
    approvedByAdminName: { type: String, trim: true },
    appointmentConductedBy: { type: String, trim: true }, // person who will/do conduct the appointment
    scheduledDateTime: { type: Date },

    // Completion metadata
    completionConductedBy: { type: String, trim: true },
    completionConfirmedBy: { type: String, trim: true },
    paymentCollectedBy: { type: String, trim: true }, // for field visit COD / manual
    completionPaymentType: {
      type: String,
      enum: ["COD", "Online", null],
      default: null,
    },

    // Store last successful Razorpay payment info (if any)
    paymentData: {
      razorpayOrderId: String,
      razorpayPaymentId: String,
      razorpaySignature: String,
      method: String,
    },

    // Cancellation metadata
    cancelledBy: { type: String, trim: true },
    cancelledAt: { type: Date },
    refundTransactionId: { type: String, trim: true },

    // ✅ Logged-in user reference
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Appointment", appointmentSchema);
