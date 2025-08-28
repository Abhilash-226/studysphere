// Simple script to check tutor data in the database
const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();

// Define the tutor model schema
const tutorSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  qualification: String,
  experience: String,
  specialization: String,
  subjects: [String],
  teachingMode: [String],
  bio: String,
  universityName: String,
  hourlyRate: Number,
});

// Create the model
const Tutor = mongoose.model("Tutor", tutorSchema);

// Get MongoDB URI from server.js environment
const MONGO_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/studysphere";
console.log(`Using MongoDB URI: ${MONGO_URI}`);

// Connect to MongoDB
mongoose
  .connect(MONGO_URI)
  .then(async () => {
    console.log("Connected to MongoDB");

    // Find all tutors
    const tutors = await Tutor.find().populate({
      path: "user",
      select: "firstName lastName email",
    });

    console.log(`Found ${tutors.length} tutors`);

    // Print each tutor's name, specialization, and subjects
    tutors.forEach((tutor, index) => {
      console.log(`\nTutor #${index + 1}:`);
      console.log(
        `Name: ${
          tutor.user
            ? tutor.user.firstName + " " + tutor.user.lastName
            : "Unknown"
        }`
      );
      console.log(`Email: ${tutor.user ? tutor.user.email : "Unknown"}`);
      console.log(`Specialization: ${tutor.specialization || "Not specified"}`);
      console.log(
        `Subjects: ${
          tutor.subjects && tutor.subjects.length > 0
            ? tutor.subjects.join(", ")
            : "No subjects"
        }`
      );
      console.log(
        `Teaching Modes: ${
          tutor.teachingMode && tutor.teachingMode.length > 0
            ? tutor.teachingMode.join(", ")
            : "No teaching modes"
        }`
      );
    });

    // Close the connection
    mongoose.connection.close();
    console.log("\nConnection closed");
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB:", err.message);
  });
