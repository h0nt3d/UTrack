const express = require("express");
const { body, validationResult } = require("express-validator");
const { requireAuth } = require("../middleware/auth");
const BusFactor = require("../models/BusFactor");
const Course = require("../models/Course");
const Student = require("../models/Student");
const Instructor = require("../models/Instructor");
const router = express.Router();

// Helper function for validation
function handleValidation(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ message: errors.array().map((e) => e.msg).join(", ") });
    return false;
  }
  return true;
}

// ---------- Add or Update Bus Factor Entry ----------
router.post(
  "/course/:courseNumber/project/:projectId/add-bus-factor",
  requireAuth,
  [
    body("studentId")
      .exists({ checkFalsy: true })
      .withMessage("Student ID is required")
      .isMongoId()
      .withMessage("Student ID must be a valid MongoDB ObjectId"),
    body("date")
      .exists({ checkFalsy: true })
      .withMessage("Date is required")
      .isISO8601()
      .withMessage("Date must be a valid ISO 8601 date"),
    body("rating")
      .exists({ checkFalsy: true })
      .withMessage("Rating is required")
      .isInt({ min: 1 })
      .withMessage("Rating must be an integer >= 1"),
  ],
  async (req, res) => {
    if (!handleValidation(req, res)) return;

    const { courseNumber, projectId } = req.params;
    const { studentId, date, rating } = req.body;

    try {
      const mongoose = require("mongoose");
      let studentObjectId;
      if (!mongoose.Types.ObjectId.isValid(studentId)) {
        return res.status(400).json({ message: "Invalid student ID format" });
      }
      studentObjectId = new mongoose.Types.ObjectId(studentId);
      
      // Verify student exists
      const student = await Student.findById(studentObjectId);
      if (!student) {
        return res.status(404).json({ message: "Student not found" });
      }

      // Find the course
      const isInstructor = await Instructor.findById(req.user.id);
      
      let course;
      if (isInstructor) {
        course = await Course.findOne({
          courseNumber,
          instructor: req.user.id,
        });
      } else {
        // Student: verify they're adding their own bus factor
        if (req.user.id !== studentObjectId.toString()) {
          return res.status(403).json({ message: "Students can only add their own bus factor" });
        }
        
        course = await Course.findOne({ courseNumber });
        if (!course) {
          return res.status(404).json({ message: "Course not found" });
        }
        
        const isEnrolled = student.courses && student.courses.includes(courseNumber);
        if (!isEnrolled) {
          return res.status(403).json({ message: "Student is not enrolled in this course" });
        }
      }

      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }

      // Find the project within the course
      const project = course.projects.id(projectId);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }

      // Verify student is in the project
      const isStudentInProject = project.students.some((s) => {
        if (typeof s === "string") {
          return s === studentObjectId.toString() || s === student.email;
        }
        return s.toString() === studentObjectId.toString();
      });

      if (!isStudentInProject) {
        return res.status(400).json({ message: "Student is not assigned to this project" });
      }

      // Get team size for max rating validation
      const teamSize = project.students.length;
      const ratingInt = parseInt(rating);
      if (ratingInt > teamSize) {
        return res.status(400).json({ 
          message: `Rating must be between 1 and ${teamSize} (team size)` 
        });
      }

      // Parse and validate date
      const busFactorDate = new Date(date);
      if (isNaN(busFactorDate.getTime())) {
        return res.status(400).json({ message: "Invalid date format" });
      }

      // Normalize date to start of day
      const normalizedDate = new Date(busFactorDate);
      normalizedDate.setHours(0, 0, 0, 0);
      normalizedDate.setMinutes(0, 0, 0);
      normalizedDate.setSeconds(0, 0);
      normalizedDate.setMilliseconds(0);

      // Check if student has already recorded bus factor within the last 2 days (once every couple days)
      const twoDaysAgo = new Date(normalizedDate);
      twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
      
      const recentEntry = await BusFactor.findOne({
        student: studentObjectId,
        project: projectId,
        date: { $gte: twoDaysAgo, $lte: normalizedDate }
      });

      if (recentEntry && recentEntry.date.getTime() !== normalizedDate.getTime()) {
        const daysSince = Math.floor((normalizedDate - recentEntry.date) / (1000 * 60 * 60 * 24));
        return res.status(400).json({ 
          message: `You can only record bus factor once every couple days. Last recorded ${daysSince} day(s) ago.` 
        });
      }

      // Create or update bus factor entry
      const updateData = {
        project: projectId,
        student: studentObjectId,
        date: normalizedDate,
        rating: ratingInt,
        updatedAt: new Date(),
      };
      
      const busFactorEntry = await BusFactor.findOneAndUpdate(
        {
          student: studentObjectId,
          project: projectId,
          date: normalizedDate,
        },
        updateData,
        {
          upsert: true,
          new: true,
          setDefaultsOnInsert: true,
        }
      );

      res.json({
        success: true,
        message: "Bus factor entry added/updated successfully",
        busFactor: busFactorEntry,
      });
    } catch (err) {
      console.error("Error adding bus factor:", err);
      if (err.code === 11000) {
        return res.status(409).json({ message: "Bus factor entry already exists for this date" });
      }
      res.status(500).json({ message: "Error adding bus factor: " + err.message });
    }
  }
);

// ---------- Get Bus Factor Data for a Student in a Project (for instructors) ----------
router.get(
  "/course/:courseNumber/project/:projectId/student/:studentId/bus-factor",
  requireAuth,
  async (req, res) => {
    try {
      const { courseNumber, projectId, studentId } = req.params;

      // Verify course ownership (instructor only)
      const course = await Course.findOne({
        courseNumber,
        instructor: req.user.id,
      });

      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }

      // Verify project exists
      const project = course.projects.id(projectId);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }

      // Verify student exists
      const student = await Student.findById(studentId);
      if (!student) {
        return res.status(404).json({ message: "Student not found" });
      }

      // Get all bus factor entries for this student in this project
      const busFactors = await BusFactor.find({
        project: projectId,
        student: studentId,
      })
        .sort({ date: 1 })
        .lean();

      // Transform to match frontend format (x: date, y: rating)
      const formattedData = busFactors.map((entry) => ({
        x: entry.date.toISOString().split("T")[0],
        y: entry.rating,
        id: entry._id,
      }));

      res.json({
        success: true,
        student: {
          id: student._id,
          email: student.email,
          firstName: student.firstName,
          lastName: student.lastName,
        },
        projectTitle: project.title,
        courseNumber: course.courseNumber,
        courseName: course.courseName,
        busFactors: formattedData,
      });
    } catch (err) {
      console.error("Error fetching bus factor:", err);
      res.status(500).json({ message: "Error fetching bus factor: " + err.message });
    }
  }
);

// ---------- Get Project-Level Daily Average Bus Factor (for students) ----------
router.get(
  "/course/:courseNumber/project/:projectId/bus-factor-average",
  requireAuth,
  async (req, res) => {
    try {
      const { courseNumber, projectId } = req.params;

      // Find the course
      const course = await Course.findOne({ courseNumber });
      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }

      // Verify project exists
      const project = course.projects.id(projectId);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }

      // Get all bus factor entries for this project
      const busFactors = await BusFactor.find({
        project: projectId,
      })
        .sort({ date: 1 })
        .lean();

      // Group by date and calculate average
      const groupedByDate = {};
      busFactors.forEach((entry) => {
        const dateStr = entry.date.toISOString().split("T")[0];
        if (!groupedByDate[dateStr]) {
          groupedByDate[dateStr] = { total: 0, count: 0 };
        }
        groupedByDate[dateStr].total += entry.rating;
        groupedByDate[dateStr].count += 1;
      });

      // Transform to frontend format
      const formattedData = Object.keys(groupedByDate).map((dateStr) => ({
        x: dateStr,
        y: Math.round((groupedByDate[dateStr].total / groupedByDate[dateStr].count) * 10) / 10, // Round to 1 decimal
        count: groupedByDate[dateStr].count,
      }));

      res.json({
        success: true,
        projectTitle: project.title,
        courseNumber: course.courseNumber,
        courseName: course.courseName,
        busFactorAverage: formattedData,
      });
    } catch (err) {
      console.error("Error fetching bus factor average:", err);
      res.status(500).json({ message: "Error fetching bus factor average: " + err.message });
    }
  }
);

module.exports = router;

