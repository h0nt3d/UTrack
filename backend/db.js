const mongoose = require("mongoose");

const uri = "mongodb://admin:password@localhost:27017/school?authSource=admin";

async function connectToMongo() {
  await mongoose.connect(uri).then(()=> console.log("Connected to Mongo Successfully")).catch(err => console.log(err));
}

module.exports = connectToMongo;