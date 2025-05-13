const express = require("express")
const router = express.Router()
const orderController = require("../controllers/orderController")
const { protect, admin } = require("../middleware/authMiddleware")

// User order routes
router.post("/", protect, orderController.createOrder)
router.get("/my-orders", protect, orderController.getMyOrders)
router.get("/:id", protect, orderController.getOrderById)
router.put("/:id/pay", protect, orderController.updateOrderToPaid)
router.put("/:id/cancel", protect, orderController.cancelOrder)

// Admin order routes
router.get("/", protect, admin, orderController.getAllOrders)
router.put("/:id/status", protect, admin, orderController.updateOrderStatus)
router.put("/:id/deliver", protect, admin, orderController.updateOrderToDelivered)

module.exports = router
