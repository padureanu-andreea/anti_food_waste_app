const express = require('express');
const router = express.Router();
const integrationController = require('../controllers/integrationController');

router.get('/share/facebook/:productId', integrationController.generateFacebookShare);
router.get('/share/instagram/:productId', integrationController.generateInstagramContent);

module.exports = router;