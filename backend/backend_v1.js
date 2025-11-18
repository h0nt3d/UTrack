const mongoose = require("mongoose");
const cors = require("cors");
const express = require("express");



const port = 5000;
const app = express();
app.use(express.json());
app.use(cors());

const connectToMongo = require("./db");
connectToMongo()
  .catch(err => {
    console.error("Mongo connection error:", err);
    process.exit(1);
  });


const Instructor = require("./models/Instructor");
const Course = require("./models/Course");

//Getting User
app.get("/user/:email", async(req, res) => {
	try {
		const email = decodeURIComponent(req.params.email).toLowerCase();
		const user = await Instructor.findOne({ email });
		if (!user) return res.status(404).json({message: "User not found"});
		res.json(user);
	}
	catch(err) {
		console.error("Error fetching user", err);
		res.status(500).json({message: "Error fetch user"});
	}
});

const {router: authRouter, createUser} = require("./routes/authnticatn");
app.use('/api/auth',authRouter);

const instructorCourseRouter = require("./routes/InstructorCourse");
app.use("/api/auth", instructorCourseRouter);

const studentRouter = require("./routes/Student");
app.use("/api/students", studentRouter);

const joyFactorRouter = require("./routes/JoyFactor");
app.use("/api", joyFactorRouter);

const busFactorRouter = require("./routes/BusFactor");
app.use("/api", busFactorRouter);

const studentAuthRouter = require("./routes/studentAuth");
app.use("/api/student-auth", studentAuthRouter);

// Email-based routes for course management
app.get("/get-courses/:email", async (req, res) => {
  try {
    const email = decodeURIComponent(req.params.email).toLowerCase();
    const instructor = await Instructor.findOne({ email });
    if (!instructor) return res.status(404).json({ message: "Instructor not found" });
    
    const courses = await Course.find({ instructor: instructor._id }).lean();
    res.json({ courses });
  } catch (err) {
    console.error("Error fetching courses:", err);
    res.status(500).json({ message: "Error fetching courses: " + err.message });
  }
});

app.post("/add-course/:email", async (req, res) => {
  try {
    const email = decodeURIComponent(req.params.email).toLowerCase();
    const instructor = await Instructor.findOne({ email });
    if (!instructor) return res.status(404).json({ message: "Instructor not found" });
    
    const { courseNumber, courseName, description = "" } = req.body;
    
    // Check if this instructor already has a course with same courseNumber
    const existingCourse = await Course.findOne({ courseNumber, instructor: instructor._id });
    if (existingCourse) return res.status(409).json({ message: "courseNumber already exists" });
    
    // Create and save course
    const newCourse = await Course.create({
      courseNumber,
      courseName,
      description,
      instructor: instructor._id,
      students: [],
    });
    
    // Add course reference to instructor
    instructor.courses.push(newCourse._id);
    await instructor.save();
    
    // Return all courses for this instructor
    const courses = await Course.find({ instructor: instructor._id }).lean();
    res.json({ success: true, message: "Course created", course: newCourse, courses });
  } catch (err) {
    console.error("Error adding course:", err);
    res.status(500).json({ message: "Error adding course: " + err.message });
  }
});

app.listen(port, () => console.log(`EServer Running on port http://localhost:${port}`));

