const jwt = require("jsonwebtoken");
const User = require("../models/user.model");

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

    // Handle disconnect
    socket.on("disconnect", () => {
      console.log(`User ${socket.userId} disconnected`);
      activeConnections.delete(socket.userId);
    });
  });

  return {
    // Function to send a message to a specific user
    sendToUser: (userId, eventName, data) => {
      io.to(`user:${userId}`).emit(eventName, data);
    },

    // Function to send a message to a conversation
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
  };
}

module.exports = setupWebSocket;
