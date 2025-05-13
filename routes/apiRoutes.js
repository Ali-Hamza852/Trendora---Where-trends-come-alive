const express = require("express");
const router = express.Router();
const Cart = require("../models/Cart");
const Review = require("../models/Review");

// Add to cart
router.post("/cart", async (req, res) => {
  try {
    const { productId, size, color, quantity } = req.body;
    if (!productId || !quantity) {
      return res.status(400).json({ error: "Product ID and quantity are required" });
    }
    const cartItem = new Cart({
      userId: "guest", // Replace with authenticated user ID
      productId,
      size,
      color,
      quantity,
    });
    await cartItem.save();
    res.json({ message: "Product added to cart" });
  } catch (err) {
    console.error("Error adding to cart:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Submit review
router.post("/reviews", async (req, res) => {
  try {
    const { productId, name, email, review, rating } = req.body;
    if (!productId || !name || !email || !review || !rating) {
      return res.status(400).json({ error: "All fields are required" });
    }
    const reviewItem = new Review({
      productId,
      name,
      email,
      review,
      rating,
    });
    await reviewItem.save();
    res.json({ message: "Review submitted" });
  } catch (err) {
    console.error("Error submitting review:", err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;