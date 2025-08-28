// File: fixTutorData.js
// Script to fix both subjects and teaching modes for tutors

// Load environment variables
require("dotenv").config();

// Import MongoDB native driver
const { MongoClient, ObjectId } = require("mongodb");

// MongoDB connection string
const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/studysphere";
console.log(`Using MongoDB URI: ${MONGODB_URI}`);

// Connect to MongoDB directly with native driver
const client = new MongoClient(MONGODB_URI);

client
  .connect()
  .then(async () => {
    console.log("Connected to MongoDB");

    // Get database and collection
    const database = client.db(process.env.DB_NAME || "studysphere");
    const tutorCollection = database.collection("tutors");

    // Find all tutors
    const tutors = await tutorCollection.find({}).toArray();
    console.log(`Found ${tutors.length} total tutors`);

    let fixCount = 0;

    // Update each tutor directly
    for (const tutor of tutors) {
      // Extract specialization to use as subjects
      if (tutor.specialization) {
        console.log(
          `Tutor ${tutor._id} - Processing with specialization: "${tutor.specialization}"`
        );

        // Clean up and split specialization if it contains commas
        const subjectsList = tutor.specialization
          .split(",")
          .map((s) => s.trim());
        console.log(`  - Subjects to add: ${JSON.stringify(subjectsList)}`);

        // Convert old teaching modes to new format if needed
        let updatedTeachingModes = tutor.teachingMode || [];
        if (
          Array.isArray(updatedTeachingModes) &&
          updatedTeachingModes.includes("online")
        ) {
          updatedTeachingModes = updatedTeachingModes.filter(
            (mode) => mode !== "online"
          );
          updatedTeachingModes.push("online_individual");
        }
        if (
          Array.isArray(updatedTeachingModes) &&
          updatedTeachingModes.includes("offline")
        ) {
          updatedTeachingModes = updatedTeachingModes.filter(
            (mode) => mode !== "offline"
          );
          updatedTeachingModes.push("offline_home");
        }

        // Direct update with MongoDB driver
        const result = await tutorCollection.updateOne(
          { _id: tutor._id },
          {
            $set: {
              subjects: subjectsList,
              teachingMode: updatedTeachingModes,
            },
          }
        );

        console.log(
          `  - Update result: ${result.modifiedCount} document(s) modified`
        );
        if (result.modifiedCount > 0) {
          fixCount++;
        }
      }
    }

    console.log(`\nFixed ${fixCount} tutors`);

    // Close connection
    await client.close();
    console.log("MongoDB connection closed");
  })
  .catch((error) => {
    console.error("Error with MongoDB:", error);
    process.exit(1);
  });
