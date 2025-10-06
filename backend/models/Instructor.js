// models/Instructor.js
const mongoose = require("mongoose");

const instructorSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    // bcrypt hash of password
    password: {
      type: String,
      required: true,
    },
    courses: [
       {
          courseNumber: {
		  type: String,
		  required: true,
		  unique: true,
	  },
	  courseName: {
		  type: String,
		  required: true,
	  },
	  description: {
		  type: String,
		  default: "",
	  },
       },
    ],
  },
    {timestamps: true}
);

module.exports = mongoose.model("Instructor", instructorSchema);
