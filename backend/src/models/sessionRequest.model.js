const mongoose = require("mongoose");

const sessionRequestSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
    tutor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tutor",
      required: true,
    },
    subject: {
      type: String,
      required: true,
      trim: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    requestedStartTime: {
      type: Date,
      required: true,
    },
    requestedEndTime: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "declined", "cancelled"],
      default: "pending",
    },
    mode: {
      type: String,
      enum: ["online", "offline"],
      required: true,
    },
    location: {
      type: String,
      trim: true,
    },
    proposedPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    message: {
      type: String,
      trim: true,
    },
    tutorResponse: {
      type: String,
      trim: true,
    },
    declineReason: {
      type: String,
      trim: true,
    },
    respondedAt: {
      type: Date,
    },
    expiresAt: {
      type: Date,
      default: function () {
        // Requests expire after 48 hours
        return new Date(Date.now() + 48 * 60 * 60 * 1000);
      },
    },
    // If accepted, this will reference the created session
    sessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Session",
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
sessionRequestSchema.index({ tutor: 1, status: 1 });
sessionRequestSchema.index({ student: 1, status: 1 });
sessionRequestSchema.index({ expiresAt: 1 });

// Auto-expire old pending requests
sessionRequestSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const SessionRequest = mongoose.model("SessionRequest", sessionRequestSchema);

module.exports = SessionRequest;
