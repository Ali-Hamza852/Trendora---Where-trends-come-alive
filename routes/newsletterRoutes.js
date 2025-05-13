const express = require("express")
const router = express.Router()
const newsletterController = require("../controllers/newsletterController")
const { protect, admin } = require("../middleware/authMiddleware")

// Newsletter routes
router.post("/subscribe", newsletterController.subscribe)
router.post("/unsubscribe", newsletterController.unsubscribe)
router.get("/subscribers", protect, admin, newsletterController.getAllSubscribers)
router.post("/send", protect, admin, newsletterController.sendNewsletter)

module.exports = router
