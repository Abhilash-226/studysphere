const express = require("express");
const router = express.Router();

// Basic endpoint to check if service is working
router.get("/test", (req, res) => {
  res.json({ message: "Chat API is working" });
});

// Basic conversation creation endpoint
router.post("/conversations", (req, res) => {
  const { recipientId } = req.body;
  console.log("Create conversation route hit", req.body);

  // Generate a unique conversation ID that includes the tutor ID if available
  const conversationId = recipientId
    ? `conv-tutor-${recipientId}-${Date.now()}`
    : `conv-${Date.now()}`;

  res.status(201).json({
    success: true,
    message: "Conversation created successfully",
    conversationId: conversationId,
    recipientId: recipientId || "demo-tutor",
  });
});

// Use the chat service to manage messages
const chatService = require("../services/chat.service");
const messageStore = chatService.messageStore;

// Basic message sending endpoint
router.post("/conversations/:conversationId/messages", (req, res) => {
  const { conversationId } = req.params;
  const { content } = req.body;

  console.log(`Sending message to conversation ${conversationId}:`, content);

  // Create a new message object
  const newMessage = {
    _id: "msg-" + Date.now(),
    conversationId: conversationId,
    content: content,
    sender: "user-1", // In a real app, this would be the authenticated user's ID
    createdAt: new Date().toISOString(),
    read: false,
    isSentByCurrentUser: true, // This flag helps the frontend
  };

  // Initialize conversation in the store if it doesn't exist
  if (!messageStore[conversationId]) {
    messageStore[conversationId] = [];
  }

  // Add message to the store
  messageStore[conversationId].push(newMessage);

  res.status(201).json({
    success: true,
    message: "Message sent successfully",
    messageId: newMessage._id,
    conversationId: conversationId,
    content: content,
    createdAt: newMessage.createdAt,
  });
});

// Get messages for a conversation
router.get("/conversations/:conversationId/messages", (req, res) => {
  const { conversationId } = req.params;

  console.log(`Getting messages for conversation ${conversationId}`);

  // Get messages from store or initialize with default welcome message
  let messages = messageStore[conversationId] || [];

  // If this is the first time accessing this conversation, add a welcome message
  if (messages.length === 0) {
    // Extract tutor name if available
    let tutorName = "Demo Tutor";
    if (conversationId.startsWith("conv-tutor-")) {
      const parts = conversationId.split("-");
      if (parts.length >= 4) {
        const tutorId = parts[2];
        tutorName = "Tutor " + tutorId.substring(0, 5);
      }
    }

    // Add a welcome message
    messages = [
      {
        _id: "welcome-msg-" + conversationId,
        sender: "user-2", // tutor
        content: `Hello! I'm ${tutorName}. How can I help you with your studies?`,
        createdAt: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
        read: true,
        isSentByCurrentUser: false,
      },
    ];

    // Store these initial messages
    messageStore[conversationId] = messages;
  }

  res.status(200).json({
    success: true,
    messages: messages,
    pagination: {
      page: 1,
      limit: 50,
      total: messages.length,
    },
  });
});

// Get conversation by ID
router.get("/conversations/:conversationId", (req, res) => {
  const { conversationId } = req.params;

  console.log(`Getting conversation details for ${conversationId}`);

  // Extract tutor ID if it's in the conversationId format we created
  let tutorId = "user-2";
  let tutorName = "Demo Tutor";

  if (conversationId.startsWith("conv-tutor-")) {
    // Format is conv-tutor-{tutorId}-{timestamp}
    const parts = conversationId.split("-");
    if (parts.length >= 4) {
      tutorId = parts[2];
      // In a real app, you'd query the database for the tutor name
      tutorName = "Tutor " + tutorId.substring(0, 5);
    }
  }

  // Return dummy conversation data in the format expected by the frontend
  res.status(200).json({
    success: true,
    conversation: {
      id: conversationId,
      otherUser: {
        id: tutorId,
        name: tutorName,
        role: "tutor",
        profileImage: "/images/tutors/tutor-placeholder.svg",
        email: `${tutorId}@example.com`,
      },
      lastMessage: "Hello, how can I help you with your studies?",
      lastMessageTime: new Date().toISOString(),
      unreadCount: 0,
      type: "inquiry",
    },
  });
});

// Mark conversation as read
router.put("/conversations/:conversationId/read", (req, res) => {
  const { conversationId } = req.params;

  console.log(`Marking conversation ${conversationId} as read`);

  // Mark all messages in the conversation as read
  if (messageStore[conversationId]) {
    messageStore[conversationId] = messageStore[conversationId].map((msg) => {
      // Only mark messages from the other user as read
      if (msg.sender !== "user-1") {
        return { ...msg, read: true };
      }
      return msg;
    });
  }

  res.status(200).json({
    success: true,
    message: "Conversation marked as read",
  });
});

// Get all conversations for current user
router.get("/conversations", (req, res) => {
  console.log("Getting all conversations");

  // Build the list of conversations based on the messageStore
  const conversationsList = Object.keys(messageStore).map((conversationId) => {
    const messages = messageStore[conversationId];
    const lastMessage =
      messages.length > 0 ? messages[messages.length - 1] : null;

    // Extract tutor information from conversation ID
    let tutorId = "user-2";
    let tutorName = "Demo Tutor";

    if (conversationId.startsWith("conv-tutor-")) {
      const parts = conversationId.split("-");
      if (parts.length >= 4) {
        tutorId = parts[2];
        tutorName = "Tutor " + tutorId.substring(0, 5);
      }
    }

    return {
      _id: conversationId,
      participants: ["user-1", tutorId],
      lastMessage: lastMessage
        ? {
            content: lastMessage.content,
            sender: lastMessage.sender,
            createdAt: lastMessage.createdAt,
            read: lastMessage.read,
          }
        : null,
      otherUser: {
        _id: tutorId,
        name: tutorName,
        email: `${tutorId.replace(/user-/, "")}@example.com`,
        profileImage: "https://randomuser.me/api/portraits/men/35.jpg",
        role: "tutor",
      },
      createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
      updatedAt: lastMessage
        ? lastMessage.createdAt
        : new Date(Date.now() - 86400000).toISOString(),
    };
  });

  // If no conversations exist yet, provide a demo conversation
  if (conversationsList.length === 0) {
    conversationsList.push({
      _id: "conv1",
      participants: ["user-1", "user-2"],
      lastMessage: {
        content: "Welcome to StudySphere Chat!",
        sender: "user-2",
        createdAt: new Date(Date.now() - 1800000).toISOString(),
        read: true,
      },
      otherUser: {
        _id: "user-2",
        name: "Demo Tutor",
        email: "demo.tutor@example.com",
        profileImage: "https://randomuser.me/api/portraits/men/35.jpg",
        role: "tutor",
      },
      createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
      updatedAt: new Date(Date.now() - 1800000).toISOString(), // 30 mins ago
    });
  }

  res.status(200).json({
    success: true,
    conversations: conversationsList,
    pagination: {
      page: 1,
      limit: 20,
      total: conversationsList.length,
    },
  });
});

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

// Clear all messages in a conversation
router.delete("/conversations/:conversationId/messages", (req, res) => {
  const { conversationId } = req.params;
  console.log(`Clearing all messages from conversation ${conversationId}`);

  if (!messageStore[conversationId]) {
    return res.status(404).json({
      success: false,
      message: "Conversation not found",
    });
  }

  // Clear all messages for this conversation
  messageStore[conversationId] = [];

  res.status(200).json({
    success: true,
    message: "All messages in conversation have been cleared",
  });
});

module.exports = router;
