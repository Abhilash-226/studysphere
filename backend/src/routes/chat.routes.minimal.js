const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../middleware/auth.middleware");
const chatController = require("../controllers/chat.controller");

// Extremely basic route that doesn't use controllers
router.get("/test", (req, res) => {
  res.json({ message: "Chat API is working" });
});

// Conversations endpoints with proper error handling
router.post("/conversations", authenticateToken, (req, res) => {
  try {
    return chatController.createConversation(req, res);
  } catch (error) {
    console.error("Error in /conversations POST:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error: " + error.message,
    });
  }
});

router.get("/conversations", authenticateToken, (req, res) => {
  try {
    return chatController.getConversations(req, res);
  } catch (error) {
    console.error("Error in /conversations GET:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error: " + error.message,
    });
  }
});

router.get("/conversations/:conversationId", authenticateToken, (req, res) => {
  try {
    return chatController.getConversationById(req, res);
  } catch (error) {
    console.error("Error in /conversations/:id GET:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error: " + error.message,
    });
  }
});

router.get(
  "/conversations/:conversationId/messages",
  authenticateToken,
  (req, res) => {
    try {
      return chatController.getMessagesByConversation(req, res);
    } catch (error) {
      console.error("Error in /conversations/:id/messages GET:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error: " + error.message,
      });
    }
  }
);

router.post(
  "/conversations/:conversationId/messages",
  authenticateToken,
  (req, res) => {
    try {
      return chatController.sendMessage(req, res);
    } catch (error) {
      console.error("Error in /conversations/:id/messages POST:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error: " + error.message,
      });
    }
  }
);

router.post(
  "/conversations/:conversationId/read",
  authenticateToken,
  (req, res) => {
    try {
      return chatController.markConversationAsRead(req, res);
    } catch (error) {
      console.error("Error in /conversations/:id/read POST:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error: " + error.message,
      });
    }
  }
);

router.get("/unread-count", authenticateToken, (req, res) => {
  try {
    return chatController.getUnreadCount(req, res);
  } catch (error) {
    console.error("Error in /unread-count GET:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error: " + error.message,
    });
  }
});

module.exports = router;
