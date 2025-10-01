// models/Instructor.js
const mongoose = require("mongoose");

const instructorSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    // bcrypt hash of password
    passwordHash: {
      type: String,
      required: true,
    },
    // bcrypt hash of the special login key
    loginKeyHash: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["instructor", "admin"],
      default: "instructor",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLoginAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Instructor", instructorSchema);
