const mongoose = require("mongoose")

const categorySchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Please add a category name"],
            unique: true,
            trim: true,
        },
        description: {
            type: String,
            default: "",
        },
        image: {
            type: String,
            default: "/img/placeholder.png",
        },
        isFeatured: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    },
)

const Category = mongoose.model("Category", categorySchema)

module.exports = Category
