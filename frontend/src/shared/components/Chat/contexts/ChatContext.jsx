import React, { createContext, useState, useEffect, useCallback } from "react";
import PropTypes from "prop-types";
import io from "socket.io-client";

// Create the chat context
export const ChatContext = createContext();

/**
 * ChatProvider component for managing chat state and socket connections
 *
 * @component
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 * @param {string} props.userId - Current user ID
 * @param {string} props.userRole - User role (student or tutor)
 */
export const ChatProvider = ({ children, userId, userRole }) => {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Initialize socket connection
  useEffect(() => {
    if (!userId) return;

    // Create socket connection
    const newSocket = io(
      process.env.REACT_APP_API_URL || "http://localhost:5000",
      {
        query: {
          userId,
          userRole,
        },
      }
    );

    // Set up event listeners
    newSocket.on("connect", () => {
      console.log("Socket connected");
      setConnected(true);
      setError(null);
    });

    newSocket.on("disconnect", () => {
      console.log("Socket disconnected");
      setConnected(false);
    });

    newSocket.on("error", (err) => {
      console.error("Socket error:", err);
      setError("Connection error. Please try again later.");
    });

    newSocket.on("new_message", (message) => {
      // Add new message to messages if it's for the active conversation
      if (
        activeConversation &&
        message.conversationId === activeConversation.id
      ) {
        setMessages((prev) => [...prev, message]);
      }

      // Update conversation list to show new message
      setConversations((prev) => {
        return prev.map((conv) => {
          if (conv.id === message.conversationId) {
            // Update unread count for non-active conversations
            const isActive =
              activeConversation && activeConversation.id === conv.id;
            return {
              ...conv,
              lastMessage: message,
              updatedAt: message.createdAt,
              unreadCount: isActive ? 0 : (conv.unreadCount || 0) + 1,
            };
          }
          return conv;
        });
      });
    });

    // Save socket instance
    setSocket(newSocket);

    // Clean up on unmount
    return () => {
      if (newSocket) {
        newSocket.disconnect();
      }
    };
  }, [userId, userRole]);

  // Effect to update active conversation when it changes in the list
  useEffect(() => {
    if (activeConversation && conversations.length > 0) {
      const updatedActiveConv = conversations.find(
        (c) => c.id === activeConversation.id
      );
      if (updatedActiveConv) {
        setActiveConversation(updatedActiveConv);
      }
    }
  }, [conversations, activeConversation]);

  // Fetch conversations
  const fetchConversations = useCallback(async () => {
    if (!userId) return;

    setLoading(true);
    try {
      const endpoint =
        userRole === "tutor"
          ? "/api/tutors/chat/conversations"
          : "/api/students/chat/conversations";

      const response = await fetch(endpoint, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) throw new Error("Failed to fetch conversations");

      const data = await response.json();
      setConversations(data);
      setError(null);
    } catch (err) {
      console.error("Error fetching conversations:", err);
      setError("Failed to load conversations. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [userId, userRole]);

  // Fetch messages for a conversation
  const fetchMessages = useCallback(
    async (conversationId) => {
      if (!conversationId) return;

      setLoading(true);
      try {
        const endpoint =
          userRole === "tutor"
            ? `/api/tutors/chat/${conversationId}/messages`
            : `/api/students/chat/${conversationId}/messages`;

        const response = await fetch(endpoint, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        if (!response.ok) throw new Error("Failed to fetch messages");

        const data = await response.json();
        setMessages(data);

        // Mark conversation as read
        if (activeConversation && activeConversation.id === conversationId) {
          setConversations((prev) =>
            prev.map((conv) =>
              conv.id === conversationId ? { ...conv, unreadCount: 0 } : conv
            )
          );
        }

        setError(null);
      } catch (err) {
        console.error("Error fetching messages:", err);
        setError("Failed to load messages. Please try again.");
      } finally {
        setLoading(false);
      }
    },
    [userRole, activeConversation]
  );

  // Send a message
  const sendMessage = useCallback(
    (content, conversationId) => {
      if (!socket || !connected || !content || !conversationId) return;

      const messageData = {
        content,
        conversationId,
        senderId: userId,
        createdAt: new Date().toISOString(),
      };

      socket.emit("send_message", messageData);

      // Optimistically add message to state
      const optimisticMessage = {
        ...messageData,
        id: `temp-${Date.now()}`,
        pending: true,
      };

      setMessages((prev) => [...prev, optimisticMessage]);
    },
    [socket, connected, userId]
  );

  // Set active conversation and fetch its messages
  const setActiveConversationAndFetchMessages = useCallback(
    (conversation) => {
      setActiveConversation(conversation);
      if (conversation) {
        fetchMessages(conversation.id);

        // Mark conversation as read
        setConversations((prev) =>
          prev.map((conv) =>
            conv.id === conversation.id ? { ...conv, unreadCount: 0 } : conv
          )
        );
      }
    },
    [fetchMessages]
  );

  // Context value
  const value = {
    connected,
    loading,
    error,
    conversations,
    activeConversation,
    messages,
    fetchConversations,
    fetchMessages,
    sendMessage,
    setActiveConversation: setActiveConversationAndFetchMessages,
    totalUnreadCount: conversations.reduce(
      (sum, conv) => sum + (conv.unreadCount || 0),
      0
    ),
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

ChatProvider.propTypes = {
  children: PropTypes.node.isRequired,
  userId: PropTypes.string.isRequired,
  userRole: PropTypes.oneOf(["student", "tutor"]).isRequired,
};

export default ChatProvider;
