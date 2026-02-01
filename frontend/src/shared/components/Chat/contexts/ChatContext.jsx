import React, {
  createContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import PropTypes from "prop-types";
import io from "socket.io-client";
import {
  normalizeConversation,
  normalizeMessage,
  sortConversationsByTime,
} from "../utils/chatUtils";

const ChatContext = createContext();

export const useChatContext = () => {
  const context = React.useContext(ChatContext);
  if (!context) {
    throw new Error("useChatContext must be used within a ChatProvider");
  }
  return context;
};

const ChatProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Use ref to store the latest fetchMessages function
  const fetchMessagesRef = useRef();
  const fetchConversationsRef = useRef();

  // Use ref to track if we've already auto-selected a conversation
  const hasAutoSelected = useRef(false);

  // Get user data from localStorage
  const token = localStorage.getItem("token");
  const userData = localStorage.getItem("user");
  const userId = userData ? JSON.parse(userData).id : null;
  const userRole = userData ? JSON.parse(userData).role : null;

  // Store userId in ref to avoid recreating functions
  const userIdRef = useRef(userId);
  userIdRef.current = userId; // Socket connection
  useEffect(() => {
    if (token && userId) {
      const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
      const newSocket = io(API_URL, {
        auth: {
          token,
          userId,
        },
        transports: ["websocket", "polling"],
      });

      newSocket.on("connect", () => {
        console.log("Connected to server");
        setConnected(true);
      });

      newSocket.on("disconnect", () => {
        console.log("Disconnected from server");
        setConnected(false);
      });

      newSocket.on("new_message", (message) => {
        console.log("Received new message via WebSocket:", message);
        console.log("Message conversation ID:", message.conversationId);

        // Normalize the message to ensure it has the correct structure (senderId, etc.)
        const normalizedMsg = normalizeMessage(message, userIdRef.current);

        setMessages((prev) => {
          // Check if message already exists (to avoid duplicates)
          if (prev.some((m) => m._id === normalizedMsg._id)) {
            return prev;
          }

          console.log(
            "Adding message to messages array, current length:",
            prev.length,
          );
          const updatedMessages = [...prev, normalizedMsg];
          // Sort messages to ensure proper chronological order
          return updatedMessages.sort(
            (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
          );
        });

        // Update conversation last message
        setConversations((prev) =>
          prev.map((conv) => {
            return conv.id === message.conversationId ||
              conv._id === message.conversationId
              ? {
                  ...conv,
                  lastMessage: message.content, // Use content string for consistency
                  unreadCount: conv.unreadCount + 1,
                }
              : conv;
          }),
        );
      });

      newSocket.on("message_delivered", (data) => {
        console.log("Message delivered:", data);
        
        // Normalize the confirmed message
        const normalizedConfirmedMsg = normalizeMessage(
          data.message,
          userIdRef.current
        );

        setMessages((prev) => {
          const updatedMessages = prev.map((msg) =>
            msg.id === data.tempId
              ? { ...normalizedConfirmedMsg, pending: false }
              : msg
          );
          // Sort messages to ensure proper chronological order
          return updatedMessages.sort(
            (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
          );
        });
      });

      newSocket.on("message_error", (data) => {
        console.error("Message error:", data);
        // Remove the failed optimistic message
        setMessages((prev) => prev.filter((msg) => msg.id !== data.messageId));
        setError(data.error || "Failed to send message");
      });

      setSocket(newSocket);

      return () => {
        newSocket.disconnect();
      };
    }
  }, [token, userId]);

  // Fetch conversations
  const fetchConversations = useCallback(async () => {
    if (!userIdRef.current) {
      return;
    }

    setLoading(true);
    try {
      const API_URL =
        import.meta.env.VITE_API_URL || "http://localhost:5000/api";
      const endpoint = `${API_URL}/chat/conversations`;

      const response = await fetch(endpoint, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) throw new Error("Failed to fetch conversations");

      const data = await response.json();

      // Extract conversations array from the response
      const conversationsArray = data.conversations || data || [];

      // Normalize and sort conversations using ref for userId
      const normalizedConversations = conversationsArray
        .map((conv) => normalizeConversation(conv, userIdRef.current))
        .filter((conv) => conv !== null);

      const sortedConversations = sortConversationsByTime(
        normalizedConversations,
      );

      setConversations(sortedConversations);

      // Reset auto-selection flag when conversations are refreshed
      if (sortedConversations.length === 0) {
        hasAutoSelected.current = false;
      }

      setError(null);
    } catch (err) {
      console.error("Error fetching conversations:", err);
      setError("Failed to load conversations. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []); // Remove userId dependency, use ref instead

  // Store the latest fetchConversations in ref
  fetchConversationsRef.current = fetchConversations;
  const fetchMessages = useCallback(
    async (conversationId) => {
      if (!conversationId) return;

      setLoading(true);
      try {
        const API_URL =
          import.meta.env.VITE_API_URL || "http://localhost:5000/api";
        const endpoint = `${API_URL}/chat/conversations/${conversationId}/messages`;

        const response = await fetch(endpoint, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        if (!response.ok) throw new Error("Failed to fetch messages");

        const data = await response.json();
        // Extract messages array from the response
        const messagesArray = data.messages || data || [];

        // Normalize messages using ref to get current userId
        const normalizedMessages = messagesArray
          .map((msg) => normalizeMessage(msg, userIdRef.current))
          .filter((msg) => msg !== null)
          .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)); // Ensure chronological order

        setMessages(normalizedMessages);

        // Join the conversation room for real-time updates
        if (socket && connected) {
          socket.emit("join-conversation", conversationId);
          console.log("Joined conversation room:", conversationId);
        }

        // TODO: Mark conversation as read without triggering re-renders
        // For now, commenting out to prevent infinite loops
        // setConversations((prev) =>
        //   prev.map((conv) =>
        //     conv._id === conversationId ? { ...conv, unreadCount: 0 } : conv
        //   )
        // );

        setError(null);
      } catch (err) {
        console.error("Error fetching messages:", err);
        setError("Failed to load messages. Please try again.");
      } finally {
        setLoading(false);
      }
    },
    [socket, connected], // Add socket dependencies for join-conversation
  );

  // Store the latest fetchMessages in ref
  fetchMessagesRef.current = fetchMessages;

  // Set active conversation and fetch messages
  const setActiveConversationAndFetch = useCallback(
    (conversation) => {
      setActiveConversation(conversation);
      if (conversation && fetchMessagesRef.current) {
        // Use ref to avoid dependency chain
        fetchMessagesRef.current(conversation._id);
      } else {
        setMessages([]);
      }
    },
    [], // No dependencies to prevent recreating
  );

  // Store the latest setActiveConversationAndFetch in ref for stable access
  const setActiveConversationAndFetchRef = useRef();
  setActiveConversationAndFetchRef.current = setActiveConversationAndFetch;

  // Debug: Monitor activeConversation changes (only log once)
  const lastLoggedConversation = useRef(null);
  useEffect(() => {
    if (
      activeConversation?._id &&
      activeConversation._id !== lastLoggedConversation.current
    ) {
      console.log("Active conversation set:", activeConversation._id);
      lastLoggedConversation.current = activeConversation._id;
    }
  }, [activeConversation]);

  // Auto-select first conversation if none is active
  const conversationsLength = conversations.length;
  const hasConversations = conversationsLength > 0;

  useEffect(() => {
    // Only auto-select if we have conversations, no active conversation, and haven't auto-selected yet
    if (hasConversations && !activeConversation && !hasAutoSelected.current) {
      console.log(
        "Auto-selecting first conversation with ID:",
        conversations[0]?._id,
      );
      hasAutoSelected.current = true;
      // Use ref to avoid dependency issues
      if (setActiveConversationAndFetchRef.current) {
        setActiveConversationAndFetchRef.current(conversations[0]);
      }
    }
  }, [hasConversations, activeConversation]); // Depend on boolean values, not the array

  // Fetch conversations on mount and when user changes
  useEffect(() => {
    if (userId && token) {
      // Call directly to avoid dependency issues
      (async () => {
        if (!userId) return;

        setLoading(true);
        try {
          const API_URL =
            import.meta.env.VITE_API_URL || "http://localhost:5000/api";
          const endpoint = `${API_URL}/chat/conversations`;

          const response = await fetch(endpoint, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          });

          if (!response.ok) throw new Error("Failed to fetch conversations");

          const data = await response.json();

          // Extract conversations array from the response
          const conversationsArray = data.conversations || data || [];

          // Normalize and sort conversations
          const normalizedConversations = conversationsArray
            .map((conv) => normalizeConversation(conv, userId))
            .filter((conv) => conv !== null);

          const sortedConversations = sortConversationsByTime(
            normalizedConversations,
          );

          setConversations(sortedConversations);

          // Reset auto-selection flag when conversations are refreshed
          if (sortedConversations.length === 0) {
            hasAutoSelected.current = false;
          }

          setError(null);
        } catch (err) {
          console.error("Error fetching conversations:", err);
          setError("Failed to load conversations. Please try again.");
        } finally {
          setLoading(false);
        }
      })();
    }
  }, [userId, token]); // Direct implementation to avoid dependency cycles

  // Send a message
  const sendMessage = useCallback(
    (content, conversationId) => {
      if (!socket || !connected || !content || !conversationId) {
        console.log("SendMessage failed - missing requirements:", {
          hasSocket: !!socket,
          connected,
          hasContent: !!content,
          hasConversationId: !!conversationId,
        });
        return;
      }

      const messageData = {
        content,
        conversationId,
        senderId: userIdRef.current,
        createdAt: new Date().toISOString(),
        messageId: `temp-${Date.now()}`, // Add messageId for backend
      };

      console.log("Sending message via WebSocket:", messageData);
      socket.emit("send_message", messageData);

      // Optimistically add message to state
      const optimisticMessage = {
        ...messageData,
        id: messageData.messageId,
        pending: true,
      };

      console.log("Adding optimistic message:", optimisticMessage);
      setMessages((prev) => {
        console.log("Current messages before adding optimistic:", prev.length);
        const updatedMessages = [...prev, optimisticMessage];
        // Sort messages to ensure proper chronological order
        return updatedMessages.sort(
          (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
        );
      });
    },
    [socket, connected], // Remove userId dependency, use ref instead
  );

  // Create a new conversation
  const createConversation = useCallback(
    async (otherUserId, otherUserRole) => {
      try {
        const API_URL =
          import.meta.env.VITE_API_URL || "http://localhost:5000/api";
        const endpoint = `${API_URL}/chat/conversations`;

        const response = await fetch(endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            otherUserId,
            otherUserRole,
          }),
        });

        if (!response.ok) throw new Error("Failed to create conversation");

        const data = await response.json();

        // Add the new conversation to the list
        setConversations((prev) => [data.conversation, ...prev]);

        // Set as active conversation
        setActiveConversationAndFetch(data.conversation);

        return data.conversation;
      } catch (err) {
        console.error("Error creating conversation:", err);
        setError("Failed to create conversation. Please try again.");
        return null;
      }
    },
    [setActiveConversationAndFetch],
  );

  const value = {
    socket,
    connected,
    conversations,
    activeConversation,
    messages,
    loading,
    setLoading,
    error,
    userRole,
    userId,
    fetchConversations,
    fetchMessages,
    sendMessage,
    createConversation,
    setActiveConversation: setActiveConversationAndFetch,
    setError,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

ChatProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export { ChatContext, ChatProvider };
export default ChatProvider;
