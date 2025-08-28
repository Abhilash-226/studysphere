import { useContext, useEffect } from "react";
import { ChatContext } from "../contexts/ChatContext";

/**
 * Custom hook for accessing and using the chat context
 *
 * @returns {Object} Chat context value and utility functions
 */
const useChatService = () => {
  const context = useContext(ChatContext);

  if (!context) {
    throw new Error("useChatService must be used within a ChatProvider");
  }

  const { fetchConversations, connected } = context;

  // Fetch conversations when connected
  useEffect(() => {
    if (connected) {
      fetchConversations();
    }
  }, [connected, fetchConversations]);

  return context;
};

export default useChatService;
