const express = require("express");
const router = express.Router();
const appointmentController = require("../controllers/appointmentController");
const userAuthMiddleware = require("../middleware/userAuthMiddleware"); // ✅ Make sure this exists

// Admin / general routes
router.get("/", appointmentController.getAppointments); // admin/list

// User booking form (Login required)
router.post("/", userAuthMiddleware, appointmentController.createAppointment);
router.put("/:id", appointmentController.updateAppointment); // admin update
router.delete("/:id", appointmentController.deleteAppointment); // admin delete

// ✅ USER: get own appointments
router.get("/my", userAuthMiddleware, appointmentController.getMyAppointments);

module.exports = router;
