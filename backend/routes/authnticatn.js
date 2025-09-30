// routes/auth.js
const express = require("express");
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcrypt");
const Instructor = require("../models/Instructor"); // adjust path if needed

const router = express.Router();

// ---------- VALIDATION RULES ----------
const usernameValidator = body("username")
  .exists({ checkFalsy: true }).withMessage("Username is required.")
  .isString().withMessage("Username must be a string.")
  .isLength({ min: 3 }).withMessage("Username must be at least 3 characters long.");

const passwordValidator = body("password")
  .exists({ checkFalsy: true }).withMessage("Password is required.")
  .isString().withMessage("Password must be a string.")
  .isLength({ min: 8 }).withMessage("Password must be at least 8 characters long.")
  .matches(/[A-Z]/).withMessage("Password must include at least one uppercase letter.")
  .matches(/[a-z]/).withMessage("Password must include at least one lowercase letter.")
  .matches(/[0-9]/).withMessage("Password must include at least one digit.");

// ---------- REGISTER ----------
router.post("/register", [usernameValidator, passwordValidator], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: e.array().map(e => e.msg),
    });
  }

  const { username, password } = req.body;

  try {
    // Check if username already exists
    const existing = await Instructor.findOne({ username });
    if (existing) {
      return res.status(400).json({ success: false, message: "Username already taken." });
    }

    // Hash password
    const hash = await bcrypt.hash(password, 10);

    // Create new user
    const newInstructor = new Instructor({ username, password: hash });
    await newInstructor.save();

    return res.status(201).json({
      success: true,
      message: "User registered successfully.",
      user: { id: newInstructor._id, username: newInstructor.username },
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Error registering user." });
  }
});

// ---------- LOGIN ----------
router.post("/login", [usernameValidator, passwordValidator], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array().map(e => e.msg),
    });
  }

  const { username, password } = req.body;

  try {
    const user = await Instructor.findOne({ username });
    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid credentials." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid credentials." });
    }

    return res.json({
      success: true,
      message: "Login successful.",
      user: { id: user._id, username: user.username, role: user.role },
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Login error." });
  }
});

module.exports = router;
