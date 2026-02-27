const express = require("express");
const router = express.Router();
const controller = require("../controllers/galleryItemController");

router.get("/", controller.getGalleryItems);
router.post("/", controller.createGalleryItem);
router.put("/:id", controller.updateGalleryItem);
router.delete("/:id", controller.deleteGalleryItem);

module.exports = router;
