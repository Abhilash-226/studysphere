const mongoose = require("mongoose");
const Student = require("./src/models/student.model");
const Session = require("./src/models/session.model");
const User = require("./src/models/user.model");
require("dotenv").config();

async function debugSessionQuery() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      dbName: process.env.DB_NAME || "studysphere",
    });
    console.log("Connected to MongoDB");

    const problemUserId = "68b9ca2663951770d8a36064";

    // Find the student
    const student = await Student.findOne({ user: problemUserId });
    console.log("\n=== Student Info ===");
    console.log("Student ID:", student._id.toString());
    console.log("Student User ID:", student.user.toString());

    // Find the session
    const session = await Session.findOne({ student: student._id });
    if (session) {
      console.log("\n=== Session Details ===");
      console.log("Session ID:", session._id.toString());
      console.log("Session Status:", session.status);
      console.log("Session Start Time:", session.startTime);
      console.log("Current Time:", new Date());
      console.log(
        "Start Time >= Current Time:",
        session.startTime >= new Date()
      );
    }

    // Test the exact query that's failing
    const currentDate = new Date();
    console.log("\n=== Testing Exact Query ===");
    console.log("Current Date:", currentDate);

    const filter = {
      student: student._id,
      status: { $in: ["scheduled"] },
      startTime: { $gte: currentDate },
    };

    console.log("Filter:", filter);

    const sessions = await Session.find(filter);
    console.log("Sessions found with full filter:", sessions.length);

    // Test without date filter
    const filterNoDate = {
      student: student._id,
      status: { $in: ["scheduled"] },
    };

    const sessionsNoDate = await Session.find(filterNoDate);
    console.log("Sessions found without date filter:", sessionsNoDate.length);

    // Test without status filter
    const filterNoStatus = {
      student: student._id,
      startTime: { $gte: currentDate },
    };

    const sessionsNoStatus = await Session.find(filterNoStatus);
    console.log(
      "Sessions found without status filter:",
      sessionsNoStatus.length
    );

    // Test just student ID
    const filterJustStudent = {
      student: student._id,
    };

    const sessionsJustStudent = await Session.find(filterJustStudent);
    console.log(
      "Sessions found with just student ID:",
      sessionsJustStudent.length
    );
    if (sessionsJustStudent.length > 0) {
      console.log("Session details:");
      sessionsJustStudent.forEach((s, i) => {
        console.log(`  Session ${i + 1}:`);
        console.log(`    Status: ${s.status}`);
        console.log(`    Start Time: ${s.startTime}`);
        console.log(`    Is Future?: ${s.startTime >= currentDate}`);
      });
    }

    await mongoose.disconnect();
    console.log("\nDisconnected from MongoDB");
  } catch (error) {
    console.error("Error:", error);
    await mongoose.disconnect();
  }
}

debugSessionQuery();
