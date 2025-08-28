import api from "./api.service";

class TutorChatService {
  // Get all conversations for the current tutor
  async getTutorConversations() {
    try {
      const response = await api.get("/tutor-chat/tutor-conversations");
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  // Get tutor message statistics
  async getTutorMessageStats() {
    try {
      const response = await api.get("/tutor-chat/tutor-message-stats");
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  // Get messages for a specific conversation
  async getConversationMessages(conversationId) {
    try {
      if (!conversationId) {
        throw new Error("Conversation ID is required");
      }

      console.log("Getting conversation messages for:", conversationId);
      const response = await api.get(
        `/tutor-chat/conversation/${conversationId}`
      );

      // Log the message response structure for debugging
      if (response && response.data && response.data.messages) {
        console.log("Message count:", response.data.messages.length);
        if (response.data.messages.length > 0) {
          console.log("First message sample:", response.data.messages[0]);
        }
      }

      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  // Send a reply to a conversation as a tutor
  async sendReply(conversationId, content) {
    try {
      if (!conversationId) {
        throw new Error("Conversation ID is required");
      }

      if (!content) {
        throw new Error("Message content is required");
      }

      const response = await api.post(`/tutor-chat/reply/${conversationId}`, {
        content,
      });
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  // Error handling
  handleError(error) {
    console.error("Tutor chat service error:", error);

    // Additional debugging for auth issues
    if (
      error.response &&
      (error.response.status === 401 || error.response.status === 403)
    ) {
      console.error("Authentication/Authorization error. Request details:", {
        url: error.config?.url,
        method: error.config?.method,
        hasAuthHeader: !!error.config?.headers?.Authorization,
      });

      // Log current auth state
      console.log("Current auth state:", {
        hasDirectToken: !!localStorage.getItem("token"),
        hasUserObject: !!localStorage.getItem("user"),
      });
    }

    if (error.response) {
      // The server responded with an error status
      return {
        success: false,
        message: error.response.data.message || "Server error",
        status: error.response.status,
      };
    }

    if (error.request) {
      // The request was made but no response received
      return { success: false, message: "No response from server" };
    }

    // Something else happened while setting up the request
    return {
      success: false,
      message: "Network error or server is unavailable",
    };
  }
}

export default new TutorChatService();
