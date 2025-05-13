const Contact = require("../models/Contact")
const emailService = require("../services/emailService")

// @desc    Submit contact form
// @route   POST /api/contact
// @access  Public
exports.submitContactForm = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body

    if (!name || !email || !message) {
      return res.status(400).json({ error: "Please fill all required fields" })
    }

    // Create new contact message
    const contact = new Contact({
      name,
      email,
      subject: subject || "Contact Form Submission",
      message,
    })

    await contact.save()

    // Send confirmation email to user
    try {
      await emailService.sendContactConfirmationEmail(email, name)
    } catch (emailError) {
      console.error("Error sending contact confirmation email:", emailError)
      // Continue with form submission even if email fails
    }

    // Send notification to admin
    try {
      await emailService.sendContactNotificationEmail(
        process.env.ADMIN_EMAIL,
        name,
        email,
        subject || "Contact Form Submission",
        message,
      )
    } catch (emailError) {
      console.error("Error sending admin notification email:", emailError)
      // Continue with form submission even if email fails
    }

    res.status(201).json({ message: "Contact form submitted successfully" })
  } catch (error) {
    console.error("Contact form submission error:", error)
    res.status(500).json({ error: "Server error" })
  }
}

// @desc    Get all contact messages
// @route   GET /api/contact
// @access  Private/Admin
exports.getAllContactMessages = async (req, res) => {
  try {
    const pageSize = Number(req.query.pageSize) || 10
    const page = Number(req.query.page) || 1

    // Build filter object
    const filter = {}

    if (req.query.status) {
      filter.status = req.query.status
    }

    // Count total messages matching the filter
    const count = await Contact.countDocuments(filter)

    // Get messages
    const messages = await Contact.find(filter)
    .sort({ createdAt: -1 })
    .limit(pageSize)
    .skip(pageSize * (page - 1))

    res.json({
      messages,
      page,
      pages: Math.ceil(count / pageSize),
             total: count,
    })
  } catch (error) {
    console.error("Get all contact messages error:", error)
    res.status(500).json({ error: "Server error" })
  }
}

// @desc    Get contact message by ID
// @route   GET /api/contact/:id
// @access  Private/Admin
exports.getContactMessageById = async (req, res) => {
  try {
    const message = await Contact.findById(req.params.id)

    if (message) {
      res.json(message)
    } else {
      res.status(404).json({ error: "Message not found" })
    }
  } catch (error) {
    console.error("Get contact message by ID error:", error)
    res.status(500).json({ error: "Server error" })
  }
}

// @desc    Respond to contact message
// @route   PUT /api/contact/:id/respond
// @access  Private/Admin
exports.respondToContactMessage = async (req, res) => {
  try {
    const { response } = req.body

    if (!response) {
      return res.status(400).json({ error: "Response is required" })
    }

    const message = await Contact.findById(req.params.id)

    if (!message) {
      return res.status(404).json({ error: "Message not found" })
    }

    // Update message status and response
    message.status = "Responded"
    message.response = response
    message.respondedAt = Date.now()
    message.respondedBy = req.user._id

    await message.save()

    // Send response email to the contact
    try {
      await emailService.sendContactResponseEmail(
        message.email,
        message.name,
        message.subject,
        message.message,
        response,
      )
    } catch (emailError) {
      console.error("Error sending contact response email:", emailError)
      // Continue with response update even if email fails
    }

    res.json({ message: "Response sent successfully" })
  } catch (error) {
    console.error("Respond to contact message error:", error)
    res.status(500).json({ error: "Server error" })
  }
}

// @desc    Delete contact message
// @route   DELETE /api/contact/:id
// @access  Private/Admin
exports.deleteContactMessage = async (req, res) => {
  try {
    const message = await Contact.findById(req.params.id)

    if (!message) {
      return res.status(404).json({ error: "Message not found" })
    }

    await message.deleteOne()

    res.json({ message: "Contact message deleted" })
  } catch (error) {
    console.error("Delete contact message error:", error)
    res.status(500).json({ error: "Server error" })
  }
}
