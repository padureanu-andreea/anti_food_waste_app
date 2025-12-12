const express = require("express")
const router = express.Router()

const productController = require("../controllers/productController")
const authMiddleware = require("../middleware/authMiddleware")

router.post("/:id/share",authMiddleware,productController.postProductToGroup)
router.get("/:id/visibility", authMiddleware, productController.viewGroupsForProduct)
router.delete("/:id/visibility/:groupId", authMiddleware, productController.deleteProductfromGroup)

module.exports = router