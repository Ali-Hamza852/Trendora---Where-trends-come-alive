const express = require("express");
const router = express.Router();
const newsletterController = require("../controllers/newsletterController");
const contactController = require("../controllers/contactController");
const authController = require("../controllers/authController");

// Newsletter subscription
router.post("/newsletter", newsletterController.subscribe);

// Contact form submission
router.post("/contact", contactController.submitContact);

// Authentication routes
router.post("/login", authController.login);
router.post("/signup", authController.signup);
router.post("/forget-password", authController.forgetPassword);
router.post("/reset-password", authController.resetPassword);

module.exports = router;
