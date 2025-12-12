const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");
const { OAuth2Client } = require("google-auth-library");
const User = require("../models/user.model");
const Tutor = require("../models/tutor.model");
const Student = require("../models/student.model");
const emailService = require("../services/email.service");

// Google OAuth client
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

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

    // Generate OTP and send verification email
    try {
      const otp = user.generateEmailOTP();
      await user.save();

      await emailService.sendOTPEmail(
        user.email,
        `${user.firstName} ${user.lastName}`,
        otp
      );
    } catch (emailError) {
      console.warn("Failed to send OTP email during registration:", emailError);
      // Don't fail registration if email sending fails
    }

    // Send additional emails based on role
    try {
      if (role === "tutor") {
        // Send verification pending email to tutors
        await emailService.sendVerificationPendingEmail(
          user.email,
          `${user.firstName} ${user.lastName}`
        );
      }
    } catch (emailError) {
      console.warn("Failed to send role-specific email:", emailError);
    }

    res.status(201).json({
      message:
        "User registered successfully. Please check your email for the verification OTP.",
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
      },
      emailVerificationRequired: true,
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

    // Check if email is verified
    if (!user.isEmailVerified) {
      return res.status(403).json({
        message: "Please verify your email address before logging in.",
        emailVerificationRequired: true,
        canResendEmail: user.canRequestVerificationEmail(),
      });
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

// Verify OTP for email verification
exports.verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: "Email and OTP are required" });
    }

    // Find user with OTP fields
    const user = await User.findOne({ email }).select(
      "+emailOTP +emailOTPExpiry +emailOTPAttempts"
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({ message: "Email is already verified" });
    }

    // Check OTP attempts (max 5 attempts)
    if (user.emailOTPAttempts >= 5) {
      return res.status(429).json({
        message: "Too many attempts. Please request a new OTP.",
        requireNewOTP: true,
      });
    }

    // Increment attempts
    user.emailOTPAttempts += 1;

    // Verify OTP
    const verificationResult = user.verifyEmailOTP(otp);

    if (!verificationResult.valid) {
      await user.save();

      if (verificationResult.reason === "expired") {
        return res.status(400).json({
          message: "OTP has expired. Please request a new one.",
          expired: true,
        });
      }

      return res.status(400).json({
        message: "Invalid OTP. Please try again.",
        attemptsLeft: 5 - user.emailOTPAttempts,
      });
    }

    // OTP is valid - mark email as verified
    user.isEmailVerified = true;
    user.emailOTP = undefined;
    user.emailOTPExpiry = undefined;
    user.emailOTPAttempts = 0;
    await user.save();

    // Send welcome email
    try {
      await emailService.sendWelcomeEmail(
        user.email,
        `${user.firstName} ${user.lastName}`
      );
    } catch (emailError) {
      console.warn("Failed to send welcome email:", emailError);
    }

    // Generate token for auto-login
    const token = generateToken(user._id);

    // Get role-specific data
    let roleData = {};
    if (user.role === "tutor") {
      const tutor = await Tutor.findOne({ user: user._id });
      if (tutor) {
        roleData = {
          tutorId: tutor._id,
          isProfileComplete: tutor.isProfileComplete || false,
        };
      }
    } else if (user.role === "student") {
      const student = await Student.findOne({ user: user._id });
      if (student) {
        roleData = {
          studentId: student._id,
        };
      }
    }

    res.json({
      message: "Email verified successfully!",
      verified: true,
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        isEmailVerified: true,
        profileImage: user.profileImage,
        ...roleData,
      },
    });
  } catch (error) {
    console.error("OTP verification error:", error);
    res.status(500).json({ message: "Server error during OTP verification" });
  }
};

// Resend OTP for email verification
exports.resendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await User.findOne({ email }).select(
      "+emailOTPAttempts +lastVerificationEmailSent"
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({ message: "Email is already verified" });
    }

    // Check rate limiting
    const canRequest = user.canRequestVerificationEmail();
    if (!canRequest.allowed) {
      if (canRequest.reason === "cooldown") {
        return res.status(429).json({
          message: `Please wait ${canRequest.waitTime} seconds before requesting a new OTP.`,
          waitTime: canRequest.waitTime,
        });
      }
      if (canRequest.reason === "daily_limit") {
        return res.status(429).json({
          message: "Daily OTP limit reached. Please try again tomorrow.",
        });
      }
    }

    // Generate new OTP
    const otp = user.generateEmailOTP();
    user.emailVerificationAttempts += 1;
    await user.save();

    // Send OTP email
    await emailService.sendOTPEmail(
      user.email,
      `${user.firstName} ${user.lastName}`,
      otp
    );

    res.json({
      message: "A new OTP has been sent to your email.",
      attemptsLeft: canRequest.attemptsLeft - 1,
    });
  } catch (error) {
    console.error("Resend OTP error:", error);
    res.status(500).json({ message: "Server error while resending OTP" });
  }
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

// Google OAuth Sign In/Sign Up
exports.googleAuth = async (req, res) => {
  try {
    const { credential, role = "student" } = req.body;

    if (!credential) {
      return res.status(400).json({ message: "Google credential is required" });
    }

    // Verify Google token
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { email, given_name, family_name, picture, email_verified } = payload;

    if (!email_verified) {
      return res.status(400).json({ message: "Google email not verified" });
    }

    // Check if user exists
    let user = await User.findOne({ email });
    let isNewUser = false;

    if (!user) {
      // Create new user
      isNewUser = true;
      user = new User({
        firstName: given_name || "User",
        lastName: family_name || "",
        email,
        password: Math.random().toString(36).slice(-12) + "Aa1!", // Random secure password
        role: role,
        isEmailVerified: true, // Google already verified
        profileImage: picture || null,
        googleId: payload.sub,
      });

      await user.save();

      // Create role-specific profile
      if (role === "tutor") {
        const tutor = new Tutor({
          user: user._id,
          isVerified: false,
          isProfileComplete: false,
        });
        await tutor.save();
      } else {
        const student = new Student({
          user: user._id,
          gradeLevel: "",
          subjects: [],
        });
        await student.save();
      }

      // Send welcome email
      try {
        await emailService.sendWelcomeEmail(
          email,
          `${given_name} ${family_name}`
        );
      } catch (emailError) {
        console.warn("Failed to send welcome email:", emailError);
      }
    } else {
      // Existing user - check if role-specific profile exists, create if not
      if (user.role === "tutor") {
        const existingTutor = await Tutor.findOne({ user: user._id });
        if (!existingTutor) {
          const tutor = new Tutor({
            user: user._id,
            isVerified: false,
            isProfileComplete: false,
          });
          await tutor.save();
          isNewUser = true; // Treat as new user to redirect to profile setup
        }
      } else if (user.role === "student") {
        const existingStudent = await Student.findOne({ user: user._id });
        if (!existingStudent) {
          const student = new Student({
            user: user._id,
            gradeLevel: "",
            subjects: [],
          });
          await student.save();
          isNewUser = true;
        }
      }
    }

    // Update last login
    user.lastLogin = Date.now();
    await user.save();

    // Generate token
    const token = generateToken(user._id);

    // Get role-specific data
    let roleData = {};
    if (user.role === "tutor") {
      const tutor = await Tutor.findOne({ user: user._id });
      if (tutor) {
        roleData = {
          tutorId: tutor._id,
          isProfileComplete: tutor.isProfileComplete || false,
        };
      }
    } else if (user.role === "student") {
      const student = await Student.findOne({ user: user._id });
      if (student) {
        roleData = {
          studentId: student._id,
        };
      }
    }

    res.json({
      message: isNewUser ? "Account created successfully!" : "Login successful",
      token,
      isNewUser,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        profileImage: user.profileImage,
        isEmailVerified: user.isEmailVerified,
        ...roleData,
      },
    });
  } catch (error) {
    console.error("Google Auth error:", error);
    res
      .status(500)
      .json({ message: "Server error during Google authentication" });
  }
};
