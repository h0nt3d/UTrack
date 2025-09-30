const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const cors = require("cors");
const express = require("express");

const port = 5000;
const app = express();
app.use(express.json());
app.use(cors());

//Connecting to MongoDB
mongoose.connect("mongodb://admin:password@localhost:27017/school?authSource=admin", {
	useNewUrlParser: true,
	useUnifiedTopology: true,
});

//Schema Definition
const instructorSchema = new mongoose.Schema ({
	username: {type: String, required: true, unique: true},
	password: {type: String, required: true}
});

const Instructor = mongoose.model("Instructor", instructorSchema);

//Creating User
const saltRounds = 10;
async function createUser(username, password) {
	try {
		const hash = await bcrypt.hash(password, saltRounds);

		const newInstructor = new Instructor({
			username,
			password: hash,
		});
		
		//save to MongoDB
		await newInstructor.save();
		console.log("User saved: ", newInstructor);
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
	const {username, password} = req.body;

	try {
		const user = await createUser(username, password);
		res.json({message: "User created successfully", user});
	}
	catch(err) {
		res.status(500).json({message: "Error creating user with express"});
	}
});

//createUser("Michael", "super-secret-password");
app.listen(port, () => console.log(`Backend runiing on http:localhost:${port}`));
