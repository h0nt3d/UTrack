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

app.listen(port, () => console.log(`EServer Running on port http://localhost:${port}`));

