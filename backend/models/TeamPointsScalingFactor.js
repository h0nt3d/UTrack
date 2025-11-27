const mongoose = require("mongoose");

/**
 * Team Points Scaling Factor Schema
 * Stores computed scaling factors for each student per event
 * Scaling Factor = (sum of points received) / (teamSize × 10)
 * Only visible to instructors
 */
const teamPointsScalingFactorSchema = new mongoose.Schema(
  {
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TeamPointsEvent",
      required: true,
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
    totalReceived: {
      type: Number,
      required: true,
      min: 0,
    },
    teamSize: {
      type: Number,
      required: true,
      min: 1,
    },
    scalingFactor: {
      type: Number,
      required: true,
      min: 0,
    },
    computedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    strict: true,
  }
);

// Index for querying scaling factors by event
teamPointsScalingFactorSchema.index({ eventId: 1 }, { name: "event_index" });
// Index for querying scaling factors by student
teamPointsScalingFactorSchema.index({ studentId: 1, eventId: 1 }, { name: "student_event_index" });

module.exports = mongoose.model("TeamPointsScalingFactor", teamPointsScalingFactorSchema);

