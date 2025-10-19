const express = require("express");
const { body, validationResult } = require("express-validator");
const { requireAuth } = require("../middleware/auth");
const Instructor = require("../models/Instructor");
const Student = require("../models/Student");
const Course = require("../models/Course");
const router = express.Router();

function handleValidation(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ message: errors.array().map(e => e.msg).join(", ") });
    return false;
  }
  return true;
}

// ---------- Create a new course ----------

router.post(
  "/createCourses",
  requireAuth,
  [
    body("courseNumber").exists({ checkFalsy: true }).withMessage("courseNumber required").isString().trim(),
    body("courseName").exists({ checkFalsy: true }).withMessage("courseName required").isString().trim(),
    body("description").optional().isString(),
  ],
  async (req, res) => {
    if (!handleValidation(req, res)) return;

    const { courseNumber, courseName, description = "" } = req.body;

    try {
      const instructor = await Instructor.findById(req.user.id);
      if (!instructor) return res.status(404).json({ success: false, message: "Instructor not found" });

      // Check if this instructor already has a course with same courseNumber
      const existingCourse = await Course.findOne({ courseNumber, instructor: instructor._id });
      if (existingCourse) return res.status(409).json({ message: "courseNumber already exists" });

      // Create and save course in one step
      const newCourse = await Course.create({
        courseNumber,
        courseName,
        description,
        instructor: instructor._id, // mandatory if required in schema
        students: [],
      });

      // Add course reference to instructor
      instructor.courses.push(newCourse._id);
      await instructor.save();

      res.json({ success: true, message: "Course created", course: newCourse });
    } catch (e) {
      console.error(e);
      res.status(500).json({ success: false, message: "Error creating course: " + e.message });
    }
  }
);

// ---------- Get all courses for instructor ----------
router.get("/get-courses", requireAuth, async (req, res) => {
  try {
    const courses = await Course.find({ instructor: req.user.id }).lean();
    res.json({ courses });
  } catch (err) {
    res.status(500).json({ message: "Error fetching courses: " + err.message });
  }
});

// ---------- Get a specific course ----------
router.get("/get-course/:courseNumber", requireAuth, async (req, res) => {
  try {
    const course = await Course.findOne({
      courseNumber: req.params.courseNumber,
      instructor: req.user.id,
    }).lean();

    if (!course) return res.status(404).json({ message: "Course not found" });

    // Fetch full student objects by email
    const students = await Student.find({
      email: { $in: course.students || [] },
    }).lean();

    // Merge course and student data
    res.json({ ...course, students });
  } catch (err) {
    res.status(500).json({ message: "Error fetching course: " + err.message });
  }
});

module.exports = router;
