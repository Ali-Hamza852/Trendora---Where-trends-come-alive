const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema({
    productId: String,
    name: String,
    email: String,
    review: String,
    rating: Number,
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Review", reviewSchema);
