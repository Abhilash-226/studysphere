const User = require("../models/user.model");
const bcrypt = require("bcryptjs");

const initAdmin = async () => {
  try {
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;
    const adminName = process.env.ADMIN_NAME || "Admin";

    if (!adminEmail || !adminPassword) {
      console.log("Admin credentials not found in environment variables. Skipping admin initialization.");
      return;
    }

    const existingAdmin = await User.findOne({ email: adminEmail });

    if (existingAdmin) {
      // Check if role is admin
      if (existingAdmin.role !== "admin") {
        existingAdmin.role = "admin";
        await existingAdmin.save();
        console.log(`Updated existing user ${adminEmail} to admin role.`);
      } else {
        console.log(`Admin account ${adminEmail} already exists.`);
      }
      
      // Optional: Update password if it doesn't match? 
      // Since passwords are hashed, we can't easily check if it matches the env var without comparing.
      // But we can just overwrite it if we want the env var to be the source of truth.
      // For safety, let's only set it if we are creating, OR if we explicitly want to reset it.
      // For this task, I'll assume if it exists we just ensure the role. 
      // User can use "Forgot Password" if they lost it, or we could force update.
      // Let's force update password to match env var to ensure access.
      
      const isMatch = await existingAdmin.comparePassword(adminPassword);
      if (!isMatch) {
         existingAdmin.password = adminPassword; // Pre-save hook will hash it
         await existingAdmin.save();
         console.log(`Updated password for admin user ${adminEmail}.`);
      }

    } else {
      // Create new admin
      const newAdmin = new User({
        firstName: adminName,
        lastName: "User", // Default last name
        email: adminEmail,
        password: adminPassword,
        role: "admin",
        isEmailVerified: true, // Auto-verify admin
        isPhoneVerified: true
      });

      await newAdmin.save();
      console.log(`Admin account created: ${adminEmail}`);
    }
  } catch (error) {
    console.error("Error initializing admin account:", error);
  }
};

module.exports = initAdmin;
