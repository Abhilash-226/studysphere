import React, { useRef, useEffect } from "react";
import PropTypes from "prop-types";
import MessageBubble from "./MessageBubble";
import DateSeparator from "./DateSeparator";
import "./ChatComponents.css";

/**
 * MessageList component for displaying a conversation's messages
 * with automatic scrolling to bottom on new messages
 *
 * @component
 * @param {Object} props - Component props
 * @param {Array} props.messages - Array of message objects
 * @param {string} props.currentUserId - The ID of the current user
 * @param {boolean} props.loading - Whether messages are currently loading
 */
const MessageList = ({ messages, currentUserId, loading }) => {
  const messagesEndRef = useRef(null);

  // Function to scroll to the bottom of the message list
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Group messages by date
  const groupedMessages = React.useMemo(() => {
    if (!messages || !messages.length) return [];

    const groups = [];
    let currentGroup = {
      date: new Date(messages[0].createdAt),
      messages: [messages[0]],
    };

    for (let i = 1; i < messages.length; i++) {
      const message = messages[i];
      const messageDate = new Date(message.createdAt);
      const previousDate = new Date(currentGroup.date);

      // Check if the message belongs to a different day
      if (
        messageDate.getDate() !== previousDate.getDate() ||
        messageDate.getMonth() !== previousDate.getMonth() ||
        messageDate.getFullYear() !== previousDate.getFullYear()
      ) {
        // Add the current group to the groups array and start a new group
        groups.push(currentGroup);
        currentGroup = {
          date: messageDate,
          messages: [message],
        };
      } else {
        // Add the message to the current group
        currentGroup.messages.push(message);
      }
    }

    // Add the last group
    if (currentGroup.messages.length > 0) {
      groups.push(currentGroup);
    }

    return groups;
  }, [messages]);

  if (loading) {
    return (
      <div className="message-list-loading d-flex align-items-center justify-content-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="message-list">
      {groupedMessages.length > 0 ? (
        groupedMessages.map((group, groupIndex) => (
          <div key={`group-${groupIndex}`} className="message-group">
            <DateSeparator date={group.date} />
            {group.messages.map((message) => (
              <MessageBubble
                key={message.id || message._id}
                message={message}
                isCurrentUser={message.senderId === currentUserId}
              />
            ))}
          </div>
        ))
      ) : (
        <div className="no-messages-placeholder d-flex flex-column align-items-center justify-content-center h-100">
          <p className="text-muted mb-0">No messages yet</p>
          <p className="text-muted small">
            Start the conversation by sending a message
          </p>
        </div>
      )}
      <div ref={messagesEndRef} />
    </div>
  );
};

MessageList.propTypes = {
  messages: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string,
      _id: PropTypes.string, // Supporting both id formats
      content: PropTypes.string.isRequired,
      senderId: PropTypes.string.isRequired,
      createdAt: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.instanceOf(Date),
      ]).isRequired,
    })
  ).isRequired,
  currentUserId: PropTypes.string.isRequired,
  loading: PropTypes.bool,
};

MessageList.defaultProps = {
  loading: false,
};

export default MessageList;
