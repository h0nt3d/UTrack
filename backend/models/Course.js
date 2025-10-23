const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema(
  {
    courseNumber: { type: String, required: true, trim: true },
    courseName: { type: String, required: true, trim: true },
    description: { type: String, default: "", trim: true },
    instructor: { type: mongoose.Schema.Types.ObjectId, ref: "Instructor", required: true },
    students: [{ type: String }], // store student emails
  },
);

module.exports = mongoose.model("Course", courseSchema);

