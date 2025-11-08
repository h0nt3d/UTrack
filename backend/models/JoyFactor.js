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
      // No individual index - using compound index below
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
      // No individual index - using compound index below
    },
    // NOTE: studentEmail field is NOT used - only student ObjectId is used
    // This ensures each student has independent data per project per date
    date: {
      type: Date,
      required: true,
      // No individual index - using compound index below
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
   
    strict: true,
  }
);


joyFactorSchema.pre('save', function(next) {
  if (this.isModified('studentEmail')) {
    delete this.studentEmail;
  }
  next();
});

// Compound unique index - ensures unique entry per student-project-date combination
// This is the primary index that prevents duplicates and ensures independent data per student
joyFactorSchema.index(
  { student: 1, project: 1, date: 1 },
  { unique: true, name: "student_project_date_unique" }
);

// Additional index for querying by project and date (for instructor views)
joyFactorSchema.index({ project: 1, date: 1 }, { name: "project_date_index" });

module.exports = mongoose.model("JoyFactor", joyFactorSchema);

