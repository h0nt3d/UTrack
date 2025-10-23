// routes/auth.js
const express = require("express");
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Instructor = require("../models/Instructor");

const router = express.Router();
const SALT_ROUNDS = 10;

//  Use env in production
const JWT_SECRET = process.env.JWT_SECRET || "SWE4103_DEV_ONLY";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

// ---------- Validators ----------
const signupValidators = [
  //body("firstName").exists({ checkFalsy: true }).withMessage("firstName is required.").isString().trim(),
  //body("lastName").exists({ checkFalsy: true }).withMessage("lastName is required.").isString().trim(),
  body("email").exists({ checkFalsy: true }).withMessage("email is required.").isEmail().normalizeEmail(),
  body("password").exists({ checkFalsy: true }).withMessage("password is required.").isLength({ min: 8 }),
];

const loginValidators = [
  body("email").exists({ checkFalsy: true }).isEmail().normalizeEmail(),
  body("password").exists({ checkFalsy: true }).isString(),
];

// ---------- Helpers ----------
function sanitizeUser(doc) {
  return {
    id: doc._id.toString(),
    firstName: doc.firstName,
    lastName: doc.lastName,
    email: doc.email,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

function signToken(userPayload) {
  return jwt.sign(userPayload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

// Same signature as your original code expects
async function createUser(firstName, lastName, email, password) {
  const existing = await Instructor.findOne({ email });
  if (existing) {
    const err = new Error("Email already registered");
    err.status = 400;
    throw err;
  }
  
  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  const doc = await Instructor.create({ firstName, lastName, email, password : passwordHash });
  console.log("Hashing password for", email);
  return sanitizeUser(doc);
}

async function createInstructor(firstName, lastName, email, password) {
  const existing = await Instructor.findOne({ email });
  if (existing) {
    const err = new Error("Email already registered");
    err.status = 400;
    throw err;
  }
  
  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  const doc = await Instructor.create({ firstName, lastName, email, password : passwordHash, isInstructor : true });
  console.log("Hashing password for", email);
  return sanitizeUser(doc);
}



// ---------- SIGNUP ----------
router.post("/signup", signupValidators, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res.status(400).json({ message: errors.array().map(e => e.msg).join(", ") });

  const { firstName, lastName, email, password } = req.body;
  
  try {
    
    const user = await createUser(firstName, lastName, email, password);
    // Add JWT (keeps your original response shape, just adds token)
    const token = signToken({ id: user.id, email: user.email });
    
    return res.json({ message: "User created successfully", user, token });
  } catch (err) {
    const code = err.status || 500;
    return res.status(code).json({ message: code === 400 ? err.message : "Error creating user with express"+err.message });
  }
});

router.post("/instructor-signup", signupValidators, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res.status(400).json({ message: errors.array().map(e => e.msg).join(", ") });

  const { firstName, lastName, email, password } = req.body;
  
  try {
    
    const user = await createInstructor(firstName, lastName, email, password);
    // Add JWT (keeps your original response shape, just adds token)
    const token = signToken({ id: user.id, email: user.email });
    
    return res.json({ message: "User created successfully", user, token });
  } catch (err) {
    const code = err.status || 500;
    return res.status(code).json({ message: code === 400 ? err.message : "Error creating user with express"+err.message });
  }
});




// ---------- LOGIN ----------
router.post("/login", loginValidators, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res.status(400).json({ message: errors.array().map(e => e.msg).join(", ") });

  const { email, password } = req.body;
  
  try {
    const userDoc = await Instructor.findOne({ email });
    if (!userDoc) return res.status(401).json({ message: "Invalid credentials" });

    const ok = await bcrypt.compare(password, userDoc.password);
    if (!ok) return res.status(401).json({ message: "Invalid credentials" });

    
    const user = sanitizeUser(userDoc);
    const token = signToken({ id: user.id, email: user.email });
    
    return res.json({ message: "Login successful", user, token });
  } catch (err) {
    return res.status(500).json({ message: "Login error"+err.message });
  }
});

module.exports = {router, createUser};
