const mongoose = require("mongoose")

const contactSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please add a name"],
    },
    email: {
      type: String,
      required: [true, "Please add an email"],
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, "Please add a valid email"],
    },
    subject: {
      type: String,
      default: "Contact Form Submission",
    },
    message: {
      type: String,
      required: [true, "Please add a message"],
    },
    status: {
      type: String,
      enum: ["New", "Read", "Responded"],
      default: "New",
    },
    response: {
      type: String,
    },
    respondedAt: {
      type: Date,
    },
    respondedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  },
)

const Contact = mongoose.model("Contact", contactSchema)

module.exports = Contact
