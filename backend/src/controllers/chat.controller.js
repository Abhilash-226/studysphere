const Conversation = require("../models/conversation.model");
const Message = require("../models/message.model");
const User = require("../models/user.model");
const Tutor = require("../models/tutor.model");
const Student = require("../models/student.model");
const mongoose = require("mongoose");
const chatService = require("../services/chat.service");
const { encrypt, decrypt } = require("../utils/encryption");

// Helper function to process conversations consistently
const processConversations = async (conversations, userId) => {
  // Format conversations for client with consistent user data
  const formattedConversations = await Promise.all(
    conversations.map(async (conv) => {
      // Find the other participant (not the current user)
      const otherParticipant = conv.participants.find(
        (participant) => participant._id.toString() !== userId.toString()
      );

      if (!otherParticipant) {
        return null; // Skip conversations without other participants
      }

      const otherUserData = await formatUserData(otherParticipant, conv);

      return {
        id: conv._id,
        otherUser: otherUserData,
        lastMessage: decrypt(conv.lastMessage || ""),
        lastMessageTime: conv.lastMessageTime,
        unreadCount: conv.unreadCount.get(userId.toString()) || 0,
        type: conv.type,
        tutorInfo: conv.tutor
          ? {
              specialization: conv.tutor.specialization,
              qualification: conv.tutor.qualification,
            }
          : null,
      };
    })
  );

  // Filter out null conversations
  return formattedConversations.filter((conv) => conv !== null);
};

// Helper function to format user data consistently
const formatUserData = async (user, conversation = null) => {
  if (!user) return { name: "Unknown User", role: "unknown" };

  // Accept multiple shapes for `user`: populated object, plain object with _id, ObjectId, or string id
  let userId = null;
  if (typeof user === "string") userId = user;
  else if (user._id) userId = user._id.toString();
  else if (user.toString) userId = user.toString();

  // Start with values present on the passed object (if any)
  let name = user.name || null;
  let email = user.email || "No email";
  let profileImage = user.profileImage || "";
  let role = user.role || "unknown";

  // If the passed object already contains firstName/lastName, prefer those
  if (!name && (user.firstName || user.lastName)) {
    const first = (user.firstName || "").trim();
    const last = (user.lastName || "").trim();
    if (first || last) name = `${first} ${last}`.trim();
  }

  // Try to fetch full User document when we don't have name or role info
  try {
    if (!name || role === "unknown") {
      const fullUser = await User.findById(userId)
        .select("firstName lastName email profileImage role")
        .lean();

      if (fullUser) {
        email = fullUser.email || email;
        profileImage = fullUser.profileImage || profileImage;
        role = fullUser.role || role;

        if (
          fullUser.firstName &&
          fullUser.lastName &&
          fullUser.firstName.trim() !== "" &&
          fullUser.lastName.trim() !== ""
        ) {
          name = `${fullUser.firstName} ${fullUser.lastName}`.trim();
        }
      }
    }
  } catch (err) {
    console.error(`Error fetching full User for ${userId}:`, err);
  }

  // Role-specific lookups if still missing name
  if (!name) {
    try {
      if (role === "tutor") {
        const tutorWithUser = await Tutor.findOne({ user: userId })
          .populate("user", "firstName lastName email profileImage")
          .lean();

        if (tutorWithUser && tutorWithUser.user) {
          const tutorUser = tutorWithUser.user;
          if (tutorUser.firstName && tutorUser.lastName) {
            name = `${tutorUser.firstName} ${tutorUser.lastName}`.trim();
          }
          email = tutorUser.email || email;
          profileImage = tutorUser.profileImage || profileImage;
        }
      } else if (role === "student") {
        const studentWithUser = await Student.findOne({ user: userId })
          .populate("user", "firstName lastName email profileImage")
          .lean();

        if (studentWithUser && studentWithUser.user) {
          const studentUser = studentWithUser.user;
          if (studentUser.firstName && studentUser.lastName) {
            name = `${studentUser.firstName} ${studentUser.lastName}`.trim();
          }
          email = studentUser.email || email;
          profileImage = studentUser.profileImage || profileImage;
        }
      }
    } catch (err) {
      console.error(`Error in role-specific lookup for ${userId}:`, err);
    }
  }

  // If we still don't have a name, try conversation-level tutor reference
  if (!name && conversation && conversation.tutor) {
    try {
      const tutorInfo = await Tutor.findById(conversation.tutor)
        .populate("user", "firstName lastName")
        .lean();

      if (
        tutorInfo &&
        tutorInfo.user &&
        tutorInfo.user.firstName &&
        tutorInfo.user.lastName
      ) {
        name = `${tutorInfo.user.firstName} ${tutorInfo.user.lastName}`.trim();
      }
    } catch (err) {
      console.error(
        `Error fetching conversation tutor info for ${userId}:`,
        err
      );
    }
  }

  // Final fallback - extract from email or use short id label
  if (!name || name === "Unknown User") {
    if (email && email !== "No email" && email.includes("@")) {
      const emailPrefix = email.split("@")[0];
      if (emailPrefix.includes(".")) {
        const parts = emailPrefix.split(".");
        name = `${parts[0].charAt(0).toUpperCase() + parts[0].slice(1)} ${
          parts[1].charAt(0).toUpperCase() + parts[1].slice(1)
        }`;
      } else {
        name = emailPrefix.charAt(0).toUpperCase() + emailPrefix.slice(1);
      }
    } else {
      const idSuffix = (userId || "").toString().slice(-4);
      name = `${role === "tutor" ? "Tutor" : "Student"} ${idSuffix}`;
    }
  }

  return {
    id: userId || (user._id || user).toString(),
    name,
    profileImage,
    email,
    role,
  };
};

// Get all conversations for the current user
exports.getConversations = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;

    // For tutors, we need to ensure they only see conversations where they are directly involved
    if (userRole === "tutor") {
      const tutorData = await Tutor.findOne({ user: userId })
        .select("_id")
        .lean();

      if (!tutorData) {
        return res.status(404).json({
          success: false,
          message: "Tutor profile not found",
        });
      }

      // First get all conversations where this user is a participant
      const allConversations = await Conversation.find({
        participants: userId,
      }).lean();

      // Filter to only include conversations where this tutor is the actual tutor
      const tutorConversations = allConversations.filter(
        (conv) =>
          conv.tutor && conv.tutor.toString() === tutorData._id.toString()
      );

      // Now populate these filtered conversations
      const populatedConversations = await Conversation.find({
        _id: { $in: tutorConversations.map((c) => c._id) },
      })
        .populate({
          path: "participants",
          select: "firstName lastName profileImage email role",
        })
        .populate({
          path: "tutor",
          select: "specialization qualification",
        })
        .sort({ lastMessageTime: -1 });

      // Process the conversations for the response
      const formattedConversations = await processConversations(
        populatedConversations,
        userId
      );

      return res.status(200).json({
        success: true,
        conversations: formattedConversations,
      });
    }

    // For students and other roles, proceed normally
    const conversations = await Conversation.find({ participants: userId })
      .populate({
        path: "participants",
        select: "firstName lastName profileImage email role",
      })
      .populate({
        path: "tutor",
        select: "specialization qualification",
      })
      .sort({ lastMessageTime: -1 }); // Sort by most recent message

    // Format conversations for client with consistent user data
    const validConversations = await processConversations(conversations, userId);

    res.status(200).json({
      success: true,
      conversations: validConversations,
    });
  } catch (error) {
    console.error("Error getting conversations:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve conversations",
      error: error.message,
    });
  }
};

// Get conversation by ID
exports.getConversationById = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user.id;

    // Validate conversation ID
    if (!mongoose.Types.ObjectId.isValid(conversationId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid conversation ID format",
      });
    }

    const conversation = await Conversation.findById(conversationId).populate({
      path: "participants",
      select: "firstName lastName profileImage email role",
    });

    // Check if conversation exists
    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: "Conversation not found",
      });
    }

    // Check if user is a participant
    if (!conversation.participants.some((p) => p._id.toString() === userId)) {
      return res.status(403).json({
        success: false,
        message: "You don't have permission to access this conversation",
      });
    }

    // Format the conversation for the client with consistent user data
    const otherParticipant = conversation.participants.find(
      (p) => p._id.toString() !== userId
    );

    const formattedConversation = {
      id: conversation._id,
      otherUser: await formatUserData(otherParticipant),
      lastMessage: decrypt(conversation.lastMessage || ""),
      lastMessageTime: conversation.lastMessageTime,
      unreadCount: conversation.unreadCount.get(userId.toString()) || 0,
      type: conversation.type,
    };

    res.status(200).json({
      success: true,
      conversation: formattedConversation,
    });
  } catch (error) {
    console.error("Error getting conversation by ID:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve conversation",
      error: error.message,
    });
  }
};

// Create a new conversation
exports.createConversation = async (req, res) => {
  try {
    const userId = req.user.id;
    const { recipientId } = req.body;
    // Defensive: ensure we have a recipientId and resolve it to a User _id if a Tutor id was passed
    if (!recipientId) {
      return res
        .status(400)
        .json({ success: false, message: "recipientId is required" });
    }

    let resolvedRecipientId = recipientId;

    try {
      // If caller passed a Tutor _id instead of a User _id, resolve it
      if (mongoose.Types.ObjectId.isValid(recipientId)) {
        const maybeTutor = await Tutor.findById(recipientId)
          .select("user")
          .lean();
        if (maybeTutor && maybeTutor.user) {
          resolvedRecipientId = maybeTutor.user.toString();
        }
      }
    } catch (err) {
      // continue and attempt to use the original recipientId below
    }

    // Validate resolvedRecipientId
    if (!mongoose.Types.ObjectId.isValid(resolvedRecipientId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid recipient ID format" });
    }

    // Prevent creating a conversation with self
    if (resolvedRecipientId.toString() === userId.toString()) {
      return res.status(400).json({
        success: false,
        message: "Cannot create conversation with yourself",
      });
    }

    // Check if recipient (user) exists
    const recipient = await User.findById(resolvedRecipientId).select(
      "_id role"
    );
    if (!recipient) {
      return res
        .status(404)
        .json({ success: false, message: "Recipient not found" });
    }

    // Check if conversation already exists between these users (use resolved recipient id)
    const existingConversation = await Conversation.findOne({
      participants: { $all: [userId, resolvedRecipientId] },
    });

    if (existingConversation) {
      return res.status(200).json({
        success: true,
        message: "Conversation already exists",
        conversationId: existingConversation._id,
      });
    }

    // Determine the type of conversation based on user roles
    const currentUser = await User.findById(userId).select("_id role");
    let conversationType = "inquiry";
    let tutorId = null;
    let studentId = null;

    // If one user is a tutor and the other is a student
    if (currentUser && recipient) {
      if (currentUser.role === "tutor" && recipient.role === "student") {
        const tutor = await Tutor.findOne({ user: userId });
        const student = await Student.findOne({ user: resolvedRecipientId });

        if (tutor && student) {
          tutorId = tutor._id;
          studentId = student._id;
        }
      } else if (currentUser.role === "student" && recipient.role === "tutor") {
        const tutor = await Tutor.findOne({ user: resolvedRecipientId });
        const student = await Student.findOne({ user: userId });

        if (tutor && student) {
          tutorId = tutor._id;
          studentId = student._id;
        }
      }
    }

    // Create new conversation
    const newConversation = new Conversation({
      participants: [userId, recipientId],
      unreadCount: { [userId]: 0, [recipientId]: 0 },
      tutor: tutorId,
      student: studentId,
      type: conversationType,
    });

    try {
      await newConversation.save();
    } catch (saveErr) {
      // Handle duplicate key error which can occur if unique index is hit concurrently
      if (saveErr && saveErr.code === 11000) {
        const found = await Conversation.findOne({
          participants: { $all: [userId, resolvedRecipientId] },
        });
        if (found) {
          return res.status(200).json({
            success: true,
            message: "Conversation already exists",
            conversationId: found._id,
          });
        }
      }
      // Re-throw if we couldn't handle it
      throw saveErr;
    }
    res.status(201).json({
      success: true,
      conversationId: newConversation._id,
      message: "Conversation created successfully",
    });
  } catch (error) {
    console.error(
      "Error creating conversation:",
      error && error.stack ? error.stack : error
    );
    res.status(500).json({
      success: false,
      message: "Failed to create conversation",
      error: error.message || String(error),
    });
  }
};

// Get messages for a conversation
exports.getMessagesByConversation = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    // Validate conversation ID
    if (!mongoose.Types.ObjectId.isValid(conversationId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid conversation ID format",
      });
    }

    // Check if conversation exists and if the user is a participant
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: "Conversation not found",
      });
    }

    if (!conversation.participants.includes(userId)) {
      return res.status(403).json({
        success: false,
        message: "You don't have permission to access this conversation",
      });
    }

    // Get messages with pagination
    const messages = await Message.find({ conversation: conversationId })
      .sort({ createdAt: 1 })
      .skip(skip)
      .limit(limit)
      .populate({
        path: "sender",
        select: "firstName lastName profileImage role",
      });

    // Automatically mark messages as read
    await Message.updateMany(
      {
        conversation: conversationId,
        sender: { $ne: userId },
        read: false,
      },
      { $set: { read: true } }
    );

    // Reset unread count for this conversation
    if (conversation.unreadCount.get(userId.toString()) > 0) {
      conversation.unreadCount.set(userId.toString(), 0);
      await conversation.save();
    }

    // Format messages for the client with consistent sender data
    const formattedMessages = await Promise.all(
      messages.map(async (message) => ({
        id: message._id,
        content: decrypt(message.content),
        sender: await formatUserData(message.sender),
        isSentByCurrentUser: message.sender._id.toString() === userId,
        createdAt: message.createdAt,
        attachments: message.attachments || [],
        read: message.read,
      }))
    );

    res.status(200).json({
      success: true,
      messages: formattedMessages,
      totalCount: await Message.countDocuments({
        conversation: conversationId,
      }),
    });
  } catch (error) {
    console.error("Error getting messages:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve messages",
      error: error.message,
    });
  }
};

// Send a message
exports.sendMessage = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { content } = req.body;
    const senderId = req.user.id;

    // Validate conversation ID
    if (!mongoose.Types.ObjectId.isValid(conversationId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid conversation ID format",
      });
    }

    // Check if conversation exists and if the user is a participant
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: "Conversation not found",
      });
    }

    if (!conversation.participants.includes(senderId)) {
      return res.status(403).json({
        success: false,
        message:
          "You don't have permission to send messages in this conversation",
      });
    }

    // Determine receiver (the other participant) and create the message
    const receiverId = conversation.participants.find(
      (p) => p.toString() !== senderId.toString()
    );

    // Create and save the new message (receiver is required by schema)
    const newMessage = new Message({
      conversation: conversationId,
      sender: senderId,
      receiver: receiverId,
      content: encrypt(content),
      read: false,
    });

    await newMessage.save();

    // Update the conversation's last message and time
    conversation.lastMessage = encrypt(content);
    conversation.lastMessageTime = new Date();

    // Increment unread count for other participants
    conversation.participants.forEach((participantId) => {
      if (participantId.toString() !== senderId) {
        const currentCount =
          conversation.unreadCount.get(participantId.toString()) || 0;
        conversation.unreadCount.set(
          participantId.toString(),
          currentCount + 1
        );
      }
    });

    await conversation.save();

    // Get the sender information for WebSocket notification
    const sender = await User.findById(senderId).select(
      "firstName lastName profileImage role"
    );

    // Format the message for WebSocket notification with consistent sender data
    const formattedMessage = {
      id: newMessage._id,
      content: decrypt(newMessage.content), // Decrypt for the current user/websocket
      sender: await formatUserData(sender),
      createdAt: newMessage.createdAt,
      read: newMessage.read,
    };

    // Broadcast the message using the chat service (it will use the websocket service if configured)
    try {
      chatService.addMessage(conversationId, formattedMessage);
    } catch (err) {
      console.error("Error broadcasting message via chatService:", err);
    }

    res.status(201).json({
      success: true,
      message: "Message sent successfully",
      messageId: newMessage._id,
    });
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({
      success: false,
      message: "Failed to send message",
      error: error.message,
    });
  }
};

// Mark all messages in a conversation as read
exports.markMessagesAsRead = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user.id;

    // Validate conversation ID
    if (!mongoose.Types.ObjectId.isValid(conversationId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid conversation ID format",
      });
    }

    // Check if conversation exists and if the user is a participant
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: "Conversation not found",
      });
    }

    if (!conversation.participants.includes(userId)) {
      return res.status(403).json({
        success: false,
        message: "You don't have permission to access this conversation",
      });
    }

    // Mark all messages from others as read
    await Message.updateMany(
      {
        conversation: conversationId,
        sender: { $ne: userId },
        read: false,
      },
      { $set: { read: true } }
    );

    // Reset unread count for this user
    conversation.unreadCount.set(userId.toString(), 0);
    await conversation.save();

    res.status(200).json({
      success: true,
      message: "Messages marked as read",
    });
  } catch (error) {
    console.error("Error marking messages as read:", error);
    res.status(500).json({
      success: false,
      message: "Failed to mark messages as read",
      error: error.message,
    });
  }
};

// Clear all messages in a conversation
exports.clearConversation = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user.id;

    // Validate conversation ID
    if (!mongoose.Types.ObjectId.isValid(conversationId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid conversation ID format",
      });
    }

    // Check if conversation exists and if the user is a participant
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: "Conversation not found",
      });
    }

    if (!conversation.participants.includes(userId)) {
      return res.status(403).json({
        success: false,
        message: "You don't have permission to clear this conversation",
      });
    }

    // Delete all messages in the conversation
    await Message.deleteMany({ conversation: conversationId });

    // Update conversation
    conversation.lastMessage = "";
    conversation.lastMessageTime = new Date();
    conversation.participants.forEach((participantId) => {
      conversation.unreadCount.set(participantId.toString(), 0);
    });
    await conversation.save();

    // Notify other participants via chatService (which uses websocketService)
    try {
      chatService.addMessage(conversationId, {
        id: `system-clear-${Date.now()}`,
        content: "__conversation_cleared__",
        sender: { id: userId, name: "System" },
        createdAt: new Date(),
      });
    } catch (err) {
      console.error(
        "Error notifying conversation cleared via chatService:",
        err
      );
    }

    res.status(200).json({
      success: true,
      message: "Conversation cleared successfully",
    });
  } catch (error) {
    console.error("Error clearing conversation:", error);
    res.status(500).json({
      success: false,
      message: "Failed to clear conversation",
      error: error.message,
    });
  }
};

// Get message statistics for students
const getStudentMessageStats = async (req, res) => {
  try {
    const userId = req.user.id;

    // Find conversations where the user is a participant
    const conversations = await Conversation.find({
      participants: userId,
    });

    // Count unread messages across all conversations
    let unreadCount = 0;
    for (const conv of conversations) {
      unreadCount += conv.unreadCount.get(userId.toString()) || 0;
    }

    res.status(200).json({
      success: true,
      unreadCount,
      totalConversations: conversations.length,
      timestamp: new Date(),
    });
  } catch (error) {
    console.error("Error fetching student message stats:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch message statistics",
      error: error.message,
    });
  }
};

// Get message statistics for tutors
const getTutorMessageStats = async (req, res) => {
  try {
    const userId = req.user.id;

    // Find conversations where the user is a participant
    const conversations = await Conversation.find({
      participants: userId,
    });

    // Count unread messages across all conversations
    let unreadCount = 0;
    for (const conv of conversations) {
      unreadCount += conv.unreadCount.get(userId.toString()) || 0;
    }

    res.status(200).json({
      success: true,
      unreadCount,
      totalConversations: conversations.length,
      timestamp: new Date(),
    });
  } catch (error) {
    console.error("Error fetching tutor message stats:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch message statistics",
      error: error.message,
    });
  }
};

// Export the new functions
exports.getStudentMessageStats = getStudentMessageStats;
exports.getTutorMessageStats = getTutorMessageStats;
