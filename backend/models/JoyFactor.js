const mongoose = require("mongoose");

/**
 * Joy Factor Schema
 * Stores joy factor ratings (1-5) for students in specific projects within courses
 * Structure: Project → Student → Joy Factor Entries
 * Course and Instructor information can be derived from the project
 */
const joyFactorSchema = new mongoose.Schema(
  {
    project: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
      index: true,
    },
    date: {
      type: Date,
      required: true,
      index: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
      validate: {
        validator: Number.isInteger,
        message: "Rating must be an integer between 1 and 5",
      },
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for efficient queries
// Ensures unique entry per student-project-date combination
joyFactorSchema.index(
  { student: 1, project: 1, date: 1 },
  { unique: true }
);

// Index for querying by project
joyFactorSchema.index({ project: 1, date: 1 });

// Index for querying student's joy factor history
joyFactorSchema.index({ student: 1, project: 1, date: 1 });

module.exports = mongoose.model("JoyFactor", joyFactorSchema);

