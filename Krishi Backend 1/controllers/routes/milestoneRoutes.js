const express = require("express");
const router = express.Router();
const milestoneController = require("../controllers/milestoneController");
const upload = require("../middleware/uploadMiddleware");
const authMiddleware = require("../middleware/authMiddleware");

// Public fetch
router.get("/", milestoneController.getMilestones);

// Protected routes with auth & image upload
router.post(
  "/",
  authMiddleware,
  upload.single("image"),
  milestoneController.createMilestone
);
router.put(
  "/:id",
  authMiddleware,
  upload.single("image"),
  milestoneController.updateMilestone
);
router.delete("/:id", authMiddleware, milestoneController.deleteMilestone);

module.exports = router;
