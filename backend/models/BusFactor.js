const mongoose = require("mongoose");

/**
 * Bus Factor Schema
 * Stores bus factor ratings (1 to team size) for students in specific projects within courses
 * Structure: Project → Student → Bus Factor Entries
 * Bus Factor indicates how well a student's work is covered by others
 * 1 = bad (one person holding everything together), higher numbers = good
 * Students can record once every couple days per course
 */
const busFactorSchema = new mongoose.Schema(
  {
    project: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      validate: {
        validator: function(value) {
          // Max value will be validated in the route based on team size
          return Number.isInteger(value) && value >= 1;
        },
        message: "Rating must be an integer >= 1",
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
    strict: true,
  }
);

// Compound unique index - ensures unique entry per student-project-date combination
busFactorSchema.index(
  { student: 1, project: 1, date: 1 },
  { unique: true, name: "bus_factor_student_project_date_unique" }
);

// Additional index for querying by project and date (for project-level averages)
busFactorSchema.index({ project: 1, date: 1 }, { name: "bus_factor_project_date_index" });

module.exports = mongoose.model("BusFactor", busFactorSchema);

