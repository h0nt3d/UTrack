const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const cors = require("cors");
const express = require("express");

const port = 5000;
const app = express();
app.use(express.json());
app.use(cors());

const connectToMongo = require("./db");


const startApp = async () => {
    await connectToMongo();
    console.log("App is ready to use");
}
startApp();

app.listen(port, () => 
	console.log(`EServer Running  on port http://localhost:${port}`));






//createUser("Michael", "super-secret-password");


app.use("/api/auth", require("./routes/authnticatn"));

