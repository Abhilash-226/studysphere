const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../middleware/auth.middleware");

// Mock successful response for createConversation
router.post("/conversations", authenticateToken, (req, res) => {
  console.log("Create conversation route hit", req.body);
  res.status(201).json({
    success: true,
    message: "Conversation created successfully",
    conversationId: "temp-" + Date.now(),
  });
});

// Mock successful response for sendMessage
router.post(
  "/conversations/:conversationId/messages",
  authenticateToken,
  (req, res) => {
    console.log("Send message route hit", req.body);
    res.status(201).json({
      success: true,
      message: "Message sent successfully",
      data: {
        id: "msg-" + Date.now(),
        content: req.body.content,
        createdAt: new Date(),
        sender: {
          id: req.user.id,
          name: "Current User",
          role: req.user.role,
        },
        isSentByCurrentUser: true,
        read: false,
      },
    });
  }
);

// Basic endpoint to check if service is working
router.get("/test", (req, res) => {
  res.json({ message: "Chat API is working" });
});

module.exports = router;
