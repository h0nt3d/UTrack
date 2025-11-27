const express = require("express");
const { body, validationResult } = require("express-validator");
const { requireAuth } = require("../middleware/auth");
const Student = require("../models/Student");
const Course = require("../models/Course");
const router = express.Router();

// --- Helper for validation ---
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
    //body("firstName").exists({ checkFalsy: true }).withMessage("First Name is required").trim(),
    //body("lastName").exists({ checkFalsy: true }).withMessage("Last Name is required").trim(),
    body("email").exists({ checkFalsy: true }).withMessage("Email is required").isEmail().normalizeEmail(),
  ],
  async (req, res) => {
    if (!handleValidation(req, res)) return;

    const { firstName, lastName, email } = req.body;

    try {
      const existingStudent = await Student.findOne({ email: email.toLowerCase() });
      if (existingStudent) return res.status(409).json({ message: "Student already exists" });

      const student = await Student.create({
        firstName,
        lastName,
        email: email.toLowerCase(),
        password: "",
        courses: [], // store courseNumbers as strings
      });

      res.json({ success: true, student });
    } catch (err) {
      res.status(500).json({ message: "Error creating student: " + err.message });
    }
  }
);

// ---------- Get students in a course ----------
router.get("/course/:courseNumber", requireAuth, async (req, res) => {
  try {
    const course = await Course.findOne({ courseNumber: req.params.courseNumber });
    if (!course) return res.status(404).json({ message: "Course not found" });

    // Fetch students by email instead of _id
    const students = await Student.find({ email: { $in: course.students } });
    res.json({ students, courseName: course.courseName });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ---------- Add an existing student to a course ----------
router.post("/course/:courseNumber/add-student", requireAuth, async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: "Email is required" });

  try {
    const student = await Student.findOne({ email: email.toLowerCase() });
    if (!student) return res.status(404).json({ message: "Student not found" });

    const course = await Course.findOne({ courseNumber: req.params.courseNumber });
    if (!course) return res.status(404).json({ message: "Course not found" });

    // Add student to course.students if not already there
    if (!course.students.includes(student.email)) {
      course.students.push(student.email); // store email, not ObjectId
      await course.save();
    }

    // Add course to student.courses if not already there
    if (!student.courses.includes(course.courseNumber)) {
      student.courses.push(course.courseNumber); // store courseNumber
      await student.save();
    }

    const students = await Student.find({ email: { $in: course.students } });

    res.json({ success: true, students });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ---------- Add multiple students to a course ----------
router.post("/course/:courseNumber/add-multiple", requireAuth, async (req, res) => {
  const { students } = req.body; // expects an array of { firstName, lastName, email }
  if (!Array.isArray(students) || students.length === 0) {
    return res.status(400).json({ message: "No students provided" });
  }

  try {
    const course = await Course.findOne({ courseNumber: req.params.courseNumber });
    if (!course) return res.status(404).json({ message: "Course not found" });

    const addedStudents = [];

    for (let s of students) {
      const email = s.email.toLowerCase();

      // check if student exists, create if not
      let student = await Student.findOne({ email });
      if (!student) {
        student = await Student.create({
          firstName: s.firstName || "",
          lastName: s.lastName || "",
          email,
          password: "",
          courses: [],
        });
      }

      // Add course to student if not present
      if (!student.courses.includes(course.courseNumber)) {
        student.courses.push(course.courseNumber);
        await student.save();
      }

      // Add student email to course if not present
      if (!course.students.includes(student.email)) {
        course.students.push(student.email);
      }

      addedStudents.push(student);
    }

    await course.save();

    res.status(200).json({ success: true, students: addedStudents });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error adding students: " + err.message });
  }
});


// ---------- Remove a student from a course ----------
router.post("/course/:courseNumber/remove-student", requireAuth, async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: "Email is required" });

  try {
    const student = await Student.findOne({ email: email.toLowerCase() });
    if (!student) return res.status(404).json({ message: "Student not found" });

    const course = await Course.findOne({ courseNumber: req.params.courseNumber });
    if (!course) return res.status(404).json({ message: "Course not found" });

    // Remove student email from course.students
    course.students = course.students.filter((e) => e !== student.email);
    await course.save();

    // Remove courseNumber from student.courses
    student.courses = student.courses.filter((c) => c !== course.courseNumber);
    await student.save();

    // Return updated students
    const students = await Student.find({ email: { $in: course.students } });
    res.json({ success: true, students });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});



module.exports = router;

