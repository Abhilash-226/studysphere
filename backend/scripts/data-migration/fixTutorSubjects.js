// Script to fix tutor subjects by copying from specialization
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

    // Find all tutors with empty subjects
    const tutors = await Tutor.find({
      $or: [{ subjects: { $exists: false } }, { subjects: { $size: 0 } }],
      specialization: { $exists: true, $ne: "" },
    });

    console.log(
      `Found ${tutors.length} tutors with missing subjects but having specialization`
    );

    // Update each tutor to add their specialization to subjects
    let updatedCount = 0;
    for (const tutor of tutors) {
      if (tutor.specialization) {
        tutor.subjects = [tutor.specialization];
        await tutor.save();
        updatedCount++;
        console.log(
          `Updated tutor: ${tutor._id} - Added ${tutor.specialization} to subjects`
        );
      }
    }

    console.log(`\nUpdated ${updatedCount} tutors`);

    // Verify the update
    const verifyTutors = await Tutor.find();
    console.log(
      `\nVerification: ${
        verifyTutors.filter((t) => t.subjects && t.subjects.length > 0).length
      } tutors now have subjects`
    );

    // Close the connection
    mongoose.connection.close();
    console.log("\nConnection closed");
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB:", err.message);
  });
