const mongoose = require("mongoose");
const User = require("./src/models/user.model");

async function fixUserNames() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect("mongodb://localhost:27017/studysphere");
    console.log("Connected!");

    // Find users with problematic names
    const users = await User.find({
      $or: [
        { firstName: { $regex: /68a|defau/i } },
        { lastName: { $regex: /68a|defau/i } },
        { firstName: { $exists: false } },
        { lastName: { $exists: false } },
        { firstName: "" },
        { lastName: "" },
      ],
    });

    console.log(`Found ${users.length} users with problematic names`);

    for (const user of users) {
      const emailPrefix = user.email.split("@")[0];
      let firstName = "User";
      let lastName = emailPrefix.slice(-4).toUpperCase();

      // Try to extract name from email
      if (emailPrefix.includes(".")) {
        const parts = emailPrefix.split(".");
        firstName = parts[0].charAt(0).toUpperCase() + parts[0].slice(1);
        lastName = parts[1].charAt(0).toUpperCase() + parts[1].slice(1);
      } else if (emailPrefix.length > 2) {
        firstName =
          emailPrefix.charAt(0).toUpperCase() + emailPrefix.slice(1, 4);
      }

      await User.findByIdAndUpdate(user._id, {
        firstName: firstName,
        lastName: lastName,
      });

      console.log(
        `Fixed ${user.email}: ${user.firstName} ${user.lastName} -> ${firstName} ${lastName}`
      );
    }

    console.log("✅ All user names fixed!");
    await mongoose.disconnect();
  } catch (error) {
    console.error("Error:", error);
    await mongoose.disconnect();
  }
}

if (require.main === module) {
  fixUserNames();
}

module.exports = fixUserNames;
