const Order = require("../models/Order")
const Cart = require("../models/Cart")
const Product = require("../models/Product")
const emailService = require("../services/emailService")

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
exports.createOrder = async (req, res) => {
    try {
        const { orderItems, shippingAddress, paymentMethod, itemsPrice, taxPrice, shippingPrice, totalPrice } = req.body

        if (!orderItems || orderItems.length === 0) {
            return res.status(400).json({ error: "No order items" })
        }

        // Validate order items and check stock
        for (const item of orderItems) {
            const product = await Product.findById(item.product)

            if (!product) {
                return res.status(404).json({
                    error: `Product not found: ${item.product}`,
                })
            }

            if (product.countInStock < item.quantity) {
                return res.status(400).json({
                    error: `Not enough stock for ${product.name}. Available: ${product.countInStock}`,
                })
            }
        }

        // Create order
        const order = new Order({
            user: req.user._id,
            orderItems,
            shippingAddress,
            paymentMethod,
            itemsPrice,
            taxPrice,
            shippingPrice,
            totalPrice,
        })

        const createdOrder = await order.save()

        // Update product stock
        for (const item of orderItems) {
            const product = await Product.findById(item.product)
            product.countInStock -= item.quantity
            product.salesCount = (product.salesCount || 0) + item.quantity
            await product.save()
        }

        // Clear user's cart
        await Cart.findOneAndUpdate({ user: req.user._id }, { $set: { items: [] } })

        // Send order confirmation email
        try {
            await emailService.sendOrderConfirmationEmail(req.user.email, req.user.name, createdOrder)
        } catch (emailError) {
            console.error("Error sending order confirmation email:", emailError)
            // Continue with order creation even if email fails
        }

        res.status(201).json(createdOrder)
    } catch (error) {
        console.error("Create order error:", error)
        res.status(500).json({ error: "Server error" })
    }
}

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
exports.getOrderById = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id).populate("user", "name email").populate({
            path: "orderItems.product",
            select: "name image price",
        })

        if (order) {
            // Check if the order belongs to the user or if the user is an admin
            if (order.user._id.toString() !== req.user._id.toString() && !req.user.isAdmin) {
                return res.status(403).json({ error: "Not authorized to view this order" })
            }

            res.json(order)
        } else {
            res.status(404).json({ error: "Order not found" })
        }
    } catch (error) {
        console.error("Get order by ID error:", error)
        res.status(500).json({ error: "Server error" })
    }
}

// @desc    Get logged in user orders
// @route   GET /api/orders/my-orders
// @access  Private
exports.getMyOrders = async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 })

        res.json(orders)
    } catch (error) {
        console.error("Get my orders error:", error)
        res.status(500).json({ error: "Server error" })
    }
}

// @desc    Update order to paid
// @route   PUT /api/orders/:id/pay
// @access  Private
exports.updateOrderToPaid = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id)

        if (order) {
            // Check if the order belongs to the user or if the user is an admin
            if (order.user.toString() !== req.user._id.toString() && !req.user.isAdmin) {
                return res.status(403).json({ error: "Not authorized to update this order" })
            }

            // Check if order is already paid
            if (order.isPaid) {
                return res.status(400).json({ error: "Order is already paid" })
            }

            order.isPaid = true
            order.paidAt = Date.now()
            order.paymentResult = {
                id: req.body.id,
                status: req.body.status,
                update_time: req.body.update_time,
                email_address: req.body.payer.email_address,
            }

            const updatedOrder = await order.save()

            res.json(updatedOrder)
        } else {
            res.status(404).json({ error: "Order not found" })
        }
    } catch (error) {
        console.error("Update order to paid error:", error)
        res.status(500).json({ error: "Server error" })
    }
}

// @desc    Cancel order
// @route   PUT /api/orders/:id/cancel
// @access  Private
exports.cancelOrder = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id)

        if (order) {
            // Check if the order belongs to the user or if the user is an admin
            if (order.user.toString() !== req.user._id.toString() && !req.user.isAdmin) {
                return res.status(403).json({ error: "Not authorized to cancel this order" })
            }

            // Check if order can be cancelled
            if (order.isDelivered) {
                return res.status(400).json({ error: "Cannot cancel delivered order" })
            }

            order.status = "Cancelled"
            order.cancelledAt = Date.now()

            const updatedOrder = await order.save()

            // Restore product stock
            for (const item of order.orderItems) {
                const product = await Product.findById(item.product)
                if (product) {
                    product.countInStock += item.quantity
                    product.salesCount = Math.max(0, (product.salesCount || 0) - item.quantity)
                    await product.save()
                }
            }

            res.json(updatedOrder)
        } else {
            res.status(404).json({ error: "Order not found" })
        }
    } catch (error) {
        console.error("Cancel order error:", error)
        res.status(500).json({ error: "Server error" })
    }
}

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private/Admin
exports.getAllOrders = async (req, res) => {
    try {
        const pageSize = Number(req.query.pageSize) || 10
        const page = Number(req.query.page) || 1

        // Build filter object
        const filter = {}

        if (req.query.status) {
            filter.status = req.query.status
        }

        // Count total orders matching the filter
        const count = await Order.countDocuments(filter)

        // Get orders
        const orders = await Order.find(filter)
        .populate("user", "id name")
        .sort({ createdAt: -1 })
        .limit(pageSize)
        .skip(pageSize * (page - 1))

        res.json({
            orders,
            page,
            pages: Math.ceil(count / pageSize),
                 total: count,
        })
    } catch (error) {
        console.error("Get all orders error:", error)
        res.status(500).json({ error: "Server error" })
    }
}

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
exports.updateOrderStatus = async (req, res) => {
    try {
        const { status } = req.body

        if (!status) {
            return res.status(400).json({ error: "Status is required" })
        }

        const order = await Order.findById(req.params.id)

        if (order) {
            order.status = status

            const updatedOrder = await order.save()

            res.json(updatedOrder)
        } else {
            res.status(404).json({ error: "Order not found" })
        }
    } catch (error) {
        console.error("Update order status error:", error)
        res.status(500).json({ error: "Server error" })
    }
}

// @desc    Update order to delivered
// @route   PUT /api/orders/:id/deliver
// @access  Private/Admin
exports.updateOrderToDelivered = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id)

        if (order) {
            // Check if order is already delivered
            if (order.isDelivered) {
                return res.status(400).json({ error: "Order is already delivered" })
            }

            // Check if order is paid
            if (!order.isPaid) {
                return res.status(400).json({ error: "Order is not paid yet" })
            }

            order.isDelivered = true
            order.deliveredAt = Date.now()
            order.status = "Delivered"

            const updatedOrder = await order.save()

            res.json(updatedOrder)
        } else {
            res.status(404).json({ error: "Order not found" })
        }
    } catch (error) {
        console.error("Update order to delivered error:", error)
        res.status(500).json({ error: "Server error" })
    }
}
