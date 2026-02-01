const jwt = require("jsonwebtoken");
const User = require("../models/user.model");
const Message = require("../models/message.model");
const Conversation = require("../models/conversation.model");
const mongoose = require("mongoose");
const { encrypt, decrypt } = require("../utils/encryption");

// Store active connections with userIds
const activeConnections = new Map();

function setupWebSocket(io) {
  // Middleware for authentication
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;

      if (!token) {
        return next(new Error("Authentication error: Token not provided"));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);

      if (!user) {
        return next(new Error("Authentication error: User not found"));
      }

      if (!user.isActive) {
        return next(new Error("Authentication error: Account inactive"));
      }

      // Attach user to socket
      socket.userId = decoded.id;
      socket.userRole = user.role;
      socket.userName = `${user.firstName} ${user.lastName}`;

      next();
    } catch (error) {
      return next(new Error("Authentication error: Invalid token"));
    }
  });

  io.on("connection", (socket) => {
    console.log(`User ${socket.userId} connected`);

    // Add to active connections
    activeConnections.set(socket.userId, socket.id);

    // Join a room for user-specific messages
    socket.join(`user:${socket.userId}`);

    // Dashboard-specific events
    socket.on("subscribe_dashboard", (data) => {
      const { role } = data;
      socket.join(`dashboard:${role}`);
      socket.join(`dashboard:user:${socket.userId}`);
      console.log(`User ${socket.userId} subscribed to ${role} dashboard`);
    });

    socket.on("unsubscribe_dashboard", () => {
      socket.leave(`dashboard:${socket.userRole}`);
      socket.leave(`dashboard:user:${socket.userId}`);
      console.log(`User ${socket.userId} unsubscribed from dashboard`);
    });

    socket.on("request_data_refresh", async (data) => {
      const { dataType } = data;
      console.log(`User ${socket.userId} requested ${dataType} refresh`);

      try {
        // Emit refresh request to trigger data update
        socket.emit("data_refresh_requested", {
          dataType,
          timestamp: new Date(),
        });
      } catch (error) {
        console.error("Error handling data refresh request:", error);
      }
    });

    // Handle joining a conversation
    socket.on("join-conversation", (conversationId) => {
      socket.join(`conversation:${conversationId}`);
      console.log(
        `User ${socket.userId} joined conversation: ${conversationId}`
      );
    });

    // Handle leaving a conversation
    socket.on("leave-conversation", (conversationId) => {
      socket.leave(`conversation:${conversationId}`);
      console.log(`User ${socket.userId} left conversation: ${conversationId}`);
    });

    // Handle sending a message
    socket.on("send_message", async (messageData) => {
      console.log(`Message from ${socket.userId}:`, messageData);

      try {
        // Basic validation
        if (!messageData.content || !messageData.conversationId) {
          console.error("Invalid message data:", messageData);
          socket.emit("message_error", {
            error: "Missing content or conversation ID",
            messageId: messageData.messageId,
          });
          return;
        }

        // Validate conversation ID
        if (!mongoose.Types.ObjectId.isValid(messageData.conversationId)) {
          console.error(
            "Invalid conversation ID format:",
            messageData.conversationId
          );
          socket.emit("message_error", {
            error: "Invalid conversation ID",
            messageId: messageData.messageId,
          });
          return;
        }

        // Check if conversation exists and if the user is a participant
        const conversation = await Conversation.findById(
          messageData.conversationId
        );
        if (!conversation) {
          console.error("Conversation not found:", messageData.conversationId);
          socket.emit("message_error", {
            error: "Conversation not found",
            messageId: messageData.messageId,
          });
          return;
        }

        // Check if user is participant
        const isParticipant = conversation.participants.some(
          (participantId) => participantId.toString() === socket.userId
        );

        if (!isParticipant) {
          console.error(
            "User not authorized for conversation:",
            messageData.conversationId
          );
          socket.emit("message_error", {
            error: "Not authorized to send messages in this conversation",
            messageId: messageData.messageId,
          });
          return;
        }

        // Create and save the message (ENCRYPTED)
        const message = new Message({
          sender: socket.userId,
          conversation: messageData.conversationId,
          content: encrypt(messageData.content),
          timestamp: new Date(),
        });

        await message.save();

        // Populate sender information
        await message.populate("sender", "firstName lastName profileImage");

        // Update conversation's last message (ENCRYPTED)
        conversation.lastMessage = encrypt(messageData.content);
        conversation.lastActivity = new Date();
        await conversation.save();

        const messageResponse = {
          _id: message._id,
          content: messageData.content, // Return DECRYPTED content to client
          sender: message.sender,
          timestamp: message.timestamp,
          conversationId: messageData.conversationId,
          messageId: messageData.messageId, // Include original messageId for client tracking
        };

        // Send success response to sender (using frontend-expected event name: message_delivered)
        socket.emit("message_delivered", {
            tempId: messageData.messageId,
            message: messageResponse
        });

        // Broadcast to all users in the conversation (using frontend-expected event name: new_message)
        socket
          .to(`conversation:${messageData.conversationId}`)
          .emit("new_message", messageResponse);

        console.log(
          `Message saved and broadcast for conversation ${messageData.conversationId}`
        );
      } catch (error) {
        console.error("Error handling message:", error);
        socket.emit("message_error", {
          error: "Failed to send message",
          messageId: messageData.messageId,
        });
      }
    });

    // Handle disconnection
    socket.on("disconnect", () => {
      console.log(`User ${socket.userId} disconnected`);
      activeConnections.delete(socket.userId);
    });
  });

  // Return utility functions
  return {
    // Function to send message to a specific conversation
    sendToConversation: (
      conversationId,
      eventName,
      data,
      excludeUserId = null
    ) => {
      if (excludeUserId) {
        // Send to everyone in the conversation except the specified user
        io.to(`conversation:${conversationId}`)
          .except(excludeUserId)
          .emit(eventName, data);
      } else {
        // Send to everyone in the conversation
        io.to(`conversation:${conversationId}`).emit(eventName, data);
      }

      // Also send directly to participants by extracting participant IDs
      // This is a fallback in case they haven't joined the room yet
      if (data && data.sender) {
        // Find other participants and send to them directly
        if (data.recipientId) {
          io.to(`user:${data.recipientId}`).emit(eventName, data);
        }

        // For demo purposes, broadcast to all connections
        // In a real app, you would only send to specific participants
        io.emit("message-update", {
          conversationId: conversationId,
          message: data,
        });
      }
    },

    // Function to check if a user is online
    isUserOnline: (userId) => {
      return activeConnections.has(userId.toString());
    },

    // Get all active connections
    getActiveConnections: () => {
      return activeConnections;
    },

    // Dashboard notification functions
    notifyDashboardUpdate: (userId, data) => {
      io.to(`dashboard:user:${userId}`).emit("dashboard_update", data);
    },

    notifySessionUpdate: (userIds, sessionData) => {
      userIds.forEach((userId) => {
        io.to(`dashboard:user:${userId}`).emit("session_update", sessionData);
      });
    },

    notifySessionRequestUpdate: (tutorId, requestData) => {
      io.to(`dashboard:user:${tutorId}`).emit(
        "session_request_update",
        requestData
      );
    },

    notifyMessageStatsUpdate: (userId, statsData) => {
      io.to(`dashboard:user:${userId}`).emit("message_stats_update", statsData);
    },

    notifyVerificationStatusUpdate: (tutorId, statusData) => {
      io.to(`dashboard:user:${tutorId}`).emit(
        "verification_status_update",
        statusData
      );
    },

    // Broadcast to all users of a specific role
    broadcastToRole: (role, event, data) => {
      io.to(`dashboard:${role}`).emit(event, data);
    },
  };
}

module.exports = setupWebSocket;
