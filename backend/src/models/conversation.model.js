const mongoose = require("mongoose");

const conversationSchema = new mongoose.Schema(
  {
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],
    lastMessage: {
      type: String,
      trim: true,
    },
    lastMessageTime: {
      type: Date,
    },
    unreadCount: {
      type: Map,
      of: Number,
      default: {},
    },
    // Optional reference to a session if the conversation is related to one
    session: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Session",
    },
    // Optional reference to a tutor if this is an inquiry conversation
    tutor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tutor",
    },
    // Optional reference to a student if this is an inquiry conversation
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
    },
    // Conversation type to differentiate between session chats and inquiry chats
    type: {
      type: String,
      enum: ["session", "inquiry"],
      default: "inquiry",
    },
  },
  {
    timestamps: true,
  }
);

// Ensure participants are unique and exactly 2
conversationSchema.pre("save", function (next) {
  if (!this.participants || this.participants.length !== 2) {
    return next(new Error("A conversation must have exactly 2 participants"));
  }

  // Convert participants to strings for comparison
  const participantStrings = this.participants.map((p) => p.toString());

  // Check for duplicates
  if (new Set(participantStrings).size !== participantStrings.length) {
    return next(new Error("Participants must be unique users"));
  }

  next();
});

// Create a compound index on participants to ensure uniqueness and efficient querying
conversationSchema.index({ participants: 1 }, { unique: true });

const Conversation = mongoose.model("Conversation", conversationSchema);

module.exports = Conversation;
