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

//Creating User
async function createUser(firstName, lastName, email, password) {
	try {
		const hash = await hashPassword(password);

		const newInstructor = new Instructor({
			firstName,
			lastName,
			email,
			password: hash,
		});
		
		//save to MongoDB
		await newInstructor.save();
		console.log("User saved: ", newInstructor);
		return newInstructor;
	}
	catch(err) {
		console.error("Error saving user: ", err);
	}
}


//Express Route
app.post("/signup", async(req, res) => {
	const {firstName, lastName, email, password} = req.body;

	try {
		const user = await createUser(firstName, lastName, email, password);
		res.json({message: "User created successfully", user});
	}
	catch(err) {
		res.status(500).json({message: "Error creating user with express"});
	}
});


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

//app.use('/api/auth', require('./routes/authnticatn'));
