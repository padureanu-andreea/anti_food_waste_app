const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const claimController = require('../controllers/claimController');

router.post('/', productController.createProduct);
router.get('/', productController.getAllProducts);
router.get('/:id', productController.getProductById);
router.patch('/:id', productController.updateProduct);
router.delete('/:id', productController.deleteProduct);

router.post('/:id/claims', claimController.createClaim);      
router.get('/:id/claims', claimController.getClaimsForProduct); 

module.exports = router;