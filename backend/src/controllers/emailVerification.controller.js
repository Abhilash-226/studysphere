const crypto = require("crypto");
const User = require("../models/user.model");
const emailService = require("../services/email.service");
const { validationResult } = require("express-validator");

/**
 * Send email verification link
 */
exports.sendVerificationEmail = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Invalid input",
        errors: errors.array(),
      });
    }

    const { email } = req.body;

    // Find user by email
    const user = await User.findOne({ email }).select(
      "+emailVerificationToken +emailVerificationExpires +emailVerificationAttempts +lastVerificationEmailSent"
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check if already verified
    if (user.isEmailVerified) {
      return res.status(400).json({
        success: false,
        message: "Email is already verified",
      });
    }

    // Check rate limiting
    const canRequest = user.canRequestVerificationEmail();
    if (!canRequest.allowed) {
      let message;
      if (canRequest.reason === "cooldown") {
        message = `Please wait ${canRequest.waitTime} seconds before requesting another verification email`;
      } else if (canRequest.reason === "daily_limit") {
        message =
          "Daily verification email limit reached. Please try again tomorrow";
      }

      return res.status(429).json({
        success: false,
        message,
        retryAfter: canRequest.waitTime || 86400, // 24 hours for daily limit
      });
    }

    // Generate verification token
    const verificationToken = user.generateEmailVerificationToken();
    user.emailVerificationAttempts += 1;

    // Save user with new token
    await user.save();

    // Send verification email
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email/${verificationToken}`;

    try {
      await emailService.sendEmailVerification(
        user.email,
        `${user.firstName} ${user.lastName}`,
        verificationUrl
      );

      res.status(200).json({
        success: true,
        message: "Verification email sent successfully",
        attemptsLeft: canRequest.attemptsLeft - 1,
        expiresIn: "24 hours",
      });
    } catch (emailError) {
      console.error("Failed to send verification email:", emailError);

      res.status(500).json({
        success: false,
        message: "Failed to send verification email. Please try again later.",
      });
    }
  } catch (error) {
    console.error("Send verification email error:", error);
    res.status(500).json({
      success: false,
      message: "Server error. Please try again later.",
    });
  }
};

/**
 * Verify email with token
 */
exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Verification token is required",
      });
    }

    // Hash the token to compare with stored hash
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    // Find user with valid token
    const user = await User.findOne({
      emailVerificationToken: hashedToken,
      emailVerificationExpires: { $gt: Date.now() },
      isEmailVerified: false,
    }).select("+emailVerificationToken +emailVerificationExpires");

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired verification token",
      });
    }

    // Mark email as verified and clear verification fields
    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    user.emailVerificationAttempts = 0;
    user.lastVerificationEmailSent = undefined;

    await user.save();

    // Send welcome email after verification
    try {
      if (user.role === "student") {
        await emailService.sendWelcomeEmail(
          user.email,
          `${user.firstName} ${user.lastName}`
        );
      }
    } catch (emailError) {
      console.warn("Failed to send welcome email:", emailError);
      // Don't fail the verification process if welcome email fails
    }

    res.status(200).json({
      success: true,
      message: "Email verified successfully",
      user: {
        id: user._id,
        email: user.email,
        isEmailVerified: user.isEmailVerified,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Email verification error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during verification",
    });
  }
};

/**
 * Check verification status
 */
exports.checkVerificationStatus = async (req, res) => {
  try {
    const userId = req.user.id; // From auth middleware

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      isEmailVerified: user.isEmailVerified,
      email: user.email,
      canRequestNewEmail: user.canRequestVerificationEmail().allowed,
    });
  } catch (error) {
    console.error("Check verification status error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

/**
 * Resend verification email for authenticated users
 */
exports.resendVerificationEmail = async (req, res) => {
  try {
    const userId = req.user.id; // From auth middleware

    const user = await User.findById(userId).select(
      "+emailVerificationToken +emailVerificationExpires +emailVerificationAttempts +lastVerificationEmailSent"
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check if already verified
    if (user.isEmailVerified) {
      return res.status(400).json({
        success: false,
        message: "Email is already verified",
      });
    }

    // Check rate limiting
    const canRequest = user.canRequestVerificationEmail();
    if (!canRequest.allowed) {
      let message;
      if (canRequest.reason === "cooldown") {
        message = `Please wait ${canRequest.waitTime} seconds before requesting another verification email`;
      } else if (canRequest.reason === "daily_limit") {
        message =
          "Daily verification email limit reached. Please try again tomorrow";
      }

      return res.status(429).json({
        success: false,
        message,
        retryAfter: canRequest.waitTime || 86400,
      });
    }

    // Generate new verification token
    const verificationToken = user.generateEmailVerificationToken();
    user.emailVerificationAttempts += 1;

    await user.save();

    // Send verification email
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email/${verificationToken}`;

    try {
      await emailService.sendEmailVerification(
        user.email,
        `${user.firstName} ${user.lastName}`,
        verificationUrl
      );

      res.status(200).json({
        success: true,
        message: "Verification email sent successfully",
        attemptsLeft: canRequest.attemptsLeft - 1,
      });
    } catch (emailError) {
      console.error("Failed to send verification email:", emailError);
      res.status(500).json({
        success: false,
        message: "Failed to send verification email",
      });
    }
  } catch (error) {
    console.error("Resend verification email error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
