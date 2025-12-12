const express = require('express')
const router = express.Router()

const feedController = require("../controllers/feedController")
const authMiddleware = require("../middleware/authMiddleware")

router.get("/products", authMiddleware, feedController.getProductsForMe)

module.exports = router