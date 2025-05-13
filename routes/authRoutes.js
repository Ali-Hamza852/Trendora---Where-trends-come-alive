const express = require("express")
const router = express.Router()
const authController = require("../controllers/authController")
const { protect } = require("../middleware/authMiddleware")

// Auth routes
router.post("/register", authController.register)
router.post("/login", authController.login)
router.post("/logout", authController.logout)
router.get("/me", protect, authController.getMe)
router.put("/profile", protect, authController.updateProfile)
router.get("/verify-email/:token", authController.verifyEmail)
router.post("/forgot-password", authController.forgotPassword)
router.post("/reset-password/:token", authController.resetPassword)
router.put("/change-password", protect, authController.changePassword)

module.exports = router
