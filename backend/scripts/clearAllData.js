const mongoose = require("mongoose");
require("dotenv").config();

// Import all models
const User = require("../src/models/user.model");
const Student = require("../src/models/student.model");
const Tutor = require("../src/models/tutor.model");
const Conversation = require("../src/models/conversation.model");
const Message = require("../src/models/message.model");
const Session = require("../src/models/session.model");
const SessionRequest = require("../src/models/sessionRequest.model");

const clearAllData = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");
    console.log("🗑️  Starting complete database cleanup...\n");

    // Delete all messages first (they reference conversations)
    const deletedMessages = await Message.deleteMany({});
    console.log(`✅ Deleted ${deletedMessages.deletedCount} message records`);

    // Delete all conversations
    const deletedConversations = await Conversation.deleteMany({});
    console.log(
      `✅ Deleted ${deletedConversations.deletedCount} conversation records`
    );

    // Delete all session requests
    const deletedSessionRequests = await SessionRequest.deleteMany({});
    console.log(
      `✅ Deleted ${deletedSessionRequests.deletedCount} session request records`
    );

    // Delete all sessions
    const deletedSessions = await Session.deleteMany({});
    console.log(`✅ Deleted ${deletedSessions.deletedCount} session records`);

    // Delete all students
    const deletedStudents = await Student.deleteMany({});
    console.log(`✅ Deleted ${deletedStudents.deletedCount} student records`);

    // Delete all tutors
    const deletedTutors = await Tutor.deleteMany({});
    console.log(`✅ Deleted ${deletedTutors.deletedCount} tutor records`);

    // Delete all users
    const deletedUsers = await User.deleteMany({});
    console.log(`✅ Deleted ${deletedUsers.deletedCount} user records`);

    console.log(
      "\n🎉 All data has been successfully deleted from the database"
    );
    console.log("📊 Summary:");
    console.log(`   Users: ${deletedUsers.deletedCount}`);
    console.log(`   Students: ${deletedStudents.deletedCount}`);
    console.log(`   Tutors: ${deletedTutors.deletedCount}`);
    console.log(`   Sessions: ${deletedSessions.deletedCount}`);
    console.log(`   Session Requests: ${deletedSessionRequests.deletedCount}`);
    console.log(`   Conversations: ${deletedConversations.deletedCount}`);
    console.log(`   Messages: ${deletedMessages.deletedCount}`);

    // Close the connection
    await mongoose.connection.close();
    console.log("\n🔌 Database connection closed");
  } catch (error) {
    console.error("❌ Error clearing data:", error);
  } finally {
    process.exit();
  }
};

// Run the script
clearAllData();
