const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const cors = require("cors");
const express = require("express");

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

createUser("Michael", "super-secret-password");
