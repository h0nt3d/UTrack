const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema({
  firstName: { type: String, required: false },
  lastName: { type: String, required: false },
  email: { type: String, required: true, unique: true },
  password: { type: String, default: "" },
  courses: [{ type: String }], // store courseNumber instead of ObjectId
});

module.exports = mongoose.model("Student", studentSchema);

