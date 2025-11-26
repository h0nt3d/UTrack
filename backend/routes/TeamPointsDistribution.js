const express = require("express");
const { body, validationResult } = require("express-validator");
const { requireAuth } = require("../middleware/auth");
const TeamPointsEvent = require("../models/TeamPointsEvent");
const TeamPointsSubmission = require("../models/TeamPointsSubmission");
const TeamPointsScalingFactor = require("../models/TeamPointsScalingFactor");
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

// ---------- Create Team Points Distribution Event (Instructor Only) ----------
router.post(
  "/course/:courseNumber/project/:projectId/points/events",
  requireAuth,
  [
    body("dueDate")
      .optional()
      .isISO8601()
      .withMessage("Due date must be a valid ISO 8601 date"),
  ],
  async (req, res) => {
    if (!handleValidation(req, res)) return;

    const { courseNumber, projectId } = req.params;
    const { dueDate } = req.body;

    try {
      // Verify user is an instructor
      const instructor = await Instructor.findById(req.user.id);
      if (!instructor) {
        return res.status(403).json({ message: "Only instructors can create events" });
      }

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

      // Convert projectId to ObjectId
      const mongoose = require("mongoose");
      let projectObjectId;
      if (mongoose.Types.ObjectId.isValid(projectId)) {
        projectObjectId = new mongoose.Types.ObjectId(projectId);
      } else {
        return res.status(400).json({ message: "Invalid project ID" });
      }

      // Check if there's already an Open event
      const existingOpenEvent = await TeamPointsEvent.findOne({
        projectId: projectObjectId,
        status: "Open",
      });

      if (existingOpenEvent) {
        return res.status(409).json({ 
          message: "An open event already exists for this project. Please close it first." 
        });
      }

      // Build roster snapshot from project students
      const roster = [];
      for (const studentRef of project.students) {
        let student;
        // Check if studentRef is an ObjectId or email
          if (typeof studentRef === "string") {
            // Try to find by email first
            student = await Student.findOne({ email: studentRef });
            if (!student) {
              // Try as ObjectId
              const mongoose = require("mongoose");
              if (mongoose.Types.ObjectId.isValid(studentRef)) {
                student = await Student.findById(studentRef);
              }
            }
          } else {
            student = await Student.findById(studentRef);
          }

        if (student) {
          roster.push({
            studentId: student._id,
            studentEmail: student.email,
            studentName: `${student.firstName || ""} ${student.lastName || ""}`.trim() || student.email,
          });
        }
      }

      if (roster.length === 0) {
        return res.status(400).json({ message: "Project has no students assigned" });
      }

      // Create event (projectObjectId already set above)
      const eventData = {
        courseId: courseNumber,
        projectId: projectObjectId,
        status: "Open",
        roster: roster,
        dueDate: dueDate ? new Date(dueDate) : null,
      };

      const event = await TeamPointsEvent.create(eventData);

      res.json({
        success: true,
        message: "Team Points Distribution event created successfully",
        event: {
          id: event._id,
          courseId: event.courseId,
          projectId: event.projectId,
          status: event.status,
          dueDate: event.dueDate,
          roster: event.roster,
          createdAt: event.createdAt,
        },
      });
    } catch (err) {
      console.error("Error creating event:", err);
      res.status(500).json({ message: "Error creating event: " + err.message });
    }
  }
);

// ---------- Close Team Points Distribution Event (Instructor Only) ----------
router.patch(
  "/course/:courseNumber/project/:projectId/points/events/:eventId",
  requireAuth,
  async (req, res) => {
    const { courseNumber, projectId, eventId } = req.params;

    try {
      // Verify user is an instructor
      const instructor = await Instructor.findById(req.user.id);
      if (!instructor) {
        return res.status(403).json({ message: "Only instructors can close events" });
      }

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

      // Find and update event
      const event = await TeamPointsEvent.findById(eventId);
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }

      if (event.projectId.toString() !== projectId) {
        return res.status(400).json({ message: "Event does not belong to this project" });
      }

      if (event.status === "Closed") {
        return res.status(400).json({ message: "Event is already closed" });
      }

      // Close the event
      event.status = "Closed";
      event.closedAt = new Date();
      await event.save();

      // Compute scaling factors
      await computeScalingFactors(eventId, event.roster.length);

      res.json({
        success: true,
        message: "Event closed and scaling factors computed",
        event: {
          id: event._id,
          status: event.status,
          closedAt: event.closedAt,
        },
      });
    } catch (err) {
      console.error("Error closing event:", err);
      res.status(500).json({ message: "Error closing event: " + err.message });
    }
  }
);

// ---------- Get Open Event for Student ----------
router.get(
  "/course/:courseNumber/project/:projectId/points/events/open",
  requireAuth,
  async (req, res) => {
    const { courseNumber, projectId } = req.params;

    try {
      // Convert projectId to ObjectId for query
      const mongoose = require("mongoose");
      let projectObjectId;
      if (mongoose.Types.ObjectId.isValid(projectId)) {
        projectObjectId = new mongoose.Types.ObjectId(projectId);
      } else {
        return res.status(400).json({ message: "Invalid project ID" });
      }

      // Find open event
      const event = await TeamPointsEvent.findOne({
        courseId: courseNumber,
        projectId: projectObjectId,
        status: "Open",
      }).lean();

      if (!event) {
        return res.json({
          success: true,
          event: null,
          hasSubmitted: false,
        });
      }

      // Check if current user has submitted
      const student = await Student.findById(req.user.id);
      if (!student) {
        return res.status(404).json({ message: "Student not found" });
      }

      const submission = await TeamPointsSubmission.findOne({
        eventId: event._id,
        raterId: req.user.id,
      });

      // Check if due date has passed
      const now = new Date();
      const isPastDue = event.dueDate && new Date(event.dueDate) < now;

      res.json({
        success: true,
        event: {
          id: event._id,
          courseId: event.courseId,
          projectId: event.projectId,
          status: isPastDue ? "Past Due" : event.status,
          dueDate: event.dueDate,
          roster: event.roster,
          createdAt: event.createdAt,
        },
        hasSubmitted: !!submission,
        submissionId: submission ? submission._id : null,
      });
    } catch (err) {
      console.error("Error fetching open event:", err);
      res.status(500).json({ message: "Error fetching open event: " + err.message });
    }
  }
);

// ---------- Get All Events for Project (Instructor Only) ----------
router.get(
  "/course/:courseNumber/project/:projectId/points/events",
  requireAuth,
  async (req, res) => {
    const { courseNumber, projectId } = req.params;

    try {
      // Verify user is an instructor
      const instructor = await Instructor.findById(req.user.id);
      if (!instructor) {
        return res.status(403).json({ message: "Only instructors can view events" });
      }

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

      // Convert projectId to ObjectId for query
      const mongoose = require("mongoose");
      let projectObjectId;
      if (mongoose.Types.ObjectId.isValid(projectId)) {
        projectObjectId = new mongoose.Types.ObjectId(projectId);
      } else {
        return res.status(400).json({ message: "Invalid project ID" });
      }

      // Get all events for this project
      const events = await TeamPointsEvent.find({ projectId: projectObjectId })
        .sort({ createdAt: -1 })
        .lean();

      // Get submission counts for each event
      const eventsWithCounts = await Promise.all(
        events.map(async (event) => {
          const submissionCount = await TeamPointsSubmission.countDocuments({
            eventId: event._id,
          });
          const now = new Date();
          const isPastDue = event.dueDate && new Date(event.dueDate) < now && event.status === "Open";
          
          return {
            id: event._id,
            courseId: event.courseId,
            projectId: event.projectId,
            status: isPastDue ? "Past Due" : event.status,
            dueDate: event.dueDate,
            rosterSize: event.roster.length,
            submissionCount: submissionCount,
            totalExpected: event.roster.length,
            createdAt: event.createdAt,
            closedAt: event.closedAt,
          };
        })
      );

      res.json({
        success: true,
        events: eventsWithCounts,
      });
    } catch (err) {
      console.error("Error fetching events:", err);
      res.status(500).json({ message: "Error fetching events: " + err.message });
    }
  }
);

// ---------- Submit Team Points (Student) ----------
router.post(
  "/course/:courseNumber/project/:projectId/points/submit",
  requireAuth,
  [
    body("eventId")
      .exists({ checkFalsy: true })
      .withMessage("Event ID is required")
      .isMongoId()
      .withMessage("Event ID must be a valid MongoDB ObjectId"),
    body("ratings")
      .isArray({ min: 1 })
      .withMessage("Ratings must be a non-empty array"),
    body("ratings.*.rateeId")
      .exists({ checkFalsy: true })
      .withMessage("Ratee ID is required for each rating")
      .isMongoId()
      .withMessage("Ratee ID must be a valid MongoDB ObjectId"),
    body("ratings.*.points")
      .exists({ checkFalsy: true })
      .withMessage("Points are required for each rating")
      .isInt({ min: 0 })
      .withMessage("Points must be a non-negative integer"),
  ],
  async (req, res) => {
    if (!handleValidation(req, res)) return;

    const { projectId } = req.params;
    const { eventId, ratings } = req.body;

    try {
      // Verify student exists
      const student = await Student.findById(req.user.id);
      if (!student) {
        return res.status(404).json({ message: "Student not found" });
      }

      // Verify event exists and is open
      const event = await TeamPointsEvent.findById(eventId);
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }

      if (event.projectId.toString() !== projectId) {
        return res.status(400).json({ message: "Event does not belong to this project" });
      }

      if (event.status !== "Open") {
        return res.status(400).json({ message: "Event is not open for submissions" });
      }

      // Check if due date has passed
      if (event.dueDate && new Date(event.dueDate) < new Date()) {
        return res.status(400).json({ message: "Event due date has passed" });
      }

      // Check if student has already submitted
      const existingSubmission = await TeamPointsSubmission.findOne({
        eventId: eventId,
        raterId: req.user.id,
      });

      if (existingSubmission) {
        return res.status(409).json({ message: "You have already submitted for this event" });
      }

      // Verify student is in roster
      const isInRoster = event.roster.some(
        (r) => r.studentId.toString() === req.user.id.toString()
      );
      if (!isInRoster) {
        return res.status(403).json({ message: "You are not part of this event roster" });
      }

      // Validate ratings match roster
      const teamSize = event.roster.length;
      const expectedTotal = teamSize * 10;

      // Check that all roster members are included
      const rateeIds = ratings.map((r) => r.rateeId.toString());
      const rosterIds = event.roster.map((r) => r.studentId.toString());

      if (rateeIds.length !== rosterIds.length) {
        return res.status(400).json({ 
          message: `Must rate exactly ${teamSize} team members (including yourself)` 
        });
      }

      for (const rosterId of rosterIds) {
        if (!rateeIds.includes(rosterId)) {
          return res.status(400).json({ 
            message: `Missing rating for team member` 
          });
        }
      }

      // Validate points
      let totalPoints = 0;
      for (const rating of ratings) {
        if (!Number.isInteger(rating.points) || rating.points < 0) {
          return res.status(400).json({ 
            message: "All points must be non-negative integers" 
          });
        }
        totalPoints += rating.points;
      }

      if (totalPoints !== expectedTotal) {
        return res.status(400).json({ 
          message: `Total points must equal ${expectedTotal} (team size × 10). Current total: ${totalPoints}` 
        });
      }

      // Create submission
      const submission = await TeamPointsSubmission.create({
        eventId: eventId,
        raterId: req.user.id,
        ratings: ratings.map((r) => ({
          rateeId: r.rateeId,
          points: r.points,
        })),
        totalPoints: totalPoints,
      });

      res.json({
        success: true,
        message: "Points submitted successfully",
        submission: {
          id: submission._id,
          eventId: submission.eventId,
          totalPoints: submission.totalPoints,
          submittedAt: submission.submittedAt,
        },
      });
    } catch (err) {
      console.error("Error submitting points:", err);
      if (err.code === 11000) {
        return res.status(409).json({ message: "You have already submitted for this event" });
      }
      res.status(500).json({ message: "Error submitting points: " + err.message });
    }
  }
);

// ---------- Get Scaling Factors (Instructor Only) ----------
router.get(
  "/course/:courseNumber/project/:projectId/points/scaling-factors",
  requireAuth,
  async (req, res) => {
    const { courseNumber, projectId } = req.params;

    try {
      // Verify user is an instructor
      const instructor = await Instructor.findById(req.user.id);
      if (!instructor) {
        return res.status(403).json({ message: "Only instructors can view scaling factors" });
      }

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

      // Convert projectId to ObjectId for query
      const mongoose = require("mongoose");
      let projectObjectId;
      if (mongoose.Types.ObjectId.isValid(projectId)) {
        projectObjectId = new mongoose.Types.ObjectId(projectId);
      } else {
        return res.status(400).json({ message: "Invalid project ID" });
      }

      // Get all closed events for this project
      const events = await TeamPointsEvent.find({
        projectId: projectObjectId,
        status: "Closed",
      }).sort({ createdAt: -1 });

      // Get scaling factors for all events
      const scalingFactorsByEvent = await Promise.all(
        events.map(async (event) => {
          const factors = await TeamPointsScalingFactor.find({ eventId: event._id })
            .populate("studentId", "firstName lastName email")
            .sort({ scalingFactor: -1 })
            .lean();

          return {
            eventId: event._id,
            eventCreatedAt: event.createdAt,
            eventClosedAt: event.closedAt,
            scalingFactors: factors.map((f) => ({
              studentId: f.studentId._id,
              studentEmail: f.studentId.email,
              studentName: `${f.studentId.firstName || ""} ${f.studentId.lastName || ""}`.trim() || f.studentId.email,
              totalReceived: f.totalReceived,
              teamSize: f.teamSize,
              scalingFactor: f.scalingFactor,
              computedAt: f.computedAt,
            })),
          };
        })
      );

      res.json({
        success: true,
        scalingFactorsByEvent: scalingFactorsByEvent,
      });
    } catch (err) {
      console.error("Error fetching scaling factors:", err);
      res.status(500).json({ message: "Error fetching scaling factors: " + err.message });
    }
  }
);

// ---------- Get Scaling Factor for Specific Student (Instructor Only) ----------
router.get(
  "/course/:courseNumber/project/:projectId/student/:studentId/points/scaling-factors",
  requireAuth,
  async (req, res) => {
    const { courseNumber, projectId, studentId } = req.params;

    try {
      // Verify user is an instructor
      const instructor = await Instructor.findById(req.user.id);
      if (!instructor) {
        return res.status(403).json({ message: "Only instructors can view scaling factors" });
      }

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
      const student = await Student.findById(studentId);
      if (!student) {
        return res.status(404).json({ message: "Student not found" });
      }

      // Convert projectId to ObjectId for query
      const mongoose = require("mongoose");
      let projectObjectId;
      if (mongoose.Types.ObjectId.isValid(projectId)) {
        projectObjectId = new mongoose.Types.ObjectId(projectId);
      } else {
        return res.status(400).json({ message: "Invalid project ID" });
      }

      // Get all closed events for this project
      const events = await TeamPointsEvent.find({
        projectId: projectObjectId,
        status: "Closed",
      }).sort({ createdAt: -1 });

      // Get scaling factors for this student across all events
      const scalingFactors = await Promise.all(
        events.map(async (event) => {
          const factor = await TeamPointsScalingFactor.findOne({
            eventId: event._id,
            studentId: studentId,
          }).lean();

          if (!factor) return null;

          return {
            eventId: event._id,
            eventCreatedAt: event.createdAt,
            eventClosedAt: event.closedAt,
            scalingFactor: factor.scalingFactor,
            totalReceived: factor.totalReceived,
            teamSize: factor.teamSize,
            computedAt: factor.computedAt,
          };
        })
      );

      // Filter out null values
      const validFactors = scalingFactors.filter((f) => f !== null);

      res.json({
        success: true,
        student: {
          id: student._id,
          email: student.email,
          firstName: student.firstName,
          lastName: student.lastName,
        },
        scalingFactors: validFactors,
      });
    } catch (err) {
      console.error("Error fetching student scaling factors:", err);
      res.status(500).json({ message: "Error fetching student scaling factors: " + err.message });
    }
  }
);

// Helper function to compute scaling factors when event closes
async function computeScalingFactors(eventId, teamSize) {
  try {
    const event = await TeamPointsEvent.findById(eventId);
    if (!event) {
      throw new Error("Event not found");
    }

    const expectedTotal = teamSize * 10;

    // Get all submissions for this event
    const submissions = await TeamPointsSubmission.find({ eventId: eventId }).lean();

    // Initialize totals for each student
    const totals = {};
    event.roster.forEach((member) => {
      totals[member.studentId.toString()] = 0;
    });

    // Sum points received by each student
    submissions.forEach((submission) => {
      submission.ratings.forEach((rating) => {
        const rateeId = rating.rateeId.toString();
        if (totals[rateeId] !== undefined) {
          totals[rateeId] += rating.points;
        }
      });
    });

    // Handle missing submissions (equal-share fallback: 10 points per teammate)
    const submittedRaterIds = new Set(submissions.map((s) => s.raterId.toString()));
    const missingRaters = event.roster.filter(
      (member) => !submittedRaterIds.has(member.studentId.toString())
    );

    // For each missing rater, add 10 points to each teammate
    missingRaters.forEach(() => {
      event.roster.forEach((member) => {
        totals[member.studentId.toString()] += 10;
      });
    });

    // Compute and store scaling factors
    const scalingFactors = [];
    for (const [studentId, totalReceived] of Object.entries(totals)) {
      const scalingFactor = totalReceived / expectedTotal;
      
      // Delete existing scaling factor if it exists
      await TeamPointsScalingFactor.deleteOne({
        eventId: eventId,
        studentId: studentId,
      });

      // Create new scaling factor
      const factor = await TeamPointsScalingFactor.create({
        eventId: eventId,
        studentId: studentId,
        totalReceived: totalReceived,
        teamSize: teamSize,
        scalingFactor: scalingFactor,
      });

      scalingFactors.push(factor);
    }

    return scalingFactors;
  } catch (err) {
    console.error("Error computing scaling factors:", err);
    throw err;
  }
}

module.exports = router;

