const express = require('express');
const router = express.Router();
const tagController = require('../controllers/tagController');
const authMiddleware = require("../middleware/authMiddleware");

router.get('/', authMiddleware, tagController.getAllTags);
router.post('/', authMiddleware, tagController.createTag);

module.exports = router;