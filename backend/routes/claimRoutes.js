const express = require('express');
const router = express.Router();
const claimController = require('../controllers/claimController');

// GET /claims 
router.get('/', claimController.getClaims);

// PATCH /claims/:id (Acceptare/Respingere)
router.patch('/:id', claimController.updateClaimStatus);

module.exports = router;