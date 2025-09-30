const bcrypt = require("bcrypt");
const saltRounds = 10;

//Hashing
async function hashPassword(password) {
	return await bcrypt.hash(password, saltRounds);
}

//Comparing plain password with hash
async function comparePassword(plainPassword, hash) {
	return await bcrypt.compare(plainPassword, hash);
}

module.exports = {
	hashPassword,
	comparePassword
};
