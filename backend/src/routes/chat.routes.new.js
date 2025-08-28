const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../middleware/auth.middleware");

// Basic test route that doesn't depend on the controller
router.get("/test", (req, res) => {
  res.json({ message: "Chat API is working" });
});

// Try loading the controller directly here
try {
  const chatController = require("../controllers/chat.controller");
  console.log("Chat Controller Functions:", Object.keys(chatController));

  // Add routes using the controller but with a safer approach
  if (typeof chatController.getConversations === "function") {
    router.get(
      "/conversations",
      authenticateToken,
      chatController.getConversations
    );
  } else {
    console.warn("getConversations is not a function");
    router.get("/conversations", authenticateToken, (req, res) => {
      res.status(501).json({ error: "Not implemented" });
    });
  }
} catch (error) {
  console.error("Error loading chat controller:", error);

  // Fallback route if controller fails to load
  router.get("/error", (req, res) => {
    res
      .status(500)
      .json({ error: "Controller failed to load", details: error.message });
  });
}

module.exports = router;
