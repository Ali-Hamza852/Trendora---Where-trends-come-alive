const Contact = require("../models/contact");
const Newsletter = require("../models/newsletter");
const emailService = require("../services/emailService");

exports.sendContactEmail = async (req, res) => {
    try {
        const { name, email, subject, message } = req.body;

        // Validate required fields
        if (!name || !email || !message) {
            return res.status(400).json({ success: false, message: "Please fill in all required fields" });
        }

        // Save contact message to database
        const contact = new Contact({ name, email, subject, message });
        await contact.save();

        // Send email
        await emailService.sendContactEmail(name, email, subject, message);

        res.status(200).json({ success: true, message: "Message sent successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Failed to send message" });
    }
};

exports.sendOrderConfirmation = async (req, res) => {
    try {
        const { orderNumber, customerEmail, customerName, items, total, shippingAddress } = req.body;

        // Validate required fields
        if (!customerEmail || !orderNumber || !items || !total || !shippingAddress) {
            return res
            .status(400)
            .json({ success: false, message: "Missing required order details" });
        }

        // Send order confirmation email
        await emailService.sendOrderConfirmation(customerEmail, {
            orderNumber,
            customerName,
            items,
            total,
            shippingAddress,
        });

        res.status(200).json({ success: true, message: "Order confirmation sent" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Failed to send order confirmation" });
    }
};

exports.subscribeToNewsletter = async (req, res) => {
    try {
        const { email } = req.body;

        // Validate email
        if (!email) {
            return res.status(400).json({ success: false, message: "Email is required" });
        }

        // Save email to newsletter subscribers
        try {
            const subscriber = new Newsletter({ email });
            await subscriber.save();
        } catch (error) {
            if (error.code === 11000) {
                return res.status(400).json({ success: false, message: "Email already subscribed" });
            }
            throw error;
        }

        // Send confirmation email
        await emailService.sendNewsletterConfirmation(email);

        res.status(200).json({ success: true, message: "Subscribed successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Failed to subscribe" });
    }
};

exports.sendPasswordReset = async (req, res) => {
    try {
        const { email } = req.body;

        // Validate email
        if (!email) {
            return res.status(400).json({ success: false, message: "Email is required" });
        }

        // Generate a dummy reset link (in a real app, use a token-based system)
        const resetLink = `http://localhost:${process.env.PORT}/reset-password?email=${email}`;

        // Send password reset email
        await emailService.sendPasswordReset(email, resetLink);

        res.status(200).json({ success: true, message: "Password reset link sent" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Failed to send reset link" });
    }
};
