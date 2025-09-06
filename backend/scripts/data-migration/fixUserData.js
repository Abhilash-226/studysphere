const mongoose = require("mongoose");
const User = require("./src/models/user.model");
const Tutor = require("./src/models/tutor.model");
const Student = require("./src/models/student.model");

async function fixUserData() {
  try {
    // Try different MongoDB connection strings
    const mongoUris = [
      "mongodb://localhost:27017/studysphere",
      "mongodb://127.0.0.1:27017/studysphere",
      process.env.MONGODB_URI || "mongodb://localhost:27017/studysphere",
    ];

    let connected = false;
    for (const uri of mongoUris) {
      try {
        await mongoose.connect(uri);
        console.log(`Connected successfully to ${uri}`);
        connected = true;
        break;
      } catch (err) {
        console.log(`Failed to connect to ${uri}: ${err.message}`);
      }
    }

    if (!connected) {
      console.error("Could not connect to MongoDB with any URI");
      process.exit(1);
    }

    console.log("\n=== Checking and Fixing User Data ===");

    // Find users with incomplete names
    const usersWithIssues = await User.find({
      $or: [
        { firstName: { $regex: /defau/i } },
        { lastName: { $regex: /defau/i } },
        { firstName: { $in: ["", null] } },
        { lastName: { $in: ["", null] } },
      ],
    });

    console.log(`Found ${usersWithIssues.length} users with incomplete names:`);

    for (const user of usersWithIssues) {
      console.log(`\nUser ID: ${user._id}`);
      console.log(`Current Name: '${user.firstName}' '${user.lastName}'`);
      console.log(`Email: ${user.email}`);
      console.log(`Role: ${user.role}`);

      // Fix names if they contain 'defau' or are empty
      let needsUpdate = false;
      let newFirstName = user.firstName;
      let newLastName = user.lastName;

      if (!user.firstName || user.firstName.toLowerCase().includes("defau")) {
        newFirstName = user.role === "tutor" ? "Dr. John" : "Student";
        needsUpdate = true;
      }

      if (!user.lastName || user.lastName.toLowerCase().includes("defau")) {
        newLastName = user.role === "tutor" ? "Smith" : "User";
        needsUpdate = true;
      }

      if (needsUpdate) {
        await User.findByIdAndUpdate(user._id, {
          firstName: newFirstName,
          lastName: newLastName,
        });
        console.log(`Updated to: '${newFirstName}' '${newLastName}'`);
      }
    }

    // Update tutor and student profiles with proper names
    const tutors = await Tutor.find().populate("user");
    console.log(`\n=== Tutor Profiles ===`);

    for (const tutor of tutors) {
      if (tutor.user) {
        console.log(
          `Tutor: ${tutor.user.firstName} ${tutor.user.lastName} (${tutor.user.email})`
        );
        console.log(`Specialization: ${tutor.specialization || "Not set"}`);
        console.log(`Qualification: ${tutor.qualification || "Not set"}`);
        console.log("---");
      }
    }

    const students = await Student.find().populate("user");
    console.log(`\n=== Student Profiles ===`);

    for (const student of students) {
      if (student.user) {
        console.log(
          `Student: ${student.user.firstName} ${student.user.lastName} (${student.user.email})`
        );
        console.log(`Grade: ${student.grade || "Not set"}`);
        console.log("---");
      }
    }

    await mongoose.disconnect();
    console.log("\n=== Data check and fix completed ===");
    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

fixUserData();
