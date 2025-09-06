// Import formatUserData from utils
const formatUserData = require("../utils/formatUserData");

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
        console.log("No other participant found for conversation:", conv._id);
        return null; // Skip conversations without other participants
      }

      const otherUserData = await formatUserData(otherParticipant, conv);

      return {
        id: conv._id,
        otherUser: otherUserData,
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
    })
  );

  // Filter out null conversations
  return formattedConversations.filter((conv) => conv !== null);
};

module.exports = { processConversations };
