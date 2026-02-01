const mongoose = require("mongoose");

const tutorSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    qualification: {
      type: String,
      required: false, // Made optional - collected during profile setup
      trim: true,
    },
    experience: {
      type: String,
      trim: true,
    },
    specialization: {
      type: String,
      required: false, // Made optional - collected during profile setup
      trim: true,
    },
    universityName: {
      type: String,
      required: false, // Made optional - collected during profile setup
      trim: true,
    },
    graduationYear: {
      type: String,
      trim: true,
    },
    idNumber: {
      type: String,
      trim: true,
    },
    idDocument: {
      type: String, // Path to uploaded ID document
    },
    qualificationDocument: {
      type: String, // Path to uploaded qualification document
    },
    markSheet: {
      type: String, // Path to uploaded mark sheet or academic transcript
    },
    experienceCertificate: {
      type: String, // Path to uploaded teaching experience certificate
    },
    additionalCertificates: {
      type: String, // Path to uploaded additional certifications
    },
    verificationStatus: {
      type: String,
      enum: ["pending", "approved", "rejected", "needs_info"],
      default: "pending", // Tutors require admin approval before they can accept students
    },
    verificationNotes: {
      type: String,
      trim: true,
    },
    verifiedAt: {
      type: Date,
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    verificationHistory: [
      {
        action: {
          type: String,
          enum: [
            "submitted",
            "approved",
            "rejected",
            "info_requested",
            "resubmitted",
          ],
        },
        performedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        notes: String,
        timestamp: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    isProfileComplete: {
      type: Boolean,
      default: false,
    },
    bio: {
      type: String,
      trim: true,
    },
    hourlyRate: {
      type: Number,
    },
    monthlyRate: {
      type: Number,
    },
    availability: [
      {
        day: {
          type: String,
          enum: [
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday",
            "Sunday",
          ],
        },
        startTime: String,
        endTime: String,
      },
    ],
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    totalReviews: {
      type: Number,
      default: 0,
    },
    teachingMode: {
      type: [String],
      enum: [
        "online", // Online individual tutoring (with booking & payment)
        "offline", // In-person individual tutoring (contact only)
      ],
      default: ["online"],
    },
    subjects: {
      type: [String],
      default: [],
    },
    location: {
      street: String,
      area: String,
      city: String,
      state: String,
      pincode: String,
      country: String,
      address: String,
      postalCode: String,
      timeZone: String,
    },
    preferredClasses: {
      type: [String],
      default: [],
    },
    certifications: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

const Tutor = mongoose.model("Tutor", tutorSchema);

module.exports = Tutor;
