const prompt = require("prompt-sync")();
const bcrypt = require("bcrypt");

const saltRounds = 10;
const password = "Testing123";
const inputPassword = prompt("Please enter the password: ");

//Hashing
bcrypt.hash(password, saltRounds, function(err, hash) {
	if (err) {
		console.error("Error Hashing");
		return;
	}

	//Checking Password
	bcrypt.compare(inputPassword, hash, function(err, result) {
		if (err) {
			console.error("Error comparing password");
			return;
		}
		if (result == true) {
			console.log("Correct Password");
			console.log("Hash: ", hash);
		}
		else {
			console.log("Wrong Password");
		}
	});
});
