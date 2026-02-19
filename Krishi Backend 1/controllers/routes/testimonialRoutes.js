const express = require("express");
const router = express.Router();
const testimonialController = require("../controllers/testimonialController");

// POST: Add testimonial
router.post("/", testimonialController.createTestimonial);

// GET: Get all testimonials
router.get("/", testimonialController.getTestimonials);

router.delete("/bymsg/:id", testimonialController.removeByMessageId);
module.exports = router;
