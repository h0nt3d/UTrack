const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    team: { type: String, required: true, trim: true },
    description: { type: String, default: "", trim: true },
    students: [
      {
        type: String, // store student emails, same as in the main course
        trim: true,
      },
    ],
    createdAt: { type: Date, default: Date.now },
  },
  { _id: true } // each project has its own ID within the array
);

const courseSchema = new mongoose.Schema(
  {
    courseNumber: { type: String, required: true, trim: true },
    courseName: { type: String, required: true, trim: true },
    description: { type: String, default: "", trim: true },
    instructor: { type: mongoose.Schema.Types.ObjectId, ref: "Instructor", required: true },
    projects: [projectSchema],
    students: [{ type: String }], // store student emails
  },
);

module.exports = mongoose.model("Course", courseSchema);

