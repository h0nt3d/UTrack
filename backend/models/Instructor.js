const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema({
  courseNumber: { type: String, required: true, trim: true },
  courseName: { type: String, required: true, trim: true },
  description: { type: String, default: "", trim: true },
  students: [String], // store student emails
}, { _id: false });

const instructorSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    courses: { type: [courseSchema], default: [] },
  },
  { timestamps: true }
);


// ---------- Validator: prevent duplicate courseNumber per instructor ----------
instructorSchema.path("courses").validate(function (courses) {
  const seen = new Set();
  for (const c of courses) {
    const key = (c.courseNumber || "").toLowerCase().trim();
    if (seen.has(key)) {
	    this.invalidate("courses", `Duplicate courseNumber: ${c.courseNumber}`);
	    return false;
    }
    seen.add(key);
  }
  return true;
}, "Duplicate courseNumber in courses.");

// ---------- Model Export ----------
module.exports = mongoose.model("Instructor", instructorSchema);

