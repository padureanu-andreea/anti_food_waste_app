const express = require('express')
const router = express.Router()
const authController = require("../controllers/authController")
const authMiddleware = require("../middleware/authMiddleware")



router.post("/register",authController.createUser)
router.post("/login",authController.searchUser)
router.get("/me",authMiddleware,authController.getMe)
router.patch("/me", authMiddleware, authController.editUser)

//rute ajutatoare
//nu au nevoie de authMiddleware, dar in production nu este ok sa aiba acces toata lumea la aceste rute
router.get("/users", authController.getAllUsers)
router.get("/users/:username", authController.getUserByUsername)


module.exports = router