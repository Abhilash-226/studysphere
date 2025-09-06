import { useCallback, useEffect } from "react";
import { useChatContext } from "../contexts/ChatContext";
import chatService from "../../../services/chat.service";

/**
 * Custom hook for accessing chat functionality
 * Provides a clean interface to chat operations and state
 *
 * @returns {Object} Chat service methods and state
 */
const useChatService = () => {
  const context = useChatContext();

  const {
    socket,
    connected,
    conversations,
    activeConversation,
    setActiveConversation,
    messages,
    setMessages,
    loading,
    setLoading,
    error,
    setError,
    fetchConversations,
    fetchMessages,
  } = context;

  // Fetch conversations when connected
  useEffect(() => {
    if (connected && fetchConversations) {
      fetchConversations();
    }
  }, [connected, fetchConversations]);

  // Send a message to the current conversation
  const sendMessage = useCallback(
    async (content, conversationId) => {
      if (!content.trim() || !conversationId) return;

      try {
        setLoading(true);
        if (setError) setError(null);

        // Send message via chat service
        const response = await chatService.sendMessage(conversationId, content);

        if (response.success) {
          // Add message to local state (will also be received via socket)
          const newMessage = {
            id: response.message?.id || `temp-${Date.now()}`,
            content: content,
            senderId: response.message?.senderId,
            conversationId: conversationId,
            createdAt: new Date().toISOString(),
            isSentByCurrentUser: true,
          };

          if (setMessages) {
            setMessages((prev) => [...prev, newMessage]);
          }

          // Emit via socket for real-time delivery
          if (socket && connected) {
            socket.emit("send-message", {
              conversationId,
              content,
              messageId: newMessage.id,
            });
          }
        } else {
          if (setError) {
            setError(response.message || "Failed to send message");
          }
        }
      } catch (err) {
        console.error("Error sending message:", err);
        if (setError) {
          setError("Failed to send message. Please try again.");
        }
      } finally {
        if (setLoading) setLoading(false);
      }
    },
    [socket, connected, setMessages, setLoading, setError]
  );

  // Load messages for a specific conversation
  const loadConversationMessages = useCallback(
    async (conversationId) => {
      if (!conversationId) return;

      try {
        if (setLoading) setLoading(true);
        if (setError) setError(null);

        // Use context fetchMessages if available, otherwise use service directly
        if (fetchMessages) {
          await fetchMessages(conversationId);
        } else {
          const response = await chatService.getMessages(conversationId);
          if (response.success && setMessages) {
            setMessages(response.messages || []);
          } else if (setError) {
            setError(response.message || "Failed to load messages");
          }
        }

        // Join the conversation room for real-time updates
        if (socket && connected) {
          socket.emit("join-conversation", conversationId);
        }
      } catch (err) {
        console.error("Error loading messages:", err);
        if (setError) {
          setError("Failed to load messages");
        }
      } finally {
        if (setLoading) setLoading(false);
      }
    },
    [socket, connected, fetchMessages, setMessages, setLoading, setError]
  );

  // Start a new conversation
  const startConversation = useCallback(
    async (recipientId, initialMessage = "") => {
      try {
        if (setLoading) setLoading(true);
        if (setError) setError(null);

        const response = await chatService.startConversation(
          recipientId,
          initialMessage
        );

        if (response.success) {
          // Reload conversations to include the new one
          if (fetchConversations) {
            await fetchConversations();
          }
          return response.conversation;
        } else {
          if (setError) {
            setError(response.message || "Failed to start conversation");
          }
          return null;
        }
      } catch (err) {
        console.error("Error starting conversation:", err);
        if (setError) {
          setError("Failed to start conversation");
        }
        return null;
      } finally {
        if (setLoading) setLoading(false);
      }
    },
    [fetchConversations, setLoading, setError]
  );

  // Mark conversation as read
  const markAsRead = useCallback(
    async (conversationId) => {
      try {
        await chatService.markAsRead(conversationId);

        // Emit socket event
        if (socket && connected) {
          socket.emit("mark-as-read", conversationId);
        }
      } catch (err) {
        console.error("Error marking conversation as read:", err);
      }
    },
    [socket, connected]
  );

  // Clear error
  const clearError = useCallback(() => {
    if (setError) setError(null);
  }, [setError]);

  return {
    // State
    conversations,
    activeConversation,
    messages,
    loading,
    error,
    connected,

    // Actions
    setActiveConversation,
    sendMessage,
    loadConversations: fetchConversations,
    loadConversationMessages,
    startConversation,
    markAsRead,
    clearError,

    // Socket info
    socketConnected: connected,
  };
};

export default useChatService;
