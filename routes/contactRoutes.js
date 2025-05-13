const express = require("express")
const router = express.Router()
const contactController = require("../controllers/contactController")
const { protect, admin } = require("../middleware/authMiddleware")

// Contact routes
router.post("/", contactController.submitContactForm)
router.get("/", protect, admin, contactController.getAllContactMessages)
router.get("/:id", protect, admin, contactController.getContactMessageById)
router.put("/:id/respond", protect, admin, contactController.respondToContactMessage)
router.delete("/:id", protect, admin, contactController.deleteContactMessage)

module.exports = router
