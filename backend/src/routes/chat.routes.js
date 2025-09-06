const express = require("express");
const { authenticateToken } = require("../middleware/auth.middleware");
const router = express.Router();

// Basic endpoint to check if service is working
router.get("/test", (req, res) => {
  res.json({ message: "Chat API is working" });
});

// Use controller for production chat behavior
const chatController = require("../controllers/chat.controller");

// Create a new conversation (use controller, requires authentication)
router.post(
  "/conversations",
  authenticateToken,
  chatController.createConversation
);

// Use the chat service to manage messages
const chatService = require("../services/chat.service");
const messageStore = chatService.messageStore;

// Send a message in a conversation (controller)
router.post(
  "/conversations/:conversationId/messages",
  authenticateToken,
  chatController.sendMessage
);

// Get messages for a conversation (controller)
router.get(
  "/conversations/:conversationId/messages",
  authenticateToken,
  chatController.getMessagesByConversation
);

// Get conversation by ID (controller)
router.get(
  "/conversations/:conversationId",
  authenticateToken,
  chatController.getConversationById
);

// Mark conversation as read (controller)
router.put(
  "/conversations/:conversationId/read",
  authenticateToken,
  chatController.markMessagesAsRead
);

// Get all conversations for current user (controller)
router.get(
  "/conversations",
  authenticateToken,
  chatController.getConversations
);

// Get message statistics for students
router.get(
  "/student/stats",
  authenticateToken,
  chatController.getStudentMessageStats
);

// Get message statistics for tutors
router.get(
  "/tutor/stats",
  authenticateToken,
  chatController.getTutorMessageStats
);

// Get unread count for the current user
router.get("/unread-count", (req, res) => {
  console.log("Getting unread count");

  // Calculate unread messages across all conversations
  // In a real app, this would filter by the current user
  let totalUnread = 0;

  Object.values(messageStore).forEach((messages) => {
    totalUnread += messages.filter(
      (msg) =>
        // Only count messages that:
        // 1. Are not sent by current user
        // 2. Are marked as unread
        msg.sender !== "user-1" && !msg.read
    ).length;
  });

  res.status(200).json({
    success: true,
    count: totalUnread,
  });
});

// Clear all messages in a conversation (controller)
router.delete(
  "/conversations/:conversationId/messages",
  authenticateToken,
  chatController.clearConversation
);

module.exports = router;
