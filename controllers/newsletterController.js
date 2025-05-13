const Newsletter = require("../models/Newsletter")
const emailService = require("../services/emailService")

// @desc    Subscribe to newsletter
// @route   POST /api/newsletter/subscribe
// @access  Public
exports.subscribe = async (req, res) => {
  try {
    const { email } = req.body

    if (!email) {
      return res.status(400).json({ error: "Email is required" })
    }

    // Check if already subscribed
    const existingSubscription = await Newsletter.findOne({ email })

    if (existingSubscription) {
      return res.status(400).json({ error: "Email is already subscribed" })
    }

    // Create new subscription
    const subscription = new Newsletter({
      email,
    })

    await subscription.save()

    // Send welcome email
    try {
      await emailService.sendNewsletterWelcomeEmail(email)
    } catch (emailError) {
      console.error("Error sending newsletter welcome email:", emailError)
      // Continue with subscription even if email fails
    }

    res.status(201).json({ message: "Successfully subscribed to newsletter" })
  } catch (error) {
    console.error("Newsletter subscribe error:", error)
    res.status(500).json({ error: "Server error" })
  }
}

// @desc    Unsubscribe from newsletter
// @route   POST /api/newsletter/unsubscribe
// @access  Public
exports.unsubscribe = async (req, res) => {
  try {
    const { email } = req.body

    if (!email) {
      return res.status(400).json({ error: "Email is required" })
    }

    // Find and remove subscription
    const subscription = await Newsletter.findOneAndDelete({ email })

    if (!subscription) {
      return res.status(404).json({ error: "Email is not subscribed" })
    }

    res.status(200).json({ message: "Successfully unsubscribed from newsletter" })
  } catch (error) {
    console.error("Newsletter unsubscribe error:", error)
    res.status(500).json({ error: "Server error" })
  }
}

// @desc    Get all newsletter subscribers
// @route   GET /api/newsletter/subscribers
// @access  Private/Admin
exports.getAllSubscribers = async (req, res) => {
  try {
    const pageSize = Number(req.query.pageSize) || 20
    const page = Number(req.query.page) || 1

    // Count total subscribers
    const count = await Newsletter.countDocuments({})

    // Get subscribers
    const subscribers = await Newsletter.find({})
    .sort({ createdAt: -1 })
    .limit(pageSize)
    .skip(pageSize * (page - 1))

    res.json({
      subscribers,
      page,
      pages: Math.ceil(count / pageSize),
             total: count,
    })
  } catch (error) {
    console.error("Get all subscribers error:", error)
    res.status(500).json({ error: "Server error" })
  }
}

// @desc    Send newsletter to all subscribers
// @route   POST /api/newsletter/send
// @access  Private/Admin
exports.sendNewsletter = async (req, res) => {
  try {
    const { subject, content } = req.body

    if (!subject || !content) {
      return res.status(400).json({ error: "Subject and content are required" })
    }

    // Get all subscribers
    const subscribers = await Newsletter.find({})

    if (subscribers.length === 0) {
      return res.status(404).json({ error: "No subscribers found" })
    }

    // Send newsletter to all subscribers
    const emails = subscribers.map((sub) => sub.email)

    try {
      await emailService.sendNewsletterEmail(emails, subject, content)

      res.status(200).json({
        message: "Newsletter sent successfully",
        recipientCount: emails.length,
      })
    } catch (emailError) {
      console.error("Error sending newsletter:", emailError)
      res.status(500).json({ error: "Error sending newsletter" })
    }
  } catch (error) {
    console.error("Send newsletter error:", error)
    res.status(500).json({ error: "Server error" })
  }
}
