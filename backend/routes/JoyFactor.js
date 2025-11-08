const express = require("express");
const { body, validationResult } = require("express-validator");
const { requireAuth } = require("../middleware/auth");
const JoyFactor = require("../models/JoyFactor");
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

// ---------- Add or Update Joy Factor Entry ----------
router.post(
  "/course/:courseNumber/project/:projectId/add-joy-factor",
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
      .isInt({ min: 1, max: 5 })
      .withMessage("Rating must be an integer between 1 and 5"),
  ],
  async (req, res) => {
    if (!handleValidation(req, res)) return;

    const { courseNumber, projectId } = req.params;
    const { studentId, date, rating } = req.body;

    try {
      // Convert studentId to ObjectId to ensure proper type
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

      // Find the course - check if user is instructor or student
      const isInstructor = await Instructor.findById(req.user.id);
      
      let course;
      if (isInstructor) {
        // Instructor: verify they own the course
        course = await Course.findOne({
          courseNumber,
          instructor: req.user.id,
        });
      } else {
        // Student: verify they're enrolled in the course and adding their own joy factor
        if (req.user.id !== studentObjectId.toString()) {
          return res.status(403).json({ message: "Students can only add their own joy factor" });
        }
        
        // Check if student is enrolled in the course
        course = await Course.findOne({ courseNumber });
        if (!course) {
          return res.status(404).json({ message: "Course not found" });
        }
        
        // Verify student is enrolled in the course
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
        return res
          .status(400)
          .json({ message: "Student is not assigned to this project" });
      }

      // Parse and validate date
      const joyFactorDate = new Date(date);
      if (isNaN(joyFactorDate.getTime())) {
        return res.status(400).json({ message: "Invalid date format" });
      }

      // Normalize date to start of day for consistent storage
      // Each student can have independent entries for the same date in the same project
      const normalizedDate = new Date(joyFactorDate);
      normalizedDate.setHours(0, 0, 0, 0);
      normalizedDate.setMinutes(0, 0, 0);
      normalizedDate.setSeconds(0, 0);
      normalizedDate.setMilliseconds(0);

      // Create or update joy factor entry for this specific student-project-date combination
      // The unique index { student: 1, project: 1, date: 1 } ensures each student has independent data
      // IMPORTANT: Using student ObjectId (NOT studentEmail) - each student has independent data
      // The query uses student ObjectId, so each student can save for the same date in the same project
      const updateData = {
        project: projectId,
        student: studentObjectId,  // Use ObjectId (NOT studentEmail) - ensures independent data per student
        date: normalizedDate,
        rating: parseInt(rating),
        updatedAt: new Date(),
      };
      
      // Explicitly ensure studentEmail is NOT in the update data
      // This prevents conflicts with any old index on studentEmail
      const joyFactorEntry = await JoyFactor.findOneAndUpdate(
        {
          student: studentObjectId,  // Query by student ObjectId - specific student
          project: projectId,        // Specific project
          date: normalizedDate,     // Exact normalized date (not a range)
        },
        updateData,  // Only update fields in updateData (no studentEmail)
        {
          upsert: true,  // Create if doesn't exist, update if exists
          new: true,
          setDefaultsOnInsert: true,
        }
      );

      res.json({
        success: true,
        message: "Joy factor entry added/updated successfully",
        joyFactor: joyFactorEntry,
      });
    } catch (err) {
      console.error("Error adding joy factor:", err);
      if (err.code === 11000) {
        // Duplicate key error
        return res
          .status(409)
          .json({ message: "Joy factor entry already exists for this date" });
      }
      res.status(500).json({ message: "Error adding joy factor: " + err.message });
    }
  }
);

// ---------- Get Joy Factor Data for a Student in a Project ----------
router.get(
  "/course/:courseNumber/project/:projectId/student/:studentId/joy-factor",
  requireAuth,
  async (req, res) => {

    try {
      const { courseNumber, projectId, studentId } = req.params;

      // Verify course ownership
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
      const student = 
         (await Student.findById(studentId))
      if (!student) {
        return res.status(404).json({ message: "Student not found" });
      }
      /*
      // Get all joy factor entries for this student in this project
      const joyFactors = await JoyFactor.find({
        project: projectId,
        student: studentId,
      })
        .sort({ date: 1 }) // Sort by date ascending
        .lean();

      // Transform to match frontend format (x: date, y: rating)
      const formattedData = joyFactors.map((entry) => ({
        x: entry.date.toISOString().split("T")[0], // Format as YYYY-MM-DD
        y: entry.rating,
        id: entry._id,
      }));

      */

      const testData = require("./JoyTestData.js");

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
        joyFactors: testData, //formattedData
      });

    } catch (err) {
      console.error("Error fetching joy factor:", err);
      res.status(500).json({ message: "Error fetching joy factor: " + err.message });
    }

  }
);

// ---------- Get All Joy Factor Data for a Project ----------
router.get(
  "/course/:courseNumber/project/:projectId/joy-factors",
  requireAuth,
  async (req, res) => {
    try {
      const { courseNumber, projectId } = req.params;

      // Verify course ownership
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

      // Get all joy factor entries for this project with student population
      const joyFactors = await JoyFactor.find({
        project: projectId,
      })
        .populate("student", "firstName lastName email")
        .sort({ date: 1 })
        .lean();

      // Group by student ID
      const groupedByStudent = {};
      joyFactors.forEach((entry) => {
        const studentId = entry.student._id.toString();
        if (!groupedByStudent[studentId]) {
          groupedByStudent[studentId] = {
            student: {
              id: entry.student._id,
              email: entry.student.email,
              firstName: entry.student.firstName,
              lastName: entry.student.lastName,
            },
            joyFactors: [],
          };
        }
        groupedByStudent[studentId].joyFactors.push({
          x: entry.date.toISOString().split("T")[0],
          y: entry.rating,
          id: entry._id,
        });
      });

      res.json({
        success: true,
        projectTitle: project.title,
        courseNumber: course.courseNumber,
        courseName: course.courseName,
        joyFactorsByStudent: groupedByStudent,
      });
    } catch (err) {
      console.error("Error fetching joy factors:", err);
      res.status(500).json({ message: "Error fetching joy factors: " + err.message });
    }
  }
);

// ---------- Update Joy Factor Entry ----------
router.put(
  "/course/:courseNumber/project/:projectId/joy-factor/:joyFactorId",
  requireAuth,
  [
    body("rating")
      .optional()
      .isInt({ min: 1, max: 5 })
      .withMessage("Rating must be an integer between 1 and 5"),
    body("date")
      .optional()
      .isISO8601()
      .withMessage("Date must be a valid ISO 8601 date"),
  ],
  async (req, res) => {
    if (!handleValidation(req, res)) return;

    const { courseNumber, projectId, joyFactorId } = req.params;
    const { rating, date } = req.body;

    try {
      // Verify course ownership
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

      // Find and update joy factor entry
      const updateData = {};
      if (rating !== undefined) updateData.rating = parseInt(rating);
      if (date) {
        const joyFactorDate = new Date(date);
        if (isNaN(joyFactorDate.getTime())) {
          return res.status(400).json({ message: "Invalid date format" });
        }
        updateData.date = joyFactorDate;
      }
      updateData.updatedAt = new Date();

      // Update the joy factor (also verifies it belongs to this project)
      const updatedJoyFactor = await JoyFactor.findOneAndUpdate(
        {
          _id: joyFactorId,
          project: projectId,
        },
        updateData,
        { new: true }
      );

      if (!updatedJoyFactor) {
        return res.status(404).json({ message: "Joy factor entry not found" });
      }

      res.json({
        success: true,
        message: "Joy factor updated successfully",
        joyFactor: updatedJoyFactor,
      });
    } catch (err) {
      console.error("Error updating joy factor:", err);
      res.status(500).json({ message: "Error updating joy factor: " + err.message });
    }
  }
);

// ---------- Delete Joy Factor Entry ----------
router.delete(
  "/course/:courseNumber/project/:projectId/joy-factor/:joyFactorId",
  requireAuth,
  async (req, res) => {
    try {
      const { courseNumber, projectId, joyFactorId } = req.params;

      // Verify course ownership
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

      // Verify and delete joy factor entry
      const joyFactor = await JoyFactor.findOneAndDelete({
        _id: joyFactorId,
        project: projectId,
      });

      if (!joyFactor) {
        return res.status(404).json({ message: "Joy factor entry not found" });
      }

      res.json({
        success: true,
        message: "Joy factor entry deleted successfully",
      });
    } catch (err) {
      console.error("Error deleting joy factor:", err);
      res.status(500).json({ message: "Error deleting joy factor: " + err.message });
    }
  }
);

module.exports = router;

