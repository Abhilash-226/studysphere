const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, "First name is required"],
      trim: true,
    },
    lastName: {
      type: String,
      required: [true, "Last name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 8,
      select: false,
    },
    phoneNumber: {
      type: String,
      trim: true,
    },
    role: {
      type: String,
      enum: ["student", "tutor", "admin"],
      default: "student",
    },
    profileImage: {
      type: String,
      default: "",
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    emailVerificationToken: {
      type: String,
      select: false,
    },
    emailVerificationExpires: {
      type: Date,
      select: false,
    },
    emailVerificationAttempts: {
      type: Number,
      default: 0,
      select: false,
    },
    lastVerificationEmailSent: {
      type: Date,
      select: false,
    },
    isPhoneVerified: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLogin: {
      type: Date,
    },
    resetPasswordToken: String,
    resetPasswordExpires: Date,
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Generate email verification token
userSchema.methods.generateEmailVerificationToken = function () {
  const crypto = require("crypto");

  // Generate random token
  const token = crypto.randomBytes(32).toString("hex");

  // Set token and expiration (24 hours)
  this.emailVerificationToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");
  this.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
  this.lastVerificationEmailSent = Date.now();

  return token; // Return unhashed token to send via email
};

// Check if user can request new verification email (rate limiting)
userSchema.methods.canRequestVerificationEmail = function () {
  const COOLDOWN_PERIOD = 2 * 60 * 1000; // 2 minutes
  const MAX_ATTEMPTS_PER_DAY = 5;

  // Check cooldown period
  if (this.lastVerificationEmailSent) {
    const timeSinceLastEmail =
      Date.now() - this.lastVerificationEmailSent.getTime();
    if (timeSinceLastEmail < COOLDOWN_PERIOD) {
      return {
        allowed: false,
        reason: "cooldown",
        waitTime: Math.ceil((COOLDOWN_PERIOD - timeSinceLastEmail) / 1000),
      };
    }
  }

  // Check daily attempts (reset counter if it's a new day)
  const today = new Date();
  const lastEmailDate = this.lastVerificationEmailSent
    ? new Date(this.lastVerificationEmailSent)
    : null;

  if (!lastEmailDate || lastEmailDate.toDateString() !== today.toDateString()) {
    this.emailVerificationAttempts = 0;
  }

  if (this.emailVerificationAttempts >= MAX_ATTEMPTS_PER_DAY) {
    return {
      allowed: false,
      reason: "daily_limit",
      attemptsLeft: 0,
    };
  }

  return {
    allowed: true,
    attemptsLeft: MAX_ATTEMPTS_PER_DAY - this.emailVerificationAttempts,
  };
};

const User = mongoose.model("User", userSchema);

module.exports = User;
