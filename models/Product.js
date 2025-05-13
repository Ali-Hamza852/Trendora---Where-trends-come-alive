const mongoose = require("mongoose")

const ProductSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Please add a product name"],
            trim: true,
            maxlength: [100, "Name cannot be more than 100 characters"],
        },
        description: {
            type: String,
            required: [true, "Please add a description"],
            maxlength: [2000, "Description cannot be more than 2000 characters"],
        },
        price: {
            type: Number,
            required: [true, "Please add a price"],
            min: [0, "Price must be at least 0"],
        },
        isOnSale: {
            type: Boolean,
            default: false,
        },
        salePrice: {
            type: Number,
            min: [0, "Sale price must be at least 0"],
        },
        image: {
            type: String,
            default: "/img/product01.png",
        },
        additionalImages: [String],
        category: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Category",
            required: true,
        },
        brand: {
            type: String,
            required: [true, "Please add a brand"],
            trim: true,
        },
        countInStock: {
            type: Number,
            required: [true, "Please add count in stock"],
            min: [0, "Count in stock must be at least 0"],
            default: 0,
        },
        rating: {
            type: Number,
            default: 0,
        },
        numReviews: {
            type: Number,
            default: 0,
        },
        isFeatured: {
            type: Boolean,
            default: false,
        },
        isNew: {
            type: Boolean,
            default: true,
        },
        tags: [String],
        specifications: {
            type: Map,
            of: String,
        },
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    },
)

// Virtual for reviews
ProductSchema.virtual("reviews", {
    ref: "Review",
    localField: "_id",
    foreignField: "product",
        justOne: false,
})

// Calculate average rating when saving a product
ProductSchema.pre("save", async function (next) {
    if (this.isModified("rating") || this.isModified("numReviews")) {
        // No need to recalculate here as it's done in the review controller
        next()
    }
    next()
})

module.exports = mongoose.model("Product", ProductSchema)
