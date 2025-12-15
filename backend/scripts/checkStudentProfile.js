/**
 * Script to check and create student profiles for users with role=student
 * Run with: node scripts/checkStudentProfile.js
 */

require("dotenv").config();
const mongoose = require("mongoose");
const User = require("../src/models/user.model");
const Student = require("../src/models/student.model");

async function checkStudentProfiles() {
  try {
    // Connect to MongoDB
    const mongoUri =
      process.env.MONGODB_URI || "mongodb://localhost:27017/studysphere";
    console.log("Connecting to MongoDB...");
    await mongoose.connect(mongoUri);
    console.log("Connected to MongoDB\n");

    // Find all users with role=student
    const studentUsers = await User.find({ role: "student" });
    console.log(`Found ${studentUsers.length} users with role=student\n`);

    let missingProfiles = 0;
    let createdProfiles = 0;

    for (const user of studentUsers) {
      const studentProfile = await Student.findOne({ user: user._id });

      if (!studentProfile) {
        console.log(
          `❌ User "${user.firstName} ${user.lastName}" (${user.email}) - NO STUDENT PROFILE`
        );
        missingProfiles++;

        // Create student profile
        const newStudent = new Student({
          user: user._id,
          subjects: [],
          learningGoals: [],
          preferredSchedule: [],
          gradeLevel: "Not specified",
        });

        await newStudent.save();
        console.log(`   ✅ Created student profile for ${user.email}`);
        createdProfiles++;
      } else {
        console.log(
          `✅ User "${user.firstName} ${user.lastName}" (${user.email}) - Has student profile`
        );
      }
    }

    console.log("\n--- Summary ---");
    console.log(`Total student users: ${studentUsers.length}`);
    console.log(`Missing profiles found: ${missingProfiles}`);
    console.log(`Profiles created: ${createdProfiles}`);

    // Also list all users and their roles for debugging
    console.log("\n--- All Users ---");
    const allUsers = await User.find({}).select(
      "firstName lastName email role isEmailVerified"
    );
    for (const user of allUsers) {
      console.log(
        `${user.role.padEnd(10)} | ${user.email.padEnd(35)} | ${
          user.firstName
        } ${user.lastName} | Verified: ${user.isEmailVerified}`
      );
    }
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await mongoose.disconnect();
    console.log("\nDisconnected from MongoDB");
  }
}

checkStudentProfiles();
