// In-memory message store for demo purposes
const messageStore = {};

// Store for WebSocket service - will be set by server.js
let websocketService = null;

// Methods to access and manipulate the message store
const chatService = {
  messageStore,

  // Set WebSocket service
  setWebSocketService(service) {
    websocketService = service;
  },

  // Add a message to a conversation
  addMessage(conversationId, message) {
    if (!this.messageStore[conversationId]) {
      this.messageStore[conversationId] = [];
    }
    this.messageStore[conversationId].push(message);

    // Broadcast the message to all participants in the conversation
    if (websocketService) {
      websocketService.sendToConversation(
        conversationId,
        "new-message",
        message
      );
    }

    return message;
  },

  // Get all messages in a conversation
  getMessages(conversationId) {
    return this.messageStore[conversationId] || [];
  },

  // Get all conversations
  getAllConversations() {
    return Object.keys(this.messageStore);
  },
};

module.exports = chatService;
