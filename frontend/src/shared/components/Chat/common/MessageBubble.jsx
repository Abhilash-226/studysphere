import React from "react";
import PropTypes from "prop-types";
import { formatTime } from "../utils/formatters";
import "./ChatComponents.css";

/**
 * Message bubble component for displaying individual chat messages
 *
 * @component
 * @param {Object} props - Component props
 * @param {Object} props.message - Message data object
 * @param {boolean} props.isSentByCurrentUser - Whether the message was sent by the current user
 */
const MessageBubble = ({ message, isSentByCurrentUser }) => {
  return (
    <div
      className={`message-container ${
        isSentByCurrentUser ? "sent" : "received"
      }`}
    >
      <div className="message-content">
        <div className="message-bubble">{message.content}</div>
        <div className="message-info">
          <span className="message-time">
            {message.createdAt ? formatTime(message.createdAt) : ""}
          </span>
          {isSentByCurrentUser && (
            <span className="message-status">
              {message.read && <span className="read-indicator">Read</span>}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

MessageBubble.propTypes = {
  message: PropTypes.shape({
    content: PropTypes.string.isRequired,
    createdAt: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.instanceOf(Date),
    ]),
    read: PropTypes.bool,
  }).isRequired,
  isSentByCurrentUser: PropTypes.bool.isRequired,
};

export default MessageBubble;
