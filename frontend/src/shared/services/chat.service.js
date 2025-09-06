import api from "./api.service";
import io from "socket.io-client";

class ChatService {
  constructor() {
    this.socket = null;
    this.baseURL = "http://localhost:5000"; // Should match your backend URL
    this.listeners = {};
    this.isConnected = false;
  }

  // Initialize WebSocket connection
  initSocket(token) {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }

    if (!token) {
      console.error("No token provided for socket connection");
      return null;
    }

    try {
      this.socket = io(this.baseURL, {
        auth: { token },
        transports: ["websocket"],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        timeout: 10000,
      });

      this.socket.on("connect", () => {
        console.log("WebSocket connected with auth token");
        this.isConnected = true;
      });

      this.socket.on("disconnect", () => {
        console.log("WebSocket disconnected");
        this.isConnected = false;
      });

      this.socket.on("connect_error", (error) => {
        console.error("Connection error:", error);
        this.isConnected = false;
      });

      this.socket.on("error", (error) => {
        console.error("Socket error:", error);
        // Handle authentication errors by forcing a reconnect
        if (error === "Authentication error") {
          this.disconnect();
        }
      });

      return this.socket;
    } catch (err) {
      console.error("Error initializing socket:", err);
      return null;
    }
  }

  // Disconnect WebSocket
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.isConnected = false;
  }

  // Add event listener
  on(event, callback) {
    if (this.socket) {
      this.socket.on(event, callback);
      // Store listener for potential cleanup
      if (!this.listeners[event]) {
        this.listeners[event] = [];
      }
      this.listeners[event].push(callback);
    }
  }

  // Remove event listener
  off(event, callback) {
    if (this.socket) {
      this.socket.off(event, callback);
      // Remove from stored listeners
      if (this.listeners[event]) {
        this.listeners[event] = this.listeners[event].filter(
          (cb) => cb !== callback
        );
      }
    }
  }

  // Join a conversation room
  joinConversation(conversationId) {
    if (this.socket && this.isConnected) {
      this.socket.emit("join-conversation", conversationId);
    }
  }

  // Leave a conversation room
  leaveConversation(conversationId) {
    if (this.socket && this.isConnected) {
      this.socket.emit("leave-conversation", conversationId);
    }
  }

  // API Methods for chat

  // Get all conversations for current user
  async getConversations() {
    try {
      const response = await api.get("/chat/conversations");

      // Normalize the conversation data format
      if (
        response.data &&
        response.data.success &&
        response.data.conversations
      ) {
        response.data.conversations = response.data.conversations.map(
          (conv) => {
            return {
              ...conv,
              otherUser: this.normalizeUserObject(conv.otherUser),
              updatedAt:
                conv.lastMessageTime ||
                conv.createdAt ||
                new Date().toISOString(),
            };
          }
        );
      }

      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Get a specific conversation by ID
  async getConversationById(conversationId) {
    try {
      const response = await api.get(`/chat/conversations/${conversationId}`);

      // Normalize the conversation data format
      if (
        response.data &&
        response.data.success &&
        response.data.conversation
      ) {
        response.data.conversation = {
          ...response.data.conversation,
          otherUser: this.normalizeUserObject(
            response.data.conversation.otherUser
          ),
          updatedAt:
            response.data.conversation.lastMessageTime ||
            response.data.conversation.createdAt ||
            new Date().toISOString(),
        };
      }

      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Helper to normalize user object format
  normalizeUserObject(user) {
    if (!user) {
      return {
        id: "unknown",
        name: "Unknown User",
        profileImage: "",
        email: "",
        role: "unknown",
      };
    }

    return {
      id: user.id || user._id || "unknown",
      name:
        user.name ||
        `${user.firstName || ""} ${user.lastName || ""}`.trim() ||
        "Unknown User",
      profileImage: user.profileImage || "",
      email: user.email || "",
      role: user.role || "unknown",
    };
  }

  // Create a new conversation
  async createConversation(recipientId) {
    try {
      console.log("Creating conversation with recipient:", recipientId);
      if (!recipientId) {
        console.warn("No recipient ID provided, using default");
      }

      const response = await api.post("/chat/conversations", {
        recipientId: recipientId || "default-tutor",
      });
      return response.data;
    } catch (error) {
      console.error("Error creating conversation:", error);
      throw this.handleError(error);
    }
  }

  // Start a new conversation with initial message
  async startConversation(recipientId, initialMessage) {
    try {
      // First create the conversation
      const createResponse = await this.createConversation(recipientId);

      if (!createResponse.success) {
        return createResponse;
      }

      const conversationId = createResponse.conversationId;

      // Then send the initial message
      if (initialMessage) {
        const messageResponse = await this.sendMessage(
          conversationId,
          initialMessage
        );

        if (!messageResponse.success) {
          return messageResponse;
        }
      }

      return {
        success: true,
        conversation: {
          _id: conversationId,
          id: conversationId,
        },
        message: "Conversation started successfully",
      };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Get messages for a conversation
  async getMessages(conversationId, page = 1, limit = 50) {
    try {
      const response = await api.get(
        `/chat/conversations/${conversationId}/messages`,
        {
          params: { page, limit },
        }
      );

      // Normalize message format
      if (response.data && response.data.success && response.data.messages) {
        response.data.messages = response.data.messages.map((msg) => {
          return {
            ...msg,
            _id: msg.id || msg._id,
            id: msg.id || msg._id,
            sender:
              typeof msg.sender === "object"
                ? this.normalizeUserObject(msg.sender)
                : { id: msg.sender },
          };
        });
      }

      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Send a message
  async sendMessage(conversationId, content) {
    try {
      const response = await api.post(
        `/chat/conversations/${conversationId}/messages`,
        {
          content,
        }
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Mark all messages in a conversation as read
  async markAsRead(conversationId) {
    try {
      const response = await api.put(
        `/chat/conversations/${conversationId}/read`
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Clear all messages in a conversation
  async clearConversation(conversationId) {
    try {
      const response = await api.delete(
        `/chat/conversations/${conversationId}/messages`
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Handle API errors
  handleError(error) {
    console.error("API Error:", error);

    // Return a standardized error object
    return {
      success: false,
      message:
        error.response?.data?.message ||
        error.message ||
        "An unexpected error occurred",
      error: error,
    };
  }

  // Get message statistics for students
  async getStudentMessageStats() {
    try {
      const response = await api.get("/chat/student/stats");
      return response.data;
    } catch (error) {
      console.error("Error fetching student message stats:", error);
      return { unreadCount: 0, totalConversations: 0 };
    }
  }

  // Get message statistics for tutors
  async getTutorMessageStats() {
    try {
      const response = await api.get("/chat/tutor/stats");
      return response.data;
    } catch (error) {
      console.error("Error fetching tutor message stats:", error);
      return { unreadCount: 0, totalConversations: 0 };
    }
  }
}

export default new ChatService();
