const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");
const User = require("../models/user.model");
const Tutor = require("../models/tutor.model");
const Student = require("../models/student.model");

// Helper function to generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRATION,
  });
};

exports.register = async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { firstName, lastName, email, password, phoneNumber, role } =
      req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already in use" });
    }

    // Create user
    const user = new User({
      firstName,
      lastName,
      email,
      password,
      phoneNumber,
      role: role || "student",
    });

    await user.save();

    // If role is tutor, create tutor profile
    if (role === "tutor") {
      const {
        qualification,
        experience,
        specialization,
        universityName,
        graduationYear,
        idNumber,
      } = req.body;

      const tutor = new Tutor({
        user: user._id,
        qualification,
        experience,
        specialization,
        universityName,
        graduationYear,
        idNumber,
      });

      await tutor.save();
    }
    // If role is student, create student profile
    else if (role === "student") {
      const student = new Student({
        user: user._id,
      });

      await student.save();
    }

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      message: "User registered successfully",
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ message: "Server error during registration" });
  }
};

exports.login = async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Update last login
    user.lastLogin = Date.now();
    await user.save();

    // Generate token
    const token = generateToken(user._id);

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error during login" });
  }
};

exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    let profileData = null;

    // Get role-specific data
    if (user.role === "tutor") {
      profileData = await Tutor.findOne({ user: user._id });
    } else if (user.role === "student") {
      profileData = await Student.findOne({ user: user._id });
    }

    res.json({
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        role: user.role,
        profileImage: user.profileImage,
        isEmailVerified: user.isEmailVerified,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin,
      },
      profile: profileData,
    });
  } catch (error) {
    console.error("Get me error:", error);
    res.status(500).json({ message: "Server error fetching user data" });
  }
};

exports.forgotPassword = async (req, res) => {
  // Implementation for password reset functionality
  res.status(501).json({ message: "Password reset not implemented yet" });
};

exports.resetPassword = async (req, res) => {
  // Implementation for password reset functionality
  res.status(501).json({ message: "Password reset not implemented yet" });
};

exports.uploadIdDocument = async (req, res) => {
  try {
    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({ message: "Please upload a file" });
    }

    // Get user ID from auth middleware
    const userId = req.user.id;

    // Find associated tutor
    const tutor = await Tutor.findOne({ user: userId });
    if (!tutor) {
      return res.status(404).json({ message: "Tutor profile not found" });
    }

    // Update tutor with the document path
    tutor.idDocument = req.file.path.replace(/\\/g, "/"); // Normalize path for cross-platform
    await tutor.save();

    res.status(200).json({
      message: "ID document uploaded successfully",
      filePath: tutor.idDocument,
    });
  } catch (error) {
    console.error("ID document upload error:", error);
    res.status(500).json({ message: "Server error during file upload" });
  }
};

exports.uploadQualificationDocument = async (req, res) => {
  try {
    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({ message: "Please upload a file" });
    }

    // Get user ID from auth middleware
    const userId = req.user.id;

    // Find associated tutor
    const tutor = await Tutor.findOne({ user: userId });
    if (!tutor) {
      return res.status(404).json({ message: "Tutor profile not found" });
    }

    // Update tutor with the document path
    tutor.qualificationDocument = req.file.path.replace(/\\/g, "/"); // Normalize path for cross-platform
    await tutor.save();

    res.status(200).json({
      message: "Qualification document uploaded successfully",
      filePath: tutor.qualificationDocument,
    });
  } catch (error) {
    console.error("Qualification document upload error:", error);
    res.status(500).json({ message: "Server error during file upload" });
  }
};
