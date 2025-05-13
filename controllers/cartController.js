const Cart = require("../models/Cart")
const Product = require("../models/Product")

// @desc    Get user's cart
// @route   GET /api/cart
// @access  Private/Optional
exports.getCart = async (req, res) => {
    try {
        let cart

        if (req.user) {
            // Logged in user - get from database
            cart = await Cart.findOne({ user: req.user._id }).populate({
                path: "items.product",
                select: "name price image isOnSale salePrice countInStock",
            })

            if (!cart) {
                // Create a new cart if none exists
                cart = new Cart({ user: req.user._id, items: [] })
                await cart.save()
            }
        } else {
            // Guest user - get from cookie
            const guestCartId = req.cookies.guestCartId

            if (guestCartId) {
                cart = await Cart.findOne({ _id: guestCartId, user: null }).populate({
                    path: "items.product",
                    select: "name price image isOnSale salePrice countInStock",
                })
            }

            if (!cart) {
                // Create a new guest cart
                cart = new Cart({ items: [] })
                await cart.save()

                // Set cookie with cart ID
                res.cookie("guestCartId", cart._id.toString(), {
                    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
                    httpOnly: true,
                    secure: process.env.NODE_ENV === "production",
                })
            }
        }

        // Calculate totals
        let totalItems = 0
        let subtotal = 0

        cart.items.forEach((item) => {
            totalItems += item.quantity
            const price = item.product.isOnSale ? item.product.salePrice : item.product.price
            subtotal += price * item.quantity
        })

        res.json({
            _id: cart._id,
            items: cart.items,
            totalItems,
            subtotal,
        })
    } catch (error) {
        console.error("Get cart error:", error)
        res.status(500).json({ error: "Server error" })
    }
}

// @desc    Add item to cart
// @route   POST /api/cart/add
// @access  Private/Optional
exports.addToCart = async (req, res) => {
    try {
        const { productId, quantity = 1 } = req.body

        // Validate product
        const product = await Product.findById(productId)
        if (!product) {
            return res.status(404).json({ error: "Product not found" })
        }

        // Check if product is in stock
        if (product.countInStock < quantity) {
            return res.status(400).json({ error: "Product is out of stock" })
        }

        let cart

        if (req.user) {
            // Logged in user
            cart = await Cart.findOne({ user: req.user._id })

            if (!cart) {
                cart = new Cart({ user: req.user._id, items: [] })
            }
        } else {
            // Guest user
            const guestCartId = req.cookies.guestCartId

            if (guestCartId) {
                cart = await Cart.findOne({ _id: guestCartId, user: null })
            }

            if (!cart) {
                cart = new Cart({ items: [] })
            }
        }

        // Check if product already in cart
        const itemIndex = cart.items.findIndex((item) => item.product.toString() === productId)

        if (itemIndex > -1) {
            // Product exists in cart, update quantity
            cart.items[itemIndex].quantity += quantity
        } else {
            // Product not in cart, add new item
            cart.items.push({
                product: productId,
                quantity,
            })
        }

        await cart.save()

        // If guest cart, set cookie
        if (!req.user) {
            res.cookie("guestCartId", cart._id.toString(), {
                maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
            })
        }

        // Return updated cart
        const updatedCart = await Cart.findById(cart._id).populate({
            path: "items.product",
            select: "name price image isOnSale salePrice countInStock",
        })

        // Calculate totals
        let totalItems = 0
        let subtotal = 0

        updatedCart.items.forEach((item) => {
            totalItems += item.quantity
            const price = item.product.isOnSale ? item.product.salePrice : item.product.price
            subtotal += price * item.quantity
        })

        res.status(200).json({
            _id: updatedCart._id,
            items: updatedCart.items,
            totalItems,
            subtotal,
            message: "Item added to cart",
        })
    } catch (error) {
        console.error("Add to cart error:", error)
        res.status(500).json({ error: "Server error" })
    }
}

// @desc    Update cart item
// @route   PUT /api/cart/update/:itemId
// @access  Private/Optional
exports.updateCartItem = async (req, res) => {
    try {
        const { quantity } = req.body
        const itemId = req.params.itemId

        if (!quantity || quantity < 1) {
            return res.status(400).json({ error: "Quantity must be at least 1" })
        }

        let cart

        if (req.user) {
            // Logged in user
            cart = await Cart.findOne({ user: req.user._id })
        } else {
            // Guest user
            const guestCartId = req.cookies.guestCartId

            if (!guestCartId) {
                return res.status(404).json({ error: "Cart not found" })
            }

            cart = await Cart.findOne({ _id: guestCartId, user: null })
        }

        if (!cart) {
            return res.status(404).json({ error: "Cart not found" })
        }

        // Find the item in the cart
        const itemIndex = cart.items.findIndex((item) => item._id.toString() === itemId)

        if (itemIndex === -1) {
            return res.status(404).json({ error: "Item not found in cart" })
        }

        // Get product to check stock
        const product = await Product.findById(cart.items[itemIndex].product)

        if (!product) {
            return res.status(404).json({ error: "Product not found" })
        }

        // Check if product is in stock
        if (product.countInStock < quantity) {
            return res.status(400).json({
                error: "Not enough stock available",
                availableStock: product.countInStock,
            })
        }

        // Update quantity
        cart.items[itemIndex].quantity = quantity
        await cart.save()

        // Return updated cart
        const updatedCart = await Cart.findById(cart._id).populate({
            path: "items.product",
            select: "name price image isOnSale salePrice countInStock",
        })

        // Calculate totals
        let totalItems = 0
        let subtotal = 0

        updatedCart.items.forEach((item) => {
            totalItems += item.quantity
            const price = item.product.isOnSale ? item.product.salePrice : item.product.price
            subtotal += price * item.quantity
        })

        res.status(200).json({
            _id: updatedCart._id,
            items: updatedCart.items,
            totalItems,
            subtotal,
            message: "Cart updated",
        })
    } catch (error) {
        console.error("Update cart item error:", error)
        res.status(500).json({ error: "Server error" })
    }
}

// @desc    Remove item from cart
// @route   DELETE /api/cart/remove/:itemId
// @access  Private/Optional
exports.removeFromCart = async (req, res) => {
    try {
        const itemId = req.params.itemId

        let cart

        if (req.user) {
            // Logged in user
            cart = await Cart.findOne({ user: req.user._id })
        } else {
            // Guest user
            const guestCartId = req.cookies.guestCartId

            if (!guestCartId) {
                return res.status(404).json({ error: "Cart not found" })
            }

            cart = await Cart.findOne({ _id: guestCartId, user: null })
        }

        if (!cart) {
            return res.status(404).json({ error: "Cart not found" })
        }

        // Remove the item from the cart
        cart.items = cart.items.filter((item) => item._id.toString() !== itemId)

        await cart.save()

        // Return updated cart
        const updatedCart = await Cart.findById(cart._id).populate({
            path: "items.product",
            select: "name price image isOnSale salePrice countInStock",
        })

        // Calculate totals
        let totalItems = 0
        let subtotal = 0

        updatedCart.items.forEach((item) => {
            totalItems += item.quantity
            const price = item.product.isOnSale ? item.product.salePrice : item.product.price
            subtotal += price * item.quantity
        })

        res.status(200).json({
            _id: updatedCart._id,
            items: updatedCart.items,
            totalItems,
            subtotal,
            message: "Item removed from cart",
        })
    } catch (error) {
        console.error("Remove from cart error:", error)
        res.status(500).json({ error: "Server error" })
    }
}

// @desc    Clear cart
// @route   DELETE /api/cart/clear
// @access  Private/Optional
exports.clearCart = async (req, res) => {
    try {
        let cart

        if (req.user) {
            // Logged in user
            cart = await Cart.findOne({ user: req.user._id })
        } else {
            // Guest user
            const guestCartId = req.cookies.guestCartId

            if (!guestCartId) {
                return res.status(404).json({ error: "Cart not found" })
            }

            cart = await Cart.findOne({ _id: guestCartId, user: null })
        }

        if (!cart) {
            return res.status(404).json({ error: "Cart not found" })
        }

        // Clear all items
        cart.items = []
        await cart.save()

        res.status(200).json({
            _id: cart._id,
            items: [],
            totalItems: 0,
            subtotal: 0,
            message: "Cart cleared",
        })
    } catch (error) {
        console.error("Clear cart error:", error)
        res.status(500).json({ error: "Server error" })
    }
}

// @desc    Merge guest cart with user cart after login
// @route   POST /api/cart/merge
// @access  Private
exports.mergeGuestCart = async (req, res) => {
    try {
        const { guestCartId } = req.body

        if (!guestCartId) {
            return res.status(400).json({ error: "Guest cart ID is required" })
        }

        // Find guest cart
        const guestCart = await Cart.findOne({ _id: guestCartId, user: null })

        if (!guestCart || guestCart.items.length === 0) {
            return res.status(404).json({ error: "Guest cart not found or empty" })
        }

        // Find or create user cart
        let userCart = await Cart.findOne({ user: req.user._id })

        if (!userCart) {
            userCart = new Cart({ user: req.user._id, items: [] })
        }

        // Merge items
        for (const guestItem of guestCart.items) {
            const existingItemIndex = userCart.items.findIndex(
                (item) => item.product.toString() === guestItem.product.toString(),
            )

            if (existingItemIndex > -1) {
                // Item already in user cart, update quantity
                userCart.items[existingItemIndex].quantity += guestItem.quantity
            } else {
                // Add new item to user cart
                userCart.items.push({
                    product: guestItem.product,
                    quantity: guestItem.quantity,
                })
            }
        }

        // Save user cart
        await userCart.save()

        // Delete guest cart
        await Cart.deleteOne({ _id: guestCartId })

        // Clear guest cart cookie
        res.clearCookie("guestCartId")

        // Return updated user cart
        const updatedCart = await Cart.findById(userCart._id).populate({
            path: "items.product",
            select: "name price image isOnSale salePrice countInStock",
        })

        // Calculate totals
        let totalItems = 0
        let subtotal = 0

        updatedCart.items.forEach((item) => {
            totalItems += item.quantity
            const price = item.product.isOnSale ? item.product.salePrice : item.product.price
            subtotal += price * item.quantity
        })

        res.status(200).json({
            _id: updatedCart._id,
            items: updatedCart.items,
            totalItems,
            subtotal,
            message: "Carts merged successfully",
        })
    } catch (error) {
        console.error("Merge cart error:", error)
        res.status(500).json({ error: "Server error" })
    }
}
