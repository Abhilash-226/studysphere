import React, { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import { Spinner, Alert } from "react-bootstrap";
import MessageBubble from "../common/MessageBubble";
import { formatDate } from "../utils/formatters";
import useChatService from "../hooks/useChatService";

/**
 * MessageList component for displaying a list of messages in a conversation
 * Includes auto-scrolling, date separators, and real-time updates
 */
const MessageList = ({
  conversationId,
  currentUserId,
  className = "",
  autoScroll = true,
}) => {
  const { messages, loading, error, loadConversationMessages, clearError } =
    useChatService();

  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const [isUserScrolling, setIsUserScrolling] = useState(false);
  const previousMessageCountRef = useRef(0);
  const isInitialLoadRef = useRef(true);

  // Load messages when conversation changes
  useEffect(() => {
    if (conversationId) {
      loadConversationMessages(conversationId);
      isInitialLoadRef.current = true;
      previousMessageCountRef.current = 0;
      setIsUserScrolling(false);
    }
  }, [conversationId, loadConversationMessages]);

  // Auto-scroll to bottom when new messages arrive (only if user is at bottom or it's initial load)
  useEffect(() => {
    const hasNewMessages = messages?.length > previousMessageCountRef.current;
    const isFirstLoad =
      previousMessageCountRef.current === 0 && messages?.length > 0;

    if (autoScroll && messages?.length > 0) {
      if (isFirstLoad && isInitialLoadRef.current) {
        // Auto-scroll on initial load of conversation
        setTimeout(() => {
          scrollToBottom();
          isInitialLoadRef.current = false;
        }, 200);
      } else if (hasNewMessages && !isUserScrolling) {
        // Only auto-scroll for new messages if user is at bottom
        setTimeout(() => scrollToBottom(), 100);
      }
    }

    previousMessageCountRef.current = messages?.length || 0;
  }, [messages, autoScroll, isUserScrolling]);

  // Handle scroll detection
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      const isAtBottom = scrollHeight - scrollTop <= clientHeight + 50; // Reduced tolerance
      setIsUserScrolling(!isAtBottom);
    };

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToBottom = () => {
    const container = messagesContainerRef.current;
    if (container) {
      // Scroll the container to its bottom, not the entire page
      container.scrollTop = container.scrollHeight;
    }
  };

  // Group messages by date
  const groupMessagesByDate = (messages) => {
    if (!messages || !Array.isArray(messages)) {
      console.warn(
        "groupMessagesByDate received non-array messages:",
        messages
      );
      return [];
    }

    const groups = [];
    let currentDate = null;
    let currentGroup = [];

    messages.forEach((message) => {
      const messageDate = new Date(message.createdAt).toDateString();

      if (messageDate !== currentDate) {
        if (currentGroup.length > 0) {
          groups.push({ date: currentDate, messages: currentGroup });
        }
        currentDate = messageDate;
        currentGroup = [message];
      } else {
        currentGroup.push(message);
      }
    });

    if (currentGroup.length > 0) {
      groups.push({ date: currentDate, messages: currentGroup });
    }

    return groups;
  };

  // Handle retry on error
  const handleRetry = () => {
    clearError();
    if (conversationId) {
      loadConversationMessages(conversationId);
    }
  };

  if (!conversationId) {
    return (
      <div
        className={`message-list d-flex align-items-center justify-content-center ${className}`}
      >
        <div className="text-center text-muted">
          <div className="mb-2">
            <i
              className="bi bi-chat-square-dots"
              style={{ fontSize: "3rem" }}
            ></i>
          </div>
          <h5>Select a conversation</h5>
          <p>Choose a conversation from the sidebar to start messaging</p>
        </div>
      </div>
    );
  }

  if (loading && (!messages || messages.length === 0)) {
    return (
      <div
        className={`message-list d-flex align-items-center justify-content-center ${className}`}
      >
        <div className="text-center">
          <Spinner animation="border" className="mb-2" />
          <p className="text-muted">Loading messages...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={`message-list d-flex align-items-center justify-content-center ${className}`}
      >
        <Alert variant="danger" className="m-3 text-center">
          <Alert.Heading>Error loading messages</Alert.Heading>
          <p>{error}</p>
          <button className="btn btn-outline-danger" onClick={handleRetry}>
            Try Again
          </button>
        </Alert>
      </div>
    );
  }

  if (!messages || messages.length === 0) {
    return (
      <div
        className={`message-list d-flex align-items-center justify-content-center ${className}`}
      >
        <div className="text-center text-muted">
          <div className="mb-2">
            <i className="bi bi-chat-dots" style={{ fontSize: "2.5rem" }}></i>
          </div>
          <h6>No messages yet</h6>
          <p>Start the conversation by sending a message!</p>
        </div>
      </div>
    );
  }

  const messageGroups = groupMessagesByDate(messages);

  return (
    <div
      className={`message-list ${className}`}
      ref={messagesContainerRef}
      style={{
        height: "100%",
        overflowY: "auto",
        padding: "1rem",
      }}
    >
      <div className="messages-content">
        {messageGroups.map((group, groupIndex) => (
          <div key={groupIndex} className="message-group">
            {/* Date separator */}
            <div className="message-date-separator">
              <span>{formatDate(group.date)}</span>
            </div>

            {/* Messages for this date */}
            {group.messages.map((message) => (
              <MessageBubble
                key={message.id}
                message={message}
                isSentByCurrentUser={message.senderId === currentUserId}
              />
            ))}
          </div>
        ))}

        {/* Scroll anchor */}
        <div ref={messagesEndRef} />
      </div>

      {/* Scroll to bottom button */}
      {isUserScrolling && (
        <button
          className="btn btn-primary btn-sm position-fixed"
          style={{
            bottom: "120px",
            right: "20px",
            borderRadius: "50%",
            width: "40px",
            height: "40px",
            zIndex: 1000,
          }}
          onClick={scrollToBottom}
          title="Scroll to bottom"
        >
          <i className="bi bi-arrow-down"></i>
        </button>
      )}
    </div>
  );
};

MessageList.propTypes = {
  /** ID of the conversation to display messages for */
  conversationId: PropTypes.string,
  /** ID of the current user to determine message alignment */
  currentUserId: PropTypes.string.isRequired,
  /** Additional CSS classes */
  className: PropTypes.string,
  /** Whether to auto-scroll to bottom on new messages */
  autoScroll: PropTypes.bool,
};

export default MessageList;
