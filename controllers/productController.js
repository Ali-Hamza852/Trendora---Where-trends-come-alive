const Product = require("../models/Product")
const Category = require("../models/Category")

// @desc    Get all products with pagination, filtering, and sorting
// @route   GET /api/products
// @access  Public
exports.getAllProducts = async (req, res) => {
    try {
        const pageSize = Number(req.query.pageSize) || 10
        const page = Number(req.query.page) || 1

        // Build filter object
        const filter = {}

        if (req.query.category) {
            filter.category = req.query.category
        }

        if (req.query.minPrice && req.query.maxPrice) {
            filter.price = {
                $gte: Number(req.query.minPrice),
                $lte: Number(req.query.maxPrice),
            }
        } else if (req.query.minPrice) {
            filter.price = { $gte: Number(req.query.minPrice) }
        } else if (req.query.maxPrice) {
            filter.price = { $lte: Number(req.query.maxPrice) }
        }

        // Build sort object
        let sort = {}
        if (req.query.sort) {
            const sortField = req.query.sort.startsWith("-") ? req.query.sort.substring(1) : req.query.sort

            const sortOrder = req.query.sort.startsWith("-") ? -1 : 1
            sort[sortField] = sortOrder
        } else {
            // Default sort by createdAt descending (newest first)
            sort = { createdAt: -1 }
        }

        // Count total products matching the filter
        const count = await Product.countDocuments(filter)

        // Get products
        const products = await Product.find(filter)
        .populate("category", "name")
        .sort(sort)
        .limit(pageSize)
        .skip(pageSize * (page - 1))

        res.json({
            products,
            page,
            pages: Math.ceil(count / pageSize),
                 total: count,
        })
    } catch (error) {
        console.error("Get all products error:", error)
        res.status(500).json({ error: "Server error" })
    }
}

// @desc    Get featured products
// @route   GET /api/products/featured
// @access  Public
exports.getFeaturedProducts = async (req, res) => {
    try {
        const limit = Number(req.query.limit) || 8

        const products = await Product.find({ isFeatured: true }).populate("category", "name").limit(limit)

        res.json(products)
    } catch (error) {
        console.error("Get featured products error:", error)
        res.status(500).json({ error: "Server error" })
    }
}

// @desc    Get new arrivals (most recently added products)
// @route   GET /api/products/new-arrivals
// @access  Public
exports.getNewArrivals = async (req, res) => {
    try {
        const limit = Number(req.query.limit) || 8

        const products = await Product.find({}).populate("category", "name").sort({ createdAt: -1 }).limit(limit)

        res.json(products)
    } catch (error) {
        console.error("Get new arrivals error:", error)
        res.status(500).json({ error: "Server error" })
    }
}

// @desc    Get best sellers (products with highest sales)
// @route   GET /api/products/best-sellers
// @access  Public
exports.getBestSellers = async (req, res) => {
    try {
        const limit = Number(req.query.limit) || 8

        const products = await Product.find({}).populate("category", "name").sort({ salesCount: -1 }).limit(limit)

        res.json(products)
    } catch (error) {
        console.error("Get best sellers error:", error)
        res.status(500).json({ error: "Server error" })
    }
}

// @desc    Get product by ID
// @route   GET /api/products/:id
// @access  Public
exports.getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id).populate("category", "name")

        if (product) {
            res.json(product)
        } else {
            res.status(404).json({ error: "Product not found" })
        }
    } catch (error) {
        console.error("Get product by ID error:", error)
        res.status(500).json({ error: "Server error" })
    }
}

// @desc    Get products by category
// @route   GET /api/products/category/:categoryId
// @access  Public
exports.getProductsByCategory = async (req, res) => {
    try {
        const pageSize = Number(req.query.pageSize) || 10
        const page = Number(req.query.page) || 1

        const categoryId = req.params.categoryId

        // Get the category and its subcategories
        const category = await Category.findById(categoryId)
        if (!category) {
            return res.status(404).json({ error: "Category not found" })
        }

        // Count total products in this category
        const count = await Product.countDocuments({ category: categoryId })

        // Get products
        const products = await Product.find({ category: categoryId })
        .populate("category", "name")
        .limit(pageSize)
        .skip(pageSize * (page - 1))

        res.json({
            products,
            page,
            pages: Math.ceil(count / pageSize),
                 total: count,
        })
    } catch (error) {
        console.error("Get products by category error:", error)
        res.status(500).json({ error: "Server error" })
    }
}

// @desc    Search products
// @route   GET /api/products/search/:keyword
// @access  Public
exports.searchProducts = async (req, res) => {
    try {
        const keyword = req.params.keyword
        const pageSize = Number(req.query.pageSize) || 10
        const page = Number(req.query.page) || 1

        // Create search filter
        const searchFilter = {
            $or: [{ name: { $regex: keyword, $options: "i" } }, { description: { $regex: keyword, $options: "i" } }],
        }

        // Count total matching products
        const count = await Product.countDocuments(searchFilter)

        // Get products
        const products = await Product.find(searchFilter)
        .populate("category", "name")
        .limit(pageSize)
        .skip(pageSize * (page - 1))

        res.json({
            products,
            page,
            pages: Math.ceil(count / pageSize),
                 total: count,
        })
    } catch (error) {
        console.error("Search products error:", error)
        res.status(500).json({ error: "Server error" })
    }
}

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Admin
exports.createProduct = async (req, res) => {
    try {
        const {
            name,
            price,
            description,
            image,
            brand,
            category,
            countInStock,
            isFeatured,
            isOnSale,
            salePrice,
            additionalImages,
        } = req.body

        // Check if category exists
        const categoryExists = await Category.findById(category)
        if (!categoryExists) {
            return res.status(400).json({ error: "Invalid category" })
        }

        const product = new Product({
            name,
            price,
            description,
            image: image || "/img/placeholder.png",
            brand,
            category,
            countInStock: countInStock || 0,
            isFeatured: isFeatured || false,
            isOnSale: isOnSale || false,
            salePrice: salePrice || price,
            additionalImages: additionalImages || [],
            user: req.user._id,
        })

        const createdProduct = await product.save()
        res.status(201).json(createdProduct)
    } catch (error) {
        console.error("Create product error:", error)
        res.status(500).json({ error: "Server error" })
    }
}

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin
exports.updateProduct = async (req, res) => {
    try {
        const {
            name,
            price,
            description,
            image,
            brand,
            category,
            countInStock,
            isFeatured,
            isOnSale,
            salePrice,
            additionalImages,
        } = req.body

        const product = await Product.findById(req.params.id)

        if (product) {
            // Check if category exists if it's being updated
            if (category && category !== product.category.toString()) {
                const categoryExists = await Category.findById(category)
                if (!categoryExists) {
                    return res.status(400).json({ error: "Invalid category" })
                }
            }

            product.name = name || product.name
            product.price = price || product.price
            product.description = description || product.description
            product.image = image || product.image
            product.brand = brand || product.brand
            product.category = category || product.category
            product.countInStock = countInStock !== undefined ? countInStock : product.countInStock
            product.isFeatured = isFeatured !== undefined ? isFeatured : product.isFeatured
            product.isOnSale = isOnSale !== undefined ? isOnSale : product.isOnSale
            product.salePrice = salePrice || product.salePrice

            if (additionalImages) {
                product.additionalImages = additionalImages
            }

            const updatedProduct = await product.save()
            res.json(updatedProduct)
        } else {
            res.status(404).json({ error: "Product not found" })
        }
    } catch (error) {
        console.error("Update product error:", error)
        res.status(500).json({ error: "Server error" })
    }
}

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
exports.deleteProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id)

        if (product) {
            await product.deleteOne()
            res.json({ message: "Product removed" })
        } else {
            res.status(404).json({ error: "Product not found" })
        }
    } catch (error) {
        console.error("Delete product error:", error)
        res.status(500).json({ error: "Server error" })
    }
}

// @desc    Upload product image
// @route   POST /api/products/:id/upload
// @access  Private/Admin
exports.uploadProductImage = async (req, res) => {
    try {
        // Note: This is a placeholder. In a real implementation, you would use
        // a file upload middleware like multer and handle the file storage.
        // For now, we'll just update the image URL in the product.

        const product = await Product.findById(req.params.id)

        if (!product) {
            return res.status(404).json({ error: "Product not found" })
        }

        const imageUrl = req.body.imageUrl

        if (!imageUrl) {
            return res.status(400).json({ error: "Image URL is required" })
        }

        product.image = imageUrl
        await product.save()

        res.json({ message: "Image uploaded successfully", imageUrl })
    } catch (error) {
        console.error("Upload product image error:", error)
        res.status(500).json({ error: "Server error" })
    }
}
