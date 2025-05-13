const express = require("express")
const router = express.Router()
const cartController = require("../controllers/cartController")
const { protect, optionalAuth } = require("../middleware/authMiddleware")

// Cart routes (some can be accessed by guests)
router.get("/", optionalAuth, cartController.getCart)
router.post("/add", optionalAuth, cartController.addToCart)
router.put("/update/:itemId", optionalAuth, cartController.updateCartItem)
router.delete("/remove/:itemId", optionalAuth, cartController.removeFromCart)
router.delete("/clear", optionalAuth, cartController.clearCart)
router.post("/merge", protect, cartController.mergeGuestCart)

module.exports = router
