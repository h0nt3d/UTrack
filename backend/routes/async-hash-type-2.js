const prompt = require("prompt-sync")();
const bcrypt = require("bcrypt");

const saltRounds = 10;
const password = "Testing123";

async function run() {
	const inputPassword = prompt("Please enter the password: ");

	try {
		//Creating Hash
		const hash = await bcrypt.hash(password, saltRounds);

		//Comparing Password to Hash
		const match = await bcrypt.compare(inputPassword, hash);

		if (match) {
			console.log("Correct Password");
			console.log("Hash: ", hash)
		}
		else {
			console.log("Wrong Password");
		}
	}
	catch (err) {
		console.err("Error: ", err);
	}
}

run();
