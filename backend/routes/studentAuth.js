// routes/studentAuth.js
const express = require("express");
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Student = require("../models/Student");

const router = express.Router();
const SALT_ROUNDS = 10;
const JWT_SECRET = process.env.JWT_SECRET || "SWE4103_DEV_ONLY";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

function signToken(userPayload) {
  return jwt.sign(userPayload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

// ---------- STUDENT FIRST-TIME PASSWORD SET ----------
router.post("/first-login", [
  body("email").isEmail().withMessage("Valid email required."),
  body("password").isLength({ min: 8 }).withMessage("Password must be at least 8 characters."),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ message: errors.array().map(e => e.msg).join(", ") });

  const { email, password } = req.body;
  try {
    const student = await Student.findOne({ email: email.toLowerCase() });
    if (!student) return res.status(404).json({ message: "Student not found." });

    if (student.password && student.password !== "") {
      return res.status(400).json({ message: "Account already claimed." });
    }

    const hashed = await bcrypt.hash(password, SALT_ROUNDS);
    student.password = hashed;
    await student.save();

    const token = signToken({ id: student._id, email: student.email });
    res.json({ success: true, message: "Password set successfully.", token });
  } catch (err) {
    res.status(500).json({ message: "Error setting password: " + err.message });
  }
});

// ---------- STUDENT LOGIN ----------
router.post("/login", [
  body("email").isEmail().withMessage("Valid email required."),
  body("password").exists().withMessage("Password required."),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ message: errors.array().map(e => e.msg).join(", ") });

  const { email, password } = req.body;

  try {
    const student = await Student.findOne({ email: email.toLowerCase() });
    if (!student) return res.status(401).json({ message: "Invalid credentials" });

    if (!student.password) return res.status(400).json({ message: "Password not set. Please claim your account." });

    const ok = await bcrypt.compare(password, student.password);
    if (!ok) return res.status(401).json({ message: "Invalid credentials" });

    const token = signToken({ id: student._id, email: student.email });
    res.json({ success: true, message: "Login successful", token });
  } catch (err) {
    res.status(500).json({ message: "Error logging in: " + err.message });
  }
});

// routes/studentAuth.js
router.get("/get-courses", async (req, res) => {
  try {
    const email = req.query.email?.toLowerCase();
    if (!email) return res.status(400).json({ message: "Email required" });

    const student = await Student.findOne({ email });
    if (!student) return res.status(404).json({ message: "Student not found" });

    // Assuming student document stores an array of enrolled course IDs
    const courses = await Course.find({ _id: { $in: student.courses } });

    res.json({ courses });
  } catch (err) {
    console.error("Error fetching student courses:", err);
    res.status(500).json({ message: "Server error" });
  }
});


module.exports = router;

