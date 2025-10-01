// routes/auth.js
const express = require("express");
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const Instructor = require("../models/Instructor"); // adjust path if needed
const jwt = require('jsonwebtoken');
const secretKeyForjwt = "SWE4103";

const { generateFourDigitKey, hashKey , verifyKey} = require("../utils/key");

const router = express.Router();
const SALT_ROUNDS = 10;

// --- Helpers ---


// --- Validators ---
const emailValidator = body("email")
  .exists({ checkFalsy: true }).withMessage("Email is required.")
  .isString().withMessage("Email must be a string.")
  .isEmail().withMessage("Email must be valid.")
  .normalizeEmail();

const passwordValidator = body("password")
  .exists({ checkFalsy: true }).withMessage("Password is required.")
  .isString().withMessage("Password must be a string.")
  .isLength({ min: 8 }).withMessage("Password must be at least 8 characters long.")
  .matches(/[A-Z]/).withMessage("Password must include at least one uppercase letter.")
  .matches(/[a-z]/).withMessage("Password must include at least one lowercase letter.")
  .matches(/[0-9]/).withMessage("Password must include at least one digit.");

const keyValidator = body("key")
  .exists({ checkFalsy: true }).withMessage("Special key is required.")
  .isString().withMessage("Special key must be a string.")
  .isLength({ min: 8 }).withMessage("Special key must be at least 8 characters long.");

// ---------- REGISTER (DEMO) ----------
// In a real app, only admins create instructors and share the key out-of-band.


router.post("/register", [emailValidator, passwordValidator], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array().map(e => e.msg) });
  }

  const { email, password } = req.body;

  try {
    const existing = await Instructor.findOne({ email });
    if (existing) {
      return res.status(400).json({ success: false, message: "Email already registered." });
    }

    

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    const plainKey = generateFourDigitKey();
    const loginKeyHash = await hashKey(plainKey);

    const newInstructor = new Instructor({
      email,
      passwordHash,
      loginKeyHash,
    });



    const doc = await newInstructor.save();
     const user = { 
      
      id: doc._id,
        email: doc.email,
        specialKey: plainKey
      }

      const authToken = jwt.sign(user, secretKeyForjwt);
    

    return res.status(201).json({
      success: true,
      message: "Instructor registered successfully.",
      authToken: authToken,
      specialKey: plainKey,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Error registering user."+ err.message });
  }
});

// ---------- LOGIN ----------
router.post("/login", [emailValidator, passwordValidator], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array().map(e => e.msg) });
  }

  const { email, password, key } = req.body;

  try {
    const user = await Instructor.findOne({ email });
    if (!user || !user.isActive) {
      return res.status(401).json({ success: false, message: "Invalid credentials." });
    }

    const pwOk = await bcrypt.compare(password, user.passwordHash);
    const keyOk = await verifyKey(key, user.loginKeyHash);


    if (!pwOk || !keyOk) {
      return res.status(401).json({ success: false, message: "Invalid credentials." });
    }

    // Update last login
    user.lastLoginAt = new Date();
    await user.save();

    const data ={
      id: user._id,
      email: user.email,
      role: user.role
    }
    const authToken = jwt.sign(data, secretKeyForjwt);
    

    return res.json({
      success: true,
      message: "Login successful.",
      authToken: authToken
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Login error."+ err.message});
  }
});

module.exports = router;
