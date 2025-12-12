const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventoryController');
const claimController = require('../controllers/claimController');

router.post('/', inventoryController.createProduct);
router.get('/', inventoryController.getAllProducts);
router.get('/:id', inventoryController.getProductById);
router.patch('/:id', inventoryController.updateProduct);
router.delete('/:id', inventoryController.deleteProduct);

router.post('/:id/claims', claimController.createClaim);      
router.get('/:id/claims', claimController.getClaimsForProduct); 

module.exports = router;