const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const cors = require("cors");
const express = require("express");

const port = 5000;
const app = express();
app.use(express.json());
app.use(cors());

const connectToMongo = require("./db.js");
const Instructor = require("./models/Instructor.js");
const {hashPassword} = require("./routes/hash");

const startApp = async () => {
    await connectToMongo();
}
startApp();


//Getting User Name
app.get("/user/:email", async(req, res) => {
	try {
		const user = await Instructor.findOne({email: req.params.email});
		if (!user) return res.status(404).json({message: "User not found"});
		res.json(user);
	}
	catch(err) {
		console.error("Error fetching user", err);
		res.status(500).json({message: "Error fetch user"});
	}
});






app.listen(port, () => console.log(`EServer Running on port http://localhost:${port}`));

app.use('/api/auth', require('./routes/authnticatn'));
app.use('/api/course', require('./routes/InstructorCourse'));
