const crypto = require("crypto")
const User = require("../models/User")
const Cart = require("../models/Cart")
const generateToken = require("../utils/generateToken")
const emailService = require("../services/emailService")

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body

    // Check if user already exists
    const userExists = await User.findOne({ email })

    if (userExists) {
      return res.status(400).json({ error: "User already exists" })
    }

    // Generate verification token
    const verificationToken = crypto.randomBytes(20).toString("hex")
    const verificationExpires = Date.now() + 24 * 60 * 60 * 1000 // 24 hours

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      verificationToken,
      verificationExpires,
    })

    // Create empty cart for user
    await Cart.create({ user: user._id, items: [] })

    // Send verification email
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`

    await emailService.sendWelcomeEmail(user.email, {
      name: user.name,
      verificationUrl,
    })

    // Generate token
    const token = generateToken(user._id)

    // Set cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    })

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      isVerified: user.isVerified,
      token,
      message: "Registration successful! Please check your email to verify your account.",
    })
  } catch (error) {
    console.error("Register error:", error)
    res.status(500).json({ error: "Server error" })
  }
}

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body

    // Find user
    const user = await User.findOne({ email }).select("+password")

    // Check if user exists and password matches
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ error: "Invalid email or password" })
    }

    // Generate token
    const token = generateToken(user._id)

    // Set cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    })

    // If there's a guest cart ID in the request, merge carts
    const { guestCartId } = req.body
    if (guestCartId) {
      try {
        const guestCart = await Cart.findOne({ _id: guestCartId, user: null })

        if (guestCart && guestCart.items.length > 0) {
          let userCart = await Cart.findOne({ user: user._id })

          if (!userCart) {
            userCart = new Cart({ user: user._id, items: [] })
          }

          // Merge items
          for (const guestItem of guestCart.items) {
            const existingItemIndex = userCart.items.findIndex(
              (item) => item.product.toString() === guestItem.product.toString(),
            )

            if (existingItemIndex > -1) {
              userCart.items[existingItemIndex].quantity += guestItem.quantity
            } else {
              userCart.items.push({
                product: guestItem.product,
                quantity: guestItem.quantity,
              })
            }
          }

          await userCart.save()
          await Cart.deleteOne({ _id: guestCartId })

          // Clear guest cart cookie
          res.clearCookie("guestCartId")
        }
      } catch (error) {
        console.error("Cart merge error:", error)
        // Continue login process even if cart merge fails
      }
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      isVerified: user.isVerified,
      token,
    })
  } catch (error) {
    console.error("Login error:", error)
    res.status(500).json({ error: "Server error" })
  }
}

// @desc    Logout user / clear cookie
// @route   POST /api/auth/logout
// @access  Private
exports.logout = (req, res) => {
  res.clearCookie("token")
  res.json({ message: "Logged out successfully" })
}

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      address: user.address,
      isAdmin: user.isAdmin,
      isVerified: user.isVerified,
    })
  } catch (error) {
    console.error("Get me error:", error)
    res.status(500).json({ error: "Server error" })
  }
}

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
exports.updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)

    if (!user) {
      return res.status(404).json({ error: "User not found" })
    }

    // Update fields
    user.name = req.body.name || user.name
    user.email = req.body.email || user.email
    user.phone = req.body.phone || user.phone

    // Update address if provided
    if (req.body.address) {
      user.address = {
        street: req.body.address.street || user.address?.street,
        city: req.body.address.city || user.address?.city,
        state: req.body.address.state || user.address?.state,
        zipCode: req.body.address.zipCode || user.address?.zipCode,
        country: req.body.address.country || user.address?.country,
      }
    }

    // Update password if provided
    if (req.body.password) {
      user.password = req.body.password
    }

    const updatedUser = await user.save()

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      phone: updatedUser.phone,
      address: updatedUser.address,
      isAdmin: updatedUser.isAdmin,
      isVerified: updatedUser.isVerified,
      message: "Profile updated successfully",
    })
  } catch (error) {
    console.error("Update profile error:", error)
    res.status(500).json({ error: "Server error" })
  }
}

// @desc    Verify email
// @route   GET /api/auth/verify-email/:token
// @access  Public
exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.params

    const user = await User.findOne({
      verificationToken: token,
      verificationExpires: { $gt: Date.now() },
    })

    if (!user) {
      return res.status(400).json({
        error: "Invalid or expired verification token",
      })
    }

    // Update user
    user.isVerified = true
    user.verificationToken = undefined
    user.verificationExpires = undefined

    await user.save()

    res.json({ message: "Email verified successfully. You can now log in." })
  } catch (error) {
    console.error("Verify email error:", error)
    res.status(500).json({ error: "Server error" })
  }
}

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body

    const user = await User.findOne({ email })

    if (!user) {
      return res.status(404).json({ error: "User not found" })
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(20).toString("hex")
    const resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex")

    // Set token expiry
    const resetPasswordExpires = Date.now() + 60 * 60 * 1000 // 1 hour

    // Update user
    user.resetPasswordToken = resetPasswordToken
    user.resetPasswordExpires = resetPasswordExpires

    await user.save()

    // Create reset URL
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`

    // Send email
    await emailService.sendPasswordResetEmail(user.email, {
      name: user.name,
      resetUrl,
    })

    res.json({
      message: "Password reset email sent",
    })
  } catch (error) {
    console.error("Forgot password error:", error)
    res.status(500).json({ error: "Server error" })
  }
}

// @desc    Reset password
// @route   POST /api/auth/reset-password/:token
// @access  Public
exports.resetPassword = async (req, res) => {
  try {
    const { token } = req.params
    const { password } = req.body

    // Hash token from URL
    const resetPasswordToken = crypto.createHash("sha256").update(token).digest("hex")

    // Find user with valid token
    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpires: { $gt: Date.now() },
    })

    if (!user) {
      return res.status(400).json({
        error: "Invalid or expired reset token",
      })
    }

    // Update password
    user.password = password
    user.resetPasswordToken = undefined
    user.resetPasswordExpires = undefined

    await user.save()

    // Send confirmation email
    await emailService.sendPasswordChangeConfirmationEmail(user.email, {
      name: user.name,
    })

    res.json({
      message: "Password reset successful",
    })
  } catch (error) {
    console.error("Reset password error:", error)
    res.status(500).json({ error: "Server error" })
  }
}

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body

    // Get user with password
    const user = await User.findById(req.user._id).select("+password")

    // Check current password
    if (!(await user.matchPassword(currentPassword))) {
      return res.status(401).json({ error: "Current password is incorrect" })
    }

    // Update password
    user.password = newPassword
    await user.save()

    // Send confirmation email
    await emailService.sendPasswordChangeConfirmationEmail(user.email, {
      name: user.name,
    })

    res.json({
      message: "Password changed successfully",
    })
  } catch (error) {
    console.error("Change password error:", error)
    res.status(500).json({ error: "Server error" })
  }
}
