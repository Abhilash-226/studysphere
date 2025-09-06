// File: fixTutorSubjects.js
// Simple script to find tutors without subjects and copy their specialization to subjects

// Load environment variables
require("dotenv").config();

// Import mongoose
const mongoose = require("mongoose");

// MongoDB connection string
const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/studysphere";
console.log(`Using MongoDB URI: ${MONGODB_URI}`);

// Connect to MongoDB
mongoose
  .connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    dbName: process.env.DB_NAME || "studysphere",
  })
  .then(async () => {
    console.log("Connected to MongoDB");

    // Import Tutor model
    const Tutor = mongoose.model(
      "Tutor",
      require("./src/models/tutor.model").schema
    );

    // Find tutors with specialization but no subjects
    const tutors = await Tutor.find();
    console.log(`Found ${tutors.length} total tutors`);

    let fixCount = 0;

    // Update each tutor that has no subjects
    for (const tutor of tutors) {
      if (
        (!tutor.subjects || tutor.subjects.length === 0) &&
        tutor.specialization
      ) {
        console.log(
          `Tutor ${tutor._id} has specialization "${tutor.specialization}" but no subjects`
        );
        tutor.subjects = [tutor.specialization];
        await tutor.save();
        fixCount++;
      } else {
        console.log(
          `Tutor ${tutor._id} already has subjects or no specialization`
        );
      }
    }

    console.log(
      `\nFixed ${fixCount} tutors by copying specialization to subjects`
    );

    // Close connection
    mongoose.connection.close();
    console.log("MongoDB connection closed");
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB:", error);
    process.exit(1);
  });
