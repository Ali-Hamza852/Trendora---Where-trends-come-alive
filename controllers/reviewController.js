const Review = require("../models/Review")
const Product = require("../models/Product")

// @desc    Get product reviews
// @route   GET /api/reviews/product/:productId
// @access  Public
exports.getProductReviews = async (req, res) => {
    try {
        const productId = req.params.productId

        const reviews = await Review.find({ product: productId }).populate("user", "name").sort({ createdAt: -1 })

        res.json(reviews)
    } catch (error) {
        console.error("Get product reviews error:", error)
        res.status(500).json({ error: "Server error" })
    }
}

// @desc    Create product review
// @route   POST /api/reviews/product/:productId
// @access  Private
exports.createReview = async (req, res) => {
    try {
        const { rating, comment } = req.body
        const productId = req.params.productId

        // Check if product exists
        const product = await Product.findById(productId)
        if (!product) {
            return res.status(404).json({ error: "Product not found" })
        }

        // Check if user already reviewed this product
        const alreadyReviewed = await Review.findOne({
            user: req.user._id,
            product: productId,
        })

        if (alreadyReviewed) {
            return res.status(400).json({ error: "Product already reviewed" })
        }

        // Create review
        const review = new Review({
            user: req.user._id,
            product: productId,
            rating: Number(rating),
                                  comment,
        })

        await review.save()

        // Update product rating
        const reviews = await Review.find({ product: productId })
        const totalRating = reviews.reduce((acc, item) => acc + item.rating, 0)
        product.rating = totalRating / reviews.length
        product.numReviews = reviews.length

        await product.save()

        res.status(201).json({ message: "Review added" })
    } catch (error) {
        console.error("Create review error:", error)
        res.status(500).json({ error: "Server error" })
    }
}

// @desc    Update review
// @route   PUT /api/reviews/:id
// @access  Private
exports.updateReview = async (req, res) => {
    try {
        const { rating, comment } = req.body

        const review = await Review.findById(req.params.id)

        if (review) {
            // Check if the review belongs to the user
            if (review.user.toString() !== req.user._id.toString() && !req.user.isAdmin) {
                return res.status(403).json({ error: "Not authorized to update this review" })
            }

            review.rating = Number(rating) || review.rating
            review.comment = comment || review.comment

            await review.save()

            // Update product rating
            const productId = review.product
            const reviews = await Review.find({ product: productId })
            const totalRating = reviews.reduce((acc, item) => acc + item.rating, 0)

            const product = await Product.findById(productId)
            product.rating = totalRating / reviews.length

            await product.save()

            res.json({ message: "Review updated" })
        } else {
            res.status(404).json({ error: "Review not found" })
        }
    } catch (error) {
        console.error("Update review error:", error)
        res.status(500).json({ error: "Server error" })
    }
}

// @desc    Delete review
// @route   DELETE /api/reviews/:id
// @access  Private
exports.deleteReview = async (req, res) => {
    try {
        const review = await Review.findById(req.params.id)

        if (review) {
            // Check if the review belongs to the user or if the user is an admin
            if (review.user.toString() !== req.user._id.toString() && !req.user.isAdmin) {
                return res.status(403).json({ error: "Not authorized to delete this review" })
            }

            const productId = review.product

            await review.deleteOne()

            // Update product rating
            const reviews = await Review.find({ product: productId })

            if (reviews.length > 0) {
                const totalRating = reviews.reduce((acc, item) => acc + item.rating, 0)

                const product = await Product.findById(productId)
                product.rating = totalRating / reviews.length
                product.numReviews = reviews.length

                await product.save()
            } else {
                // No reviews left, reset rating
                const product = await Product.findById(productId)
                product.rating = 0
                product.numReviews = 0

                await product.save()
            }

            res.json({ message: "Review removed" })
        } else {
            res.status(404).json({ error: "Review not found" })
        }
    } catch (error) {
        console.error("Delete review error:", error)
        res.status(500).json({ error: "Server error" })
    }
}

// @desc    Get all reviews (admin)
// @route   GET /api/reviews
// @access  Private/Admin
exports.getAllReviews = async (req, res) => {
    try {
        const pageSize = Number(req.query.pageSize) || 10
        const page = Number(req.query.page) || 1

        // Count total reviews
        const count = await Review.countDocuments({})

        // Get reviews
        const reviews = await Review.find({})
        .populate("user", "name")
        .populate("product", "name")
        .sort({ createdAt: -1 })
        .limit(pageSize)
        .skip(pageSize * (page - 1))

        res.json({
            reviews,
            page,
            pages: Math.ceil(count / pageSize),
                 total: count,
        })
    } catch (error) {
        console.error("Get all reviews error:", error)
        res.status(500).json({ error: "Server error" })
    }
}
