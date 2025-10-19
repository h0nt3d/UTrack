const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, default: "" }, // empty until first login
    courses: [
      {
        courseNumber: String,
        courseName: String,
        description: { type: String, default: "" },
      }
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Student", studentSchema);

