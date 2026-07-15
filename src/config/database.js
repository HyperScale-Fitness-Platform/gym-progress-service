const mongoose = require("mongoose");

const uri = process.env.MONGO_URI || "mongodb://localhost:27017/gym-progress";

mongoose.connect(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

mongoose.connection.on("connected", () => {
  console.log("Mongoose connected to", uri);
});

mongoose.connection.on("error", (err) => {
  console.error("Mongoose connection error:", err);
});

module.exports = mongoose;
