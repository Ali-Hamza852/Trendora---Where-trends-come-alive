const express = require("express")
const router = express.Router()
const reviewController = require("../controllers/reviewController")
const { protect, admin } = require("../middleware/authMiddleware")

// Review routes
router.get("/product/:productId", reviewController.getProductReviews)
router.post("/product/:productId", protect, reviewController.createReview)
router.put("/:id", protect, reviewController.updateReview)
router.delete("/:id", protect, reviewController.deleteReview)
router.get("/", protect, admin, reviewController.getAllReviews)

module.exports = router
