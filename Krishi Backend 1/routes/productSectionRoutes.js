const express = require('express');
const router = express.Router();
const productSectionController = require('../controllers/productSectionController');

router.get('/', productSectionController.getProductSections);
router.get('/:id', productSectionController.getProductSection);
router.post('/', productSectionController.createProductSection);
router.put('/:id', productSectionController.updateProductSection);
router.delete('/:id', productSectionController.deleteProductSection);

module.exports = router;
