const mongoose = require("mongoose");
const User = require("./src/models/user.model");

async function checkUsers() {
  try {
    await mongoose.connect("mongodb://localhost:27017/studysphere");

    console.log("\n=== Sample Tutor Users ===");
    const tutors = await User.find({ role: "tutor" }).limit(5);
    tutors.forEach((user) => {
      console.log(`ID: ${user._id}`);
      console.log(`Name: '${user.firstName}' '${user.lastName}'`);
      console.log(`Email: ${user.email}`);
      console.log(`Full Name: '${user.firstName} ${user.lastName}'`);
      console.log("---");
    });

    console.log("\n=== Sample Student Users ===");
    const students = await User.find({ role: "student" }).limit(5);
    students.forEach((user) => {
      console.log(`ID: ${user._id}`);
      console.log(`Name: '${user.firstName}' '${user.lastName}'`);
      console.log(`Email: ${user.email}`);
      console.log(`Full Name: '${user.firstName} ${user.lastName}'`);
      console.log("---");
    });

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

checkUsers();
