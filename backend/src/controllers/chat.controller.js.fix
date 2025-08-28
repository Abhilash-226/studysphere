const Conversation = require("../models/conversation.model");
const Message = require("../models/message.model");
const User = require("../models/user.model");
const Tutor = require("../models/tutor.model");
const Student = require("../models/student.model");
const mongoose = require("mongoose");

// Helper function to format user data consistently
const formatUserData = (user) => {
  if (!user) return { name: "Unknown User", role: "unknown" };

  return {
    id: user._id,
    name: `${user.firstName} ${user.lastName}`,
    profileImage: user.profileImage || "",
    email: user.email,
    role: user.role,
  };
};

// Get all conversations for the current user
exports.getConversations = async (req, res) => {
  try {
    const userId = req.user.id;

    const conversations = await Conversation.find({
      participants: userId,
    })
      .populate({
        path: "participants",
        select: "firstName lastName profileImage email role",
        match: { _id: { $ne: userId } }, // Exclude current user from populated results
      })
      .populate({
        path: "tutor",
        select: "specialization qualification",
      })
      .sort({ lastMessageTime: -1 }); // Sort by most recent message

    // Format conversations for client with consistent user data
    const formattedConversations = conversations.map((conv) => {
      const otherParticipant = conv.participants[0]; // Due to match in populate, this will be the other user

      return {
        id: conv._id,
        otherUser: otherParticipant ? formatUserData(otherParticipant) : { name: "Unknown User", role: "unknown" },
        lastMessage: conv.lastMessage || "",
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
    });

    res.status(200).json({
      success: true,
      conversations: formattedConversations,
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
      otherUser: formatUserData(otherParticipant),
      lastMessage: conversation.lastMessage || "",
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

    // Validate recipient ID
    if (!mongoose.Types.ObjectId.isValid(recipientId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid recipient ID format",
      });
    }

    // Check if recipient exists
    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return res.status(404).json({
        success: false,
        message: "Recipient not found",
      });
    }

    // Check if conversation already exists between these users
    const existingConversation = await Conversation.findOne({
      participants: { $all: [userId, recipientId] },
    });

    if (existingConversation) {
      return res.status(200).json({
        success: true,
        message: "Conversation already exists",
        conversationId: existingConversation._id,
      });
    }

    // Determine the type of conversation based on user roles
    const currentUser = await User.findById(userId);
    let conversationType = "inquiry";
    let tutorId = null;
    let studentId = null;

    // If one user is a tutor and the other is a student
    if (currentUser.role === "tutor" && recipient.role === "student") {
      const tutor = await Tutor.findOne({ user: userId });
      const student = await Student.findOne({ user: recipientId });

      if (tutor && student) {
        tutorId = tutor._id;
        studentId = student._id;
      }
    } else if (currentUser.role === "student" && recipient.role === "tutor") {
      const tutor = await Tutor.findOne({ user: recipientId });
      const student = await Student.findOne({ user: userId });

      if (tutor && student) {
        tutorId = tutor._id;
        studentId = student._id;
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

    await newConversation.save();

    res.status(201).json({
      success: true,
      conversationId: newConversation._id,
      message: "Conversation created successfully",
    });
  } catch (error) {
    console.error("Error creating conversation:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create conversation",
      error: error.message,
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
      .sort({ createdAt: -1 })
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
    const formattedMessages = messages.map((message) => ({
      id: message._id,
      content: message.content,
      sender: formatUserData(message.sender),
      isSentByCurrentUser: message.sender._id.toString() === userId,
      createdAt: message.createdAt,
      attachments: message.attachments || [],
      read: message.read,
    }));

    res.status(200).json({
      success: true,
      messages: formattedMessages,
      totalCount: await Message.countDocuments({ conversation: conversationId }),
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
        message: "You don't have permission to send messages in this conversation",
      });
    }

    // Create and save the new message
    const newMessage = new Message({
      conversation: conversationId,
      sender: senderId,
      content,
      read: false,
    });

    await newMessage.save();

    // Update the conversation's last message and time
    conversation.lastMessage = content;
    conversation.lastMessageTime = new Date();

    // Increment unread count for other participants
    conversation.participants.forEach((participantId) => {
      if (participantId.toString() !== senderId) {
        const currentCount =
          conversation.unreadCount.get(participantId.toString()) || 0;
        conversation.unreadCount.set(participantId.toString(), currentCount + 1);
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
      content: newMessage.content,
      sender: formatUserData(sender),
      createdAt: newMessage.createdAt,
      read: newMessage.read,
    };

    // Emit the message to all participants via WebSocket
    req.io.to(conversationId).emit("new-message", {
      conversationId,
      message: formattedMessage,
    });

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

    // Notify other participants via WebSocket
    req.io.to(conversationId).emit("conversation-cleared", {
      conversationId,
      clearedBy: userId,
    });

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
