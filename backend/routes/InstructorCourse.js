const express = require("express");
const { body, param, validationResult } = require("express-validator");
const { requireAuth } = require("../middleware/auth");
const User = require("../models/User");
const router = express.Router();


// Helper to handle validation results
function handleValidation(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ message: errors.array().map(e => e.msg).join(", ") });
    return false;
  }
  return true;
}
// ---------- Courses (by authenticated user id) ----------
// Create Courses for instructor

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
      const user = await User.findById(req.user.id);
      if (!user) return res.status(404).json({success:false, message: "User not found" });

      // prevent duplicate courseNumber for this user
      const exists = user.courses.some(
        c => c.courseNumber.trim().toLowerCase() === courseNumber.trim().toLowerCase()
      );
      if (exists) return res.status(409).json({ message: "courseNumber already exists" });

      user.courses.push({ courseNumber, courseName, description });
      await user.save();

      return res.json({ success:true,message: "Course added", courses: user.courses });
    } catch (e) {
      return res.status(500).json({ success : false, message: "Error adding course"+e.message });
    }
  }
);

router.get("/get-courses", requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id, { courses: 1, _id: 0 }).lean();
    if (!user) return res.status(404).json({ message: "User not found" });
    return res.json({ courses: user.courses || [] });
  } catch {
    return res.status(500).json({ message: "Error fetching courses" });
  }
});

router.get("/get-course/:courseNumber", requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).send("User not found");

    const courseNumber = req.params.courseNumber;
    const course = user.courses.find(c => c.courseNumber === courseNumber);

    if (!course) return res.status(404).send("Course not found");
    res.json(course);
  } catch (err) {
    res.status(500).send("Error fetching course: " + err.message);
  }
});


module.exports = router;
