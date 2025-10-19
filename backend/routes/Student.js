const express = require("express");
const { body, validationResult } = require("express-validator");
const { requireAuth } = require("../middleware/auth");
const User = require("../models/Student");
const router = express.Router();

// ---------- Validator Helper ----------
function handleValidation(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ message: errors.array().map(e => e.msg).join(", ") });
    return false;
  }
  return true;
}

// ---------- Create a new student ----------
router.post(
  "/create",
  [
    body("firstName").exists({ checkFalsy: true }).withMessage("First Name is required").trim(),
    body("lastName").exists({ checkFalsy: true }).withMessage("Last Name is required").trim(),
    body("email").exists({ checkFalsy: true }).withMessage("Email is required").isEmail().normalizeEmail(),
  ],
  async (req, res) => {
    if (!handleValidation(req, res)) return;

    const { firstName, lastName, email } = req.body;

    try {
      // Check if student already exists
      const existingUser = await User.findOne({ email: email.toLowerCase() });
      if (existingUser) {
        return res.status(409).json({ message: "User with this email already exists" });
      }

      const student = new User({
        firstName,
        lastName,
        email: email.toLowerCase(),
        password: "", // empty, can be set on first login
        isInstructor: false,
        courses: [],
      });

      await student.save();
      res.json({ success: true, student });
    } catch (err) {
      res.status(500).json({ success: false, message: "Error creating student: " + err.message });
    }
  }
);

// ---------- Get students for a specific course ----------
router.get("/course/:courseNumber", requireAuth, async (req, res) => {
  try {
    const instructor = await User.findById(req.user.id);
    if (!instructor) return res.status(404).json({ message: "Instructor not found" });

    const course = instructor.courses.find(c => c.courseNumber === req.params.courseNumber);
    if (!course) return res.status(404).json({ message: "Course not found" });

    // students array is already emails
    res.json({ students: course.students });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ---------- Add an existing student to a course ----------
router.post("/course/:courseNumber/add-student", requireAuth, async (req, res) => {
  const { email } = req.body;

  if (!email) return res.status(400).json({ message: "Email is required" });

  try {
    const instructor = await User.findById(req.user.id);
    if (!instructor) return res.status(404).json({ message: "Instructor not found" });

    const course = instructor.courses.find(c => c.courseNumber === req.params.courseNumber);
    if (!course) return res.status(404).json({ message: "Course not found" });

    // Check if student exists
    const student = await User.findOne({ email: email.toLowerCase() });
    if (!student) return res.status(404).json({ message: "Student not found" });

    // Prevent duplicates
    if (!course.students.includes(email.toLowerCase())) {
      course.students.push(email.toLowerCase());
      await instructor.save();
    }

    // Add the course to student's courses if not already there
    const exists = student.courses.some(c => c.courseNumber === course.courseNumber);
    if (!exists) {
      student.courses.push({
        courseNumber: course.courseNumber,
        courseName: course.courseName,
        description: course.description || "",
        students: [],
      });
     student.markModified("courses");
     await student.save();
     console.log("After Save:", student.courses);
    }

    res.json({ success: true, students: course.students });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;

