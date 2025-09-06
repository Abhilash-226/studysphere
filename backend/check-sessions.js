const mongoose = require("mongoose");
const Session = require("./src/models/session.model");
const Student = require("./src/models/student.model");
const Tutor = require("./src/models/tutor.model");

async function checkSessions() {
  try {
    await mongoose.connect("mongodb://localhost:27017/studysphere");
    console.log("Connected to MongoDB");

    // Check all sessions
    const allSessions = await Session.find({})
      .populate({
        path: "student",
        populate: { path: "user", select: "firstName lastName" },
      })
      .populate({
        path: "tutor",
        populate: { path: "user", select: "firstName lastName" },
      })
      .sort({ createdAt: -1 })
      .limit(5);

    console.log("\n=== Recent Sessions ===");
    allSessions.forEach((session, index) => {
      console.log(`${index + 1}. Title: ${session.title}`);
      console.log(
        `   Student: ${session.student?.user?.firstName} ${session.student?.user?.lastName}`
      );
      console.log(
        `   Tutor: ${session.tutor?.user?.firstName} ${session.tutor?.user?.lastName}`
      );
      console.log(`   Status: ${session.status}`);
      console.log(`   Start: ${session.startTime}`);
      console.log(`   End: ${session.endTime}`);
      console.log(`   Created: ${session.createdAt}`);
      console.log("---");
    });

    // Check upcoming sessions for students
    console.log("\n=== Student Upcoming Sessions Query Test ===");
    const now = new Date();
    const studentUpcoming = await Session.find({
      status: { $in: ["scheduled"] },
      startTime: { $gte: now },
    }).countDocuments();

    console.log(
      `Sessions with status 'scheduled' and future startTime: ${studentUpcoming}`
    );

    // Check upcoming sessions for tutors
    console.log("\n=== Tutor Upcoming Sessions Query Test ===");
    const tutorUpcoming = await Session.find({
      status: { $in: ["scheduled", "rescheduled"] },
      startTime: { $gte: now },
    }).countDocuments();

    console.log(
      `Sessions with status ['scheduled', 'rescheduled'] and future startTime: ${tutorUpcoming}`
    );

    // Check total sessions count
    const totalCount = await Session.countDocuments({});
    console.log(`\nTotal sessions in database: ${totalCount}`);

    await mongoose.disconnect();
    console.log("\nDisconnected from MongoDB");
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

checkSessions();
