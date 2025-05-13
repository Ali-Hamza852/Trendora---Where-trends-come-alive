const Category = require("../models/Category")

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
exports.getAllCategories = async (req, res) => {
    try {
        const categories = await Category.find({}).sort({ name: 1 })
        res.json(categories)
    } catch (error) {
        console.error("Get all categories error:", error)
        res.status(500).json({ error: "Server error" })
    }
}

// @desc    Get featured categories
// @route   GET /api/categories/featured
// @access  Public
exports.getFeaturedCategories = async (req, res) => {
    try {
        const limit = Number(req.query.limit) || 5

        const categories = await Category.find({ isFeatured: true }).limit(limit)

        res.json(categories)
    } catch (error) {
        console.error("Get featured categories error:", error)
        res.status(500).json({ error: "Server error" })
    }
}

// @desc    Get category by ID
// @route   GET /api/categories/:id
// @access  Public
exports.getCategoryById = async (req, res) => {
    try {
        const category = await Category.findById(req.params.id)

        if (category) {
            res.json(category)
        } else {
            res.status(404).json({ error: "Category not found" })
        }
    } catch (error) {
        console.error("Get category by ID error:", error)
        res.status(500).json({ error: "Server error" })
    }
}

// @desc    Create a category
// @route   POST /api/categories
// @access  Private/Admin
exports.createCategory = async (req, res) => {
    try {
        const { name, description, image, isFeatured } = req.body

        // Check if category already exists
        const categoryExists = await Category.findOne({ name })
        if (categoryExists) {
            return res.status(400).json({ error: "Category already exists" })
        }

        const category = new Category({
            name,
            description,
            image: image || "/img/placeholder.png",
            isFeatured: isFeatured || false,
        })

        const createdCategory = await category.save()
        res.status(201).json(createdCategory)
    } catch (error) {
        console.error("Create category error:", error)
        res.status(500).json({ error: "Server error" })
    }
}

// @desc    Update a category
// @route   PUT /api/categories/:id
// @access  Private/Admin
exports.updateCategory = async (req, res) => {
    try {
        const { name, description, image, isFeatured } = req.body

        const category = await Category.findById(req.params.id)

        if (category) {
            // If name is being changed, check if the new name already exists
            if (name && name !== category.name) {
                const categoryExists = await Category.findOne({ name })
                if (categoryExists) {
                    return res.status(400).json({ error: "Category with this name already exists" })
                }
            }

            category.name = name || category.name
            category.description = description || category.description
            category.image = image || category.image
            category.isFeatured = isFeatured !== undefined ? isFeatured : category.isFeatured

            const updatedCategory = await category.save()
            res.json(updatedCategory)
        } else {
            res.status(404).json({ error: "Category not found" })
        }
    } catch (error) {
        console.error("Update category error:", error)
        res.status(500).json({ error: "Server error" })
    }
}

// @desc    Delete a category
// @route   DELETE /api/categories/:id
// @access  Private/Admin
exports.deleteCategory = async (req, res) => {
    try {
        const category = await Category.findById(req.params.id)

        if (category) {
            await category.deleteOne()
            res.json({ message: "Category removed" })
        } else {
            res.status(404).json({ error: "Category not found" })
        }
    } catch (error) {
        console.error("Delete category error:", error)
        res.status(500).json({ error: "Server error" })
    }
}
