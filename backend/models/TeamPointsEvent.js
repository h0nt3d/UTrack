const mongoose = require("mongoose");

/**
 * Team Points Distribution Event Schema
 * Represents an event where students submit point allocations for their teammates
 * Each event is tied to a specific project and has a roster snapshot
 */
const teamPointsEventSchema = new mongoose.Schema(
  {
    courseId: {
      type: String, // courseNumber
      required: true,
      trim: true,
    },
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    status: {
      type: String,
      enum: ["Open", "Closed"],
      default: "Open",
      required: true,
    },
    dueDate: {
      type: Date,
      default: null, // Optional
    },
    roster: [
      {
        studentId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Student",
          required: true,
        },
        studentEmail: {
          type: String,
          required: true,
        },
        studentName: {
          type: String,
          required: true,
        },
      },
    ],
    createdAt: {
      type: Date,
      default: Date.now,
    },
    closedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    strict: true,
  }
);

// Index for querying open events by project
teamPointsEventSchema.index({ projectId: 1, status: 1 }, { name: "project_status_index" });

module.exports = mongoose.model("TeamPointsEvent", teamPointsEventSchema);

