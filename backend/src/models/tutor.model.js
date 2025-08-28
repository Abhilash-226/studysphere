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
      required: true,
      trim: true,
    },
    experience: {
      type: String,
      trim: true,
    },
    specialization: {
      type: String,
      required: true,
      trim: true,
    },
    universityName: {
      type: String,
      required: true,
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
      enum: ["pending", "approved", "rejected"],
      default: "approved", // Changed from "pending" to "approved"
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
    bio: {
      type: String,
      trim: true,
    },
    hourlyRate: {
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
        "online_individual",
        "online_group",
        "offline_home",
        "offline_classroom",
      ],
      default: ["online_individual"],
    },
    subjects: {
      type: [String],
      default: [],
    },
    location: {
      city: String,
      state: String,
      country: String,
    },
  },
  {
    timestamps: true,
  }
);

const Tutor = mongoose.model("Tutor", tutorSchema);

module.exports = Tutor;
