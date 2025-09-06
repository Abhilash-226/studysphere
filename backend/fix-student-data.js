const mongoose = require("mongoose");
const Student = require("./src/models/student.model");
const Session = require("./src/models/session.model");
const User = require("./src/models/user.model");
require("dotenv").config();

async function fixStudentSessionData() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      dbName: process.env.DB_NAME || "studysphere",
    });
    console.log("Connected to MongoDB");

    const problemUserId = "68b9ca2663951770d8a36064";

    // 1. Check User record
    const user = await User.findById(problemUserId);
    console.log("\n=== User Record ===");
    console.log("User ID:", problemUserId);
    console.log("User exists:", !!user);
    if (user) {
      console.log("User name:", user.firstName, user.lastName);
      console.log("User role:", user.role);
    }

    // 2. Check all Student records for this user
    console.log("\n=== Student Records for this User ===");
    const studentRecords = await Student.find({ user: problemUserId });
    console.log("Number of Student records found:", studentRecords.length);
    studentRecords.forEach((student, index) => {
      console.log(`Student ${index + 1}:`);
      console.log("  Student ID:", student._id.toString());
      console.log("  User ID:", student.user.toString());
      console.log("  Name:", student.name);
      console.log("  Created:", student.createdAt);
    });

    // 3. Check all Student records with similar IDs
    console.log("\n=== All Student Records (checking for duplicates) ===");
    const allStudents = await Student.find({}).limit(10);
    allStudents.forEach((student, index) => {
      console.log(`Student ${index + 1}:`);
      console.log("  Student ID:", student._id.toString());
      console.log("  User ID:", student.user.toString());
    });

    // 4. Check sessions with the problematic student ID
    const problemStudentId = "68b9ca2663951770d8a36066";
    console.log("\n=== Sessions with Problem Student ID ===");
    const sessionsWithProblemId = await Session.find({
      student: problemStudentId,
    });
    console.log(
      "Sessions found with Student ID",
      problemStudentId,
      ":",
      sessionsWithProblemId.length
    );
    sessionsWithProblemId.forEach((session, index) => {
      console.log(`Session ${index + 1}:`);
      console.log("  Session ID:", session._id.toString());
      console.log("  Student ID:", session.student.toString());
      console.log("  Title:", session.title);
      console.log("  Status:", session.status);
      console.log("  Start:", session.startTime);
    });

    // 5. Let's find the correct student record and fix the sessions
    if (studentRecords.length > 0) {
      const correctStudentId = studentRecords[0]._id.toString();
      console.log("\n=== Fixing Sessions ===");
      console.log("Correct Student ID should be:", correctStudentId);

      if (
        correctStudentId !== problemStudentId &&
        sessionsWithProblemId.length > 0
      ) {
        console.log("Fixing", sessionsWithProblemId.length, "sessions...");

        const result = await Session.updateMany(
          { student: problemStudentId },
          { student: correctStudentId }
        );

        console.log("Updated sessions:", result.modifiedCount);
      } else if (correctStudentId === problemStudentId) {
        console.log("Student ID is already correct, no update needed");
      } else {
        console.log("No sessions to fix");
      }
    }

    // 6. Verify the fix
    console.log("\n=== Verification ===");
    const correctedSessions = await Session.find({
      student: studentRecords.length > 0 ? studentRecords[0]._id : null,
      status: "scheduled",
      startTime: { $gte: new Date() },
    });
    console.log(
      "Upcoming sessions for correct student ID:",
      correctedSessions.length
    );

    await mongoose.disconnect();
    console.log("\nDisconnected from MongoDB");
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

fixStudentSessionData();
