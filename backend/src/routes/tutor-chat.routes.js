const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../middleware/auth.middleware");
const roleMiddleware = require("../middleware/role.middleware");
const chatService = require("../services/chat.service");
const User = require("../models/user.model");
const Student = require("../models/student.model");

// Make sure isTutor is correctly destructured
const { isTutor } = roleMiddleware;

// Helper function to get user details
const getUserDetails = async (userId) => {
  try {
    const user = await User.findById(userId).select(
      "firstName lastName profileImage role email"
    );
    if (user) {
      const fullName = `${user.firstName} ${user.lastName}`;
      return {
        name: fullName,
        email:
          user.email ||
          `${user.firstName.toLowerCase()}.${user.lastName.toLowerCase()}@example.com`,
        profileImage:
          user.profileImage ||
          (user.role === "tutor"
            ? "/images/tutors/tutor-placeholder.svg"
            : "/images/students/student-placeholder.svg"),
        role: user.role,
        _id: userId,
        firstName: user.firstName,
        lastName: user.lastName,
      };
    }
  } catch (error) {
    console.error(`Error fetching user details for ${userId}:`, error);
  }

  // Default values if user not found
  return {
    name: userId.includes("tutor") ? "Tutor User" : "Student User",
    email: `${userId}@example.com`,
    profileImage: userId.includes("tutor")
      ? "/images/tutors/tutor-placeholder.svg"
      : "/images/students/student-placeholder.svg",
    role: userId.includes("tutor") ? "tutor" : "student",
    _id: userId,
  };
};

// Get all conversations for the current tutor
router.get(
  "/tutor-conversations",
  authenticateToken,
  isTutor,
  async (req, res) => {
    const tutorId = req.user.id;

    // In a real implementation, this would query the database
    // to find all conversations where the tutor is a participant
    console.log(`Getting conversations for tutor ${tutorId}`);

    // Get the message store from chat service
    const messageStore = chatService.messageStore;

    // Build the list of conversations based on the messageStore
    const conversationsList = Object.keys(messageStore)
      // Only include conversations with this tutor's ID in the conversation ID or all tutor conversations for demo
      .filter(
        (conversationId) =>
          conversationId.includes(`tutor-${tutorId}`) ||
          conversationId.startsWith("conv-tutor-")
      )
      .map(async (conversationId) => {
        const messages = messageStore[conversationId] || [];
        const lastMessage =
          messages.length > 0 ? messages[messages.length - 1] : null;

        // Extract student ID from conversation ID or message
        let studentId = "student-1";

        // Try to get sender ID if it's not the tutor
        if (lastMessage && lastMessage.sender !== tutorId) {
          studentId = lastMessage.sender;
        }

        // Default student info (will be updated with real data when possible)
        let studentName = "Student";
        let studentEmail = "";
        let profileImage = "/images/default-profile.png";

        // Try to get the real student information from the message or database
        try {
          // If we have a sender ID and it's not the tutor, try to get user info from database
          if (studentId && studentId !== tutorId) {
            // Use the getUserDetails helper which has better fallbacks
            const userDetails = await getUserDetails(studentId);
            if (userDetails) {
              studentName = userDetails.name;
              studentEmail = userDetails.email;
              profileImage = userDetails.profileImage;
            }
          }
        } catch (err) {
          console.warn("Failed to get student details from database:", err);

          // Fall back to message data if available
          if (lastMessage && lastMessage.senderName) {
            studentName = lastMessage.senderName;
          }

          if (lastMessage && lastMessage.senderEmail) {
            studentEmail = lastMessage.senderEmail;
          }

          if (lastMessage && lastMessage.profileImage) {
            profileImage = lastMessage.profileImage;
          }

          // If still no name, create something better than just 'Student'
          if (studentName === "Student" && studentId) {
            studentName = `Student ${studentId.substring(0, 5)}`;
          }

          // Ensure we have an email
          if (!studentEmail && studentId) {
            studentEmail = `${studentId.replace(/-/g, ".")}@example.com`;
          }
        }

        return {
          _id: conversationId,
          participants: [tutorId, studentId],
          lastMessage: lastMessage
            ? {
                content: lastMessage.content,
                sender: lastMessage.sender,
                createdAt: lastMessage.createdAt,
                read: lastMessage.read,
              }
            : null,
          otherUser: {
            _id: studentId,
            name: studentName,
            email: studentEmail,
            profileImage: profileImage,
            role: "student",
          },
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          updatedAt: lastMessage
            ? lastMessage.createdAt
            : new Date(Date.now() - 86400000).toISOString(),
        };
      });

    // Wait for all promises to resolve since we're using async in the map
    try {
      const resolvedConversations = await Promise.all(conversationsList);

      // Return the conversations list
      res.status(200).json({
        success: true,
        conversations: resolvedConversations,
        pagination: {
          page: 1,
          limit: 20,
          total: resolvedConversations.length,
        },
      });
    } catch (error) {
      console.error("Error resolving conversation details:", error);
      res.status(500).json({
        success: false,
        message: "Failed to load conversations",
        error: error.message,
      });
    }
  }
);

// Get tutor message stats - unread count, latest messages, etc.
router.get("/tutor-message-stats", authenticateToken, isTutor, (req, res) => {
  const tutorId = req.user.id;

  console.log(`Getting message stats for tutor ${tutorId}`);

  // Calculate real stats based on message store
  const allConversations = Object.keys(chatService.messageStore).filter(
    (conversationId) =>
      conversationId.includes(`tutor-${tutorId}`) ||
      conversationId.startsWith("conv-tutor-")
  );

  // Count unread messages
  let unreadCount = 0;
  allConversations.forEach((convId) => {
    const messages = chatService.messageStore[convId] || [];
    unreadCount += messages.filter(
      (msg) => !msg.read && msg.sender !== tutorId
    ).length;
  });

  // Calculate response rate (if there are enough messages)
  const responseRate = 95; // Default for now, would be calculated in real app
  const averageResponseTime = 22; // Default for now, would be calculated in real app

  res.status(200).json({
    success: true,
    stats: {
      totalConversations: allConversations.length,
      unreadCount: unreadCount,
      responseRate: responseRate,
      averageResponseTime: averageResponseTime,
    },
  });
});

// Get messages for a specific conversation
router.get(
  "/conversation/:conversationId",
  authenticateToken,
  isTutor,
  async (req, res) => {
    const tutorId = req.user.id;
    const { conversationId } = req.params;

    try {
      // Get messages from store
      const messages = chatService.getMessages(conversationId);

      // Get unique user IDs from the messages
      const userIds = [...new Set(messages.map((msg) => msg.sender))];

      // Retrieve user information for all users in this conversation
      const users = await User.find({ _id: { $in: userIds } }).select(
        "firstName lastName role profileImage email"
      );

      // Create a map of user info for quick lookup
      const userMap = {};
      users.forEach((user) => {
        userMap[user._id.toString()] = {
          name: `${user.firstName} ${user.lastName}`,
          role: user.role,
          email: user.email,
          profileImage:
            user.profileImage ||
            (user.role === "tutor"
              ? "/images/tutors/tutor-placeholder.svg"
              : "/images/students/student-placeholder.svg"),
        };
      });

      // Enhance messages with user information
      const enhancedMessages = messages.map((msg) => {
        // If we have user info from DB, use that
        const userInfo = userMap[msg.sender] || {
          // Otherwise, use message info or get default based on role
          name:
            msg.senderName ||
            (msg.sender.includes("tutor") ? "Tutor" : "Student"),
          role:
            msg.role || (msg.sender.includes("tutor") ? "tutor" : "student"),
          email: msg.senderEmail || `${msg.sender}@example.com`,
          profileImage:
            msg.profileImage ||
            (msg.sender.includes("tutor")
              ? "/images/tutors/tutor-placeholder.svg"
              : "/images/students/student-placeholder.svg"),
        };

        return {
          ...msg,
          senderName: userInfo.name,
          senderEmail: userInfo.email,
          role: userInfo.role,
          profileImage: userInfo.profileImage,
          read: msg.sender !== tutorId ? true : msg.read, // Mark as read if it's a student message
        };
      });

      // Update the message store with read status
      chatService.messageStore[conversationId] = enhancedMessages;

      // Find the student ID (the non-tutor participant)
      const studentId =
        userIds.find((id) => !id.includes("tutor") && id !== tutorId) ||
        "student-user";

      // Get student details
      let studentDetails = userMap[studentId] || null;

      // If no student details in userMap, try to get it directly
      if (!studentDetails && studentId) {
        try {
          studentDetails = await getUserDetails(studentId);
        } catch (err) {
          console.error("Error getting student details:", err);
        }
      }

      // Default student details if still not found
      if (!studentDetails) {
        studentDetails = {
          name: "Student User",
          email: "student@example.com",
          profileImage: "/images/students/student-placeholder.svg",
          role: "student",
          _id: studentId,
        };
      }

      res.status(200).json({
        success: true,
        conversationId: conversationId,
        messages: enhancedMessages,
        conversation: {
          id: conversationId,
          otherUser: {
            id: studentDetails._id,
            _id: studentDetails._id,
            name: studentDetails.name,
            email: studentDetails.email || `${studentDetails._id}@example.com`,
            profileImage: studentDetails.profileImage,
            role: "student",
          },
        },
        pagination: {
          page: 1,
          limit: 50,
          total: enhancedMessages.length,
        },
      });
    } catch (error) {
      console.error("Error fetching conversation messages:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch conversation messages",
        error: error.message,
      });
    }
  }
);

// Send a reply as a tutor
router.post(
  "/reply/:conversationId",
  authenticateToken,
  isTutor,
  async (req, res) => {
    const tutorId = req.user.id;
    const { conversationId } = req.params;
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({
        success: false,
        message: "Message content is required",
      });
    }

    try {
      // Get tutor information
      let tutorName = "Tutor";
      let tutorEmail = "";
      let profileImage = "/images/default-profile.png";

      // Get tutor information from the database
      try {
        const user = await User.findById(tutorId).select(
          "firstName lastName profileImage email"
        );
        if (user) {
          tutorName = `${user.firstName} ${user.lastName}`;
          if (user.profileImage) {
            profileImage = user.profileImage;
          }
          tutorEmail = user.email;
        }
      } catch (error) {
        console.error("Error fetching tutor details:", error);
      }

      // Extract student ID from conversation ID
      let studentId = conversationId.replace(`tutor-${tutorId}-`, "");
      if (studentId === conversationId) {
        // If no change, try another format
        studentId =
          conversationId
            .split("-")
            .find(
              (part) =>
                part !== "conv" && part !== "tutor" && !part.includes(tutorId)
            ) || "student-user";
      }

      // Create a new message
      const newMessage = {
        _id: `msg-${Date.now()}`,
        conversationId: conversationId,
        content: content,
        sender: tutorId,
        recipientId: studentId, // Add recipient ID
        senderName: tutorName,
        senderEmail: tutorEmail,
        profileImage: profileImage,
        createdAt: new Date().toISOString(),
        read: false,
        role: "tutor",
      };

      // Add the message to the conversation
      // Add the message and broadcast it via WebSockets
      chatService.addMessage(conversationId, newMessage);

      // Get student details for sending back to client
      let studentDetails;
      try {
        studentDetails = await getUserDetails(studentId);
      } catch (err) {
        studentDetails = {
          name: "Student User",
          email: `${studentId}@example.com`,
          profileImage: "/images/students/student-placeholder.svg",
          role: "student",
          _id: studentId,
        };
      }

      // Send response with conversation details
      res.status(201).json({
        success: true,
        message: "Reply sent successfully",
        data: newMessage,
        conversation: {
          id: conversationId,
          otherUser: {
            id: studentDetails._id,
            _id: studentDetails._id,
            name: studentDetails.name,
            email: studentDetails.email,
            profileImage: studentDetails.profileImage,
            role: "student",
          },
        },
      });
    } catch (error) {
      console.error("Error sending tutor reply:", error);
      res.status(500).json({
        success: false,
        message: "Error sending reply",
        error: error.message,
      });
    }
  }
);

module.exports = router;
