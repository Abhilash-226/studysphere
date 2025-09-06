const mongoose = require("mongoose");
const User = require("./src/models/user.model");

async function checkUser() {
  try {
    // Connect to MongoDB (try the URI that usually works)
    const uri =
      process.env.MONGODB_URI || "mongodb://localhost:27017/studysphere";

    // Connect without the deprecated options
    await mongoose.connect(uri);
    console.log("Connected to MongoDB");

    // Find a user with "68a06" in their ID (from the screenshot)
    const user = await User.findOne({
      _id: { $regex: /68a06/ },
    });

    if (user) {
      console.log("Found user:");
      console.log("ID:", user._id);
      console.log("FirstName:", `"${user.firstName}"`);
      console.log("LastName:", `"${user.lastName}"`);
      console.log("Email:", user.email);
      console.log("Role:", user.role);
    } else {
      console.log("User not found");

      // Let's just check the first few users
      const users = await User.find({}).limit(5);
      console.log("\nFirst 5 users:");
      users.forEach((user) => {
        console.log(
          `ID: ${user._id}, Name: "${user.firstName}" "${user.lastName}", Email: ${user.email}`
        );
      });
    }

    await mongoose.disconnect();
  } catch (error) {
    console.error("Error:", error);
    await mongoose.disconnect();
  }
}

checkUser();
