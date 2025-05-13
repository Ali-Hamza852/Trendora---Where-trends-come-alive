const express = require("express")
const router = express.Router()
const productController = require("../controllers/productController")
const { protect, admin } = require("../middleware/authMiddleware")

// Public routes
router.get("/", productController.getAllProducts)
router.get("/featured", productController.getFeaturedProducts)
router.get("/new-arrivals", productController.getNewArrivals)
router.get("/best-sellers", productController.getBestSellers)
router.get("/:id", productController.getProductById)
router.get("/category/:categoryId", productController.getProductsByCategory)
router.get("/search/:keyword", productController.searchProducts)

// Protected routes (admin only)
router.post("/", protect, admin, productController.createProduct)
router.put("/:id", protect, admin, productController.updateProduct)
router.delete("/:id", protect, admin, productController.deleteProduct)
router.post("/:id/upload", protect, admin, productController.uploadProductImage)

module.exports = router
