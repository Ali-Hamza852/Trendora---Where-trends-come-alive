const nodemailer = require("nodemailer")
const fs = require("fs")
const path = require("path")
const ejs = require("ejs")

// Create transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: process.env.EMAIL_SECURE === "true",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
})

// Verify transporter connection
transporter.verify((error, success) => {
  if (error) {
    console.error("Email service error:", error)
  } else {
    console.log("Email service is ready to send messages")
  }
})

// Helper to render email template
const renderTemplate = async (templateName, data) => {
  try {
    const templatePath = path.join(__dirname, "..", "views", "email-templates", `${templateName}.ejs`)

    // Check if template exists
    if (!fs.existsSync(templatePath)) {
      console.error(`Email template not found: ${templatePath}`)
      // Fallback to simple HTML
      return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h1 style="color: #333;">${data.subject || "Trendora"}</h1>
      <p>Hello ${data.name},</p>
      <p>${data.message || "Thank you for using our service."}</p>
      ${data.actionUrl ? `<a href="${data.actionUrl}" style="display: inline-block; padding: 10px 20px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px;">Click Here</a>` : ""}
      <p>Best regards,<br>The Trendora Team</p>
      </div>
      `
    }

    // Read template file
    const template = fs.readFileSync(templatePath, "utf-8")

    // Render template with data
    return ejs.render(template, data)
  } catch (error) {
    console.error("Template rendering error:", error)
    // Fallback to simple HTML
    return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
    <h1 style="color: #333;">Trendora</h1>
    <p>Hello ${data.name},</p>
    <p>Thank you for using our service.</p>
    <p>Best regards,<br>The Trendora Team</p>
    </div>
    `
  }
}

// Send welcome email with verification link
exports.sendWelcomeEmail = async (to, data) => {
  try {
    const html = await renderTemplate("welcome", {
      name: data.name,
      verificationUrl: data.verificationUrl,
      subject: "Welcome to Trendora - Please Verify Your Email",
    })

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to,
      subject: "Welcome to Trendora - Please Verify Your Email",
      html,
    }

    await transporter.sendMail(mailOptions)
    console.log(`Welcome email sent to ${to}`)
    return true
  } catch (error) {
    console.error("Send welcome email error:", error)
    return false
  }
}

// Send password reset email
exports.sendPasswordResetEmail = async (to, data) => {
  try {
    const html = await renderTemplate("password-reset", {
      name: data.name,
      resetUrl: data.resetUrl,
      subject: "Trendora - Password Reset Request",
    })

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to,
      subject: "Trendora - Password Reset Request",
      html,
    }

    await transporter.sendMail(mailOptions)
    console.log(`Password reset email sent to ${to}`)
    return true
  } catch (error) {
    console.error("Send password reset email error:", error)
    return false
  }
}

// Send password change confirmation email
exports.sendPasswordChangeConfirmationEmail = async (to, data) => {
  try {
    const html = await renderTemplate("password-change", {
      name: data.name,
      subject: "Trendora - Your Password Has Been Changed",
      message:
      "Your password has been successfully changed. If you did not make this change, please contact us immediately.",
    })

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to,
      subject: "Trendora - Your Password Has Been Changed",
      html,
    }

    await transporter.sendMail(mailOptions)
    console.log(`Password change confirmation email sent to ${to}`)
    return true
  } catch (error) {
    console.error("Send password change confirmation email error:", error)
    return false
  }
}

// Send order confirmation email
exports.sendOrderConfirmationEmail = async (to, data) => {
  try {
    const html = await renderTemplate("order-confirmation", {
      name: data.name,
      orderId: data.orderId,
      orderDate: data.orderDate,
      items: data.items,
      total: data.total,
      shippingAddress: data.shippingAddress,
      subject: "Trendora - Order Confirmation",
    })

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to,
      subject: `Trendora - Order Confirmation #${data.orderId}`,
      html,
    }

    await transporter.sendMail(mailOptions)
    console.log(`Order confirmation email sent to ${to}`)
    return true
  } catch (error) {
    console.error("Send order confirmation email error:", error)
    return false
  }
}

// Send newsletter welcome email
exports.sendNewsletterWelcomeEmail = async (to, data) => {
  try {
    const html = await renderTemplate("newsletter-welcome", {
      email: to,
      subject: "Welcome to Trendora Newsletter",
      message:
      "Thank you for subscribing to our newsletter. You will now receive updates on our latest products and promotions.",
    })

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to,
      subject: "Welcome to Trendora Newsletter",
      html,
    }

    await transporter.sendMail(mailOptions)
    console.log(`Newsletter welcome email sent to ${to}`)
    return true
  } catch (error) {
    console.error("Send newsletter welcome email error:", error)
    return false
  }
}

// Send contact form confirmation email
exports.sendContactFormConfirmationEmail = async (to, data) => {
  try {
    const html = await renderTemplate("contact", {
      name: data.name,
      message: data.message,
      subject: "Trendora - We Received Your Message",
    })

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to,
      subject: "Trendora - We Received Your Message",
      html,
    }

    await transporter.sendMail(mailOptions)
    console.log(`Contact form confirmation email sent to ${to}`)
    return true
  } catch (error) {
    console.error("Send contact form confirmation email error:", error)
    return false
  }
}

// Generic email sending function
exports.sendEmail = async (to, subject, html) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to,
      subject,
      html,
    }

    await transporter.sendMail(mailOptions)
    console.log(`Email sent to ${to}`)
    return true
  } catch (error) {
    console.error("Send email error:", error)
    return false
  }
}
