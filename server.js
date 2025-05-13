const express = require("express")
const path = require("path")
const mongoose = require("mongoose")
const dotenv = require("dotenv")
const cookieParser = require("cookie-parser")
const cors = require("cors")
const helmet = require("helmet")
const morgan = require("morgan")

// Load environment variables
dotenv.config()

// Import routes
const authRoutes = require("./routes/authRoutes")
const productRoutes = require("./routes/productRoutes")
const categoryRoutes = require("./routes/categoryRoutes")
const cartRoutes = require("./routes/cartRoutes")
const orderRoutes = require("./routes/orderRoutes")
const reviewRoutes = require("./routes/reviewRoutes")
const newsletterRoutes = require("./routes/newsletterRoutes")
const contactRoutes = require("./routes/contactRoutes")

// Initialize express app
const app = express()
const PORT = process.env.PORT || 5000

// Security middleware
app.use(
  helmet({
    contentSecurityPolicy: false, // Disable for development, enable in production
  }),
)

// Middleware
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())
app.use(morgan("dev")) // Logging

// CORS configuration
app.use(
  cors({
    origin: process.env.NODE_ENV === "production" ? process.env.FRONTEND_URL : "*",
    credentials: true,
  }),
)

// Serve static files
app.use(express.static(path.join(__dirname, "public")))

// API Routes
app.use("/api/auth", authRoutes)
app.use("/api/products", productRoutes)
app.use("/api/categories", categoryRoutes)
app.use("/api/cart", cartRoutes)
app.use("/api/orders", orderRoutes)
app.use("/api/reviews", reviewRoutes)
app.use("/api/newsletter", newsletterRoutes)
app.use("/api/contact", contactRoutes)

// Define the pages that should be served
const pages = [
  { route: "/", file: "index.html" },
{ route: "/index", file: "index.html" },
{ route: "/about-us", file: "about-us.html" },
{ route: "/store", file: "store.html" },
{ route: "/checkout", file: "checkout.html" },
{ route: "/contact", file: "contact.html" },
{ route: "/contact-us", file: "contact-us.html" },
{ route: "/admin", file: "admin.html" },
{ route: "/login", file: "login.html" },
{ route: "/signup", file: "signup.html" },
{ route: "/forgot-password", file: "forget-password.html" },
{ route: "/reset-password", file: "reset-password.html" },
]

// Frontend routes - serve HTML files
pages.forEach(({ route, file }) => {
  app.get(route, (req, res) => {
    res.sendFile(path.join(__dirname, "views", file), (err) => {
      if (err) {
        console.error(`Error serving ${file}:`, err)
        res.status(404).send("Page not found")
      }
    })
  })
})

// Product route with dynamic ID
app.get("/product/:id", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "product.html"), (err) => {
    if (err) {
      console.error("Error serving product.html:", err)
      res.status(404).send("Page not found")
    }
  })
})

// Catch-all route for frontend
app.get("*", (req, res, next) => {
  // Skip API routes
  if (req.url.startsWith("/api/")) {
    return next()
  }

  res.sendFile(path.join(__dirname, "views", "index.html"), (err) => {
    if (err) {
      console.error("Error serving index.html:", err)
      res.status(404).send("Page not found")
    }
  })
})

// 404 handler for API routes
app.use("/api/*", (req, res) => {
  res.status(404).json({ error: "API route not found" })
})

// Error-handling middleware
app.use((err, req, res, next) => {
  console.error("Server error:", err.stack)
  res.status(500).json({ error: "Internal server error" })
})

// Connect to MongoDB
mongoose
.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log("Connected to MongoDB")

  // Start server
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
  })
})
.catch((err) => {
  console.error("MongoDB connection error:", err)
  process.exit(1)
})

module.exports = app // For testing
