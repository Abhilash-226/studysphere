/**
 * Script to check tutor documents in the database
 * Run with: node scripts/checkTutorDocuments.js
 */

require("dotenv").config();
const mongoose = require("mongoose");
const Tutor = require("../src/models/tutor.model");
const User = require("../src/models/user.model");

async function checkTutorDocuments() {
  try {
    // Connect to MongoDB
    const mongoUri =
      process.env.MONGODB_URI || "mongodb://localhost:27017/studysphere";
    console.log("Connecting to MongoDB...");
    await mongoose.connect(mongoUri);
    console.log("Connected to MongoDB\n");

    // Find all tutors and their document status
    const tutors = await Tutor.find({})
      .populate("user", "firstName lastName email")
      .lean();

    console.log(`Found ${tutors.length} tutors\n`);
    console.log("=".repeat(80));

    for (const tutor of tutors) {
      const userName = tutor.user
        ? `${tutor.user.firstName} ${tutor.user.lastName}`
        : "Unknown";
      const email = tutor.user?.email || "N/A";

      console.log(`\nTutor: ${userName} (${email})`);
      console.log(`Verification Status: ${tutor.verificationStatus}`);
      console.log("Documents:");
      console.log(
        `  - ID Document:           ${tutor.idDocument || "❌ NOT UPLOADED"}`
      );
      console.log(
        `  - Qualification Doc:     ${
          tutor.qualificationDocument || "❌ NOT UPLOADED"
        }`
      );
      console.log(
        `  - Mark Sheet:            ${tutor.markSheet || "❌ NOT UPLOADED"}`
      );
      console.log(
        `  - Experience Cert:       ${
          tutor.experienceCertificate || "❌ NOT UPLOADED"
        }`
      );
      console.log(
        `  - Additional Certs:      ${
          tutor.additionalCertificates || "❌ NOT UPLOADED"
        }`
      );
      console.log("-".repeat(80));
    }
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await mongoose.disconnect();
    console.log("\nDisconnected from MongoDB");
  }
}

checkTutorDocuments();
