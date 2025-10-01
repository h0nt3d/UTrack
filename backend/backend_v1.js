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
async function createUser(email, password) {
	try {
		const hash = await hashPassword(password);

		const newInstructor = new Instructor({
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
	finally {
		mongoose.connection.close();
	}
}

//Express Route
app.post("/signup", async(req, res) => {
	const {email, password} = req.body;

	try {
		const user = await createUser(email, password);
		res.json({message: "User created successfully", user});
	}
	catch(err) {
		res.status(500).json({message: "Error creating user with express"});
	}
});


app.listen(port, () => console.log(`EServer Running on port http://localhost:${port}`));

app.use('/api/auth', require('./routes/authnticatn'));
