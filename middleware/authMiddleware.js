const jwt = require("jsonwebtoken")
const User = require("../models/User")

// Protect routes - user must be authenticated
exports.protect = async (req, res, next) => {
    try {
        let token

        // Check for token in cookies or Authorization header
        if (req.cookies.token) {
            token = req.cookies.token
        } else if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
            token = req.headers.authorization.split(" ")[1]
        }

        // If no token found, return unauthorized
        if (!token) {
            return res.status(401).json({
                error: "Not authorized to access this route",
            })
        }

        try {
            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET)

            // Get user from the token
            const user = await User.findById(decoded.id).select("-password")

            if (!user) {
                return res.status(401).json({
                    error: "User not found",
                })
            }

            // Add user to request object
            req.user = user
            next()
        } catch (error) {
            console.error("Token verification error:", error)
            return res.status(401).json({
                error: "Not authorized to access this route",
            })
        }
    } catch (error) {
        console.error("Auth middleware error:", error)
        return res.status(500).json({
            error: "Server error",
        })
    }
}

// Optional authentication - will set req.user if token exists, but won't require it
exports.optionalAuth = async (req, res, next) => {
    try {
        let token

        // Check for token in cookies or Authorization header
        if (req.cookies.token) {
            token = req.cookies.token
        } else if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
            token = req.headers.authorization.split(" ")[1]
        }

        // If no token, just continue without setting user
        if (!token) {
            return next()
        }

        try {
            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET)

            // Get user from the token
            const user = await User.findById(decoded.id).select("-password")

            if (user) {
                // Add user to request object if found
                req.user = user
            }

            next()
        } catch (error) {
            // If token is invalid, just continue without setting user
            console.error("Optional auth token error:", error)
            next()
        }
    } catch (error) {
        console.error("Optional auth middleware error:", error)
        next()
    }
}

// Admin middleware - user must be an admin
exports.admin = (req, res, next) => {
    if (req.user && req.user.isAdmin) {
        next()
    } else {
        return res.status(403).json({
            error: "Not authorized as an admin",
        })
    }
}
