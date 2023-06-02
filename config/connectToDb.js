const mongoose = require("mongoose");

module.exports = async function connectToMongoDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("connect to mongoDB ^_^");
  } catch (error) {
    console.log("connection faild to mongoDB !", error);
  }
};
