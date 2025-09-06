const mongoose = require("mongoose");
require("dotenv").config();

// Import models
const User = require("../src/models/user.model");
const Student = require("../src/models/student.model");
const Tutor = require("../src/models/tutor.model");

const clearAllUsers = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    // Delete all students
    const deletedStudents = await Student.deleteMany({});
    console.log(`Deleted ${deletedStudents.deletedCount} student records`);

    // Delete all tutors
    const deletedTutors = await Tutor.deleteMany({});
    console.log(`Deleted ${deletedTutors.deletedCount} tutor records`);

    // Delete all users
    const deletedUsers = await User.deleteMany({});
    console.log(`Deleted ${deletedUsers.deletedCount} user records`);

    console.log("All users have been successfully deleted from the database");

    // Close the connection
    await mongoose.connection.close();
    console.log("Database connection closed");
  } catch (error) {
    console.error("Error clearing users:", error);
  } finally {
    process.exit();
  }
};

// Run the script
clearAllUsers();
