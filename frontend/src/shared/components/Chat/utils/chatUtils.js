// Chat utility functions for improved conversation management

/**
 * Normalize conversation data for consistent display
 * @param {Object} conversation - Raw conversation data
 * @param {string} currentUserId - Current user's ID
 * @returns {Object} Normalized conversation data
 */
export const normalizeConversation = (conversation, currentUserId) => {
  if (!conversation) return null;

  // Ensure we have proper IDs
  const id = conversation._id || conversation.id;

  // Get other user information
  const otherUser =
    conversation.otherUser ||
    getOtherUserFromParticipants(conversation.participants, currentUserId);

  const normalized = {
    ...conversation,
    id,
    _id: id,
    otherUser: {
      ...otherUser,
      name:
        otherUser?.name ||
        `${otherUser?.firstName || ""} ${otherUser?.lastName || ""}`.trim() ||
        "Unknown User",
      id: otherUser?._id || otherUser?.id,
      _id: otherUser?._id || otherUser?.id,
    },
    lastMessage:
      typeof conversation.lastMessage === "object"
        ? conversation.lastMessage.content
        : conversation.lastMessage,
    unreadCount: conversation.unreadCount || 0,
  };

  return normalized;
};

/**
 * Get the other user from participants array
 * @param {Array} participants - Array of participant objects
 * @param {string} currentUserId - Current user's ID
 * @returns {Object} Other user object
 */
const getOtherUserFromParticipants = (participants, currentUserId) => {
  if (!participants || !Array.isArray(participants)) return null;

  return participants.find(
    (participant) =>
      participant._id !== currentUserId && participant.id !== currentUserId
  );
};

/**
 * Normalize message data for consistent display
 * @param {Object} message - Raw message data
 * @param {string} currentUserId - Current user's ID
 * @returns {Object} Normalized message data
 */
export const normalizeMessage = (message, currentUserId) => {
  if (!message) return null;

  const id = message._id || message.id;
  const senderId =
    message.senderId || message.sender?.id || message.sender?._id;

  return {
    ...message,
    id,
    _id: id,
    senderId,
    isSentByCurrentUser:
      message.isSentByCurrentUser || senderId === currentUserId,
    sender: message.sender
      ? {
          ...message.sender,
          id: message.sender._id || message.sender.id,
          _id: message.sender._id || message.sender.id,
          name:
            message.sender.name ||
            `${message.sender.firstName || ""} ${
              message.sender.lastName || ""
            }`.trim(),
        }
      : null,
  };
};

/**
 * Check if a conversation already exists between two users
 * @param {Array} conversations - Array of existing conversations
 * @param {string} otherUserId - The other user's ID
 * @returns {Object|null} Existing conversation or null
 */
export const findExistingConversation = (conversations, otherUserId) => {
  if (!conversations || !Array.isArray(conversations)) return null;

  return conversations.find(
    (conv) =>
      conv.otherUser?.id === otherUserId ||
      conv.otherUser?._id === otherUserId ||
      (conv.participants &&
        conv.participants.some(
          (p) => p.id === otherUserId || p._id === otherUserId
        ))
  );
};

/**
 * Format conversation time for display
 * @param {string|Date} timestamp - Timestamp to format
 * @returns {string} Formatted time string
 */
export const formatConversationTime = (timestamp) => {
  if (!timestamp) return "";

  const date = new Date(timestamp);
  const now = new Date();
  const diff = now - date;

  // Less than 1 minute
  if (diff < 60000) return "Just now";

  // Less than 1 hour
  if (diff < 3600000) {
    const minutes = Math.floor(diff / 60000);
    return `${minutes}m ago`;
  }

  // Less than 24 hours
  if (diff < 86400000) {
    const hours = Math.floor(diff / 3600000);
    return `${hours}h ago`;
  }

  // Less than 7 days
  if (diff < 604800000) {
    const days = Math.floor(diff / 86400000);
    return `${days}d ago`;
  }

  // Format as date
  return date.toLocaleDateString();
};

/**
 * Sort conversations by last message time
 * @param {Array} conversations - Array of conversations
 * @returns {Array} Sorted conversations
 */
export const sortConversationsByTime = (conversations) => {
  if (!conversations || !Array.isArray(conversations)) return [];

  return [...conversations].sort((a, b) => {
    const timeA = new Date(a.lastMessageTime || a.updatedAt || 0);
    const timeB = new Date(b.lastMessageTime || b.updatedAt || 0);
    return timeB - timeA; // Most recent first
  });
};

/**
 * Get display name for a user
 * @param {Object} user - User object
 * @returns {string} Display name
 */
export const getUserDisplayName = (user) => {
  if (!user) return "Unknown User";

  if (user.name) return user.name;

  const firstName = user.firstName || "";
  const lastName = user.lastName || "";
  const fullName = `${firstName} ${lastName}`.trim();

  if (fullName) return fullName;

  return user.email || user.username || "Unknown User";
};
