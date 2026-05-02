const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const productController = require("../controllers/productController");

const router = express.Router();

const uploadDir = path.join(__dirname, "..", "uploads", "products");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname.replace(/\s+/g, "_"));
  }
});
const upload = multer({ storage });

const variantImageFields = Array.from({ length: 25 }, (_, i) => ({
  name: `variantImage_${i}`,
  maxCount: 1,
}));

router.get("/", productController.getProducts);
router.get("/:id", productController.getProductById);
router.post("/", upload.fields(variantImageFields), productController.createProduct);
router.put("/:id", upload.fields(variantImageFields), productController.updateProduct);
router.delete("/:id", productController.deleteProduct);

module.exports = router;
