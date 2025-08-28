import React from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { Badge } from "react-bootstrap";
import Avatar from "./Avatar";
import { formatConversationTime } from "../utils/formatters";
import { formatImageUrl } from "../../../utils/imageUtils";
import "./ChatComponents.css";

/**
 * Conversation item component for displaying a single conversation in a list
 *
 * @component
 * @param {Object} props - Component props
 * @param {Object} props.conversation - Conversation data object
 * @param {string} props.to - Link destination
 */
const ConversationItem = ({ conversation, to }) => {
  if (!conversation || !conversation.otherUser) return null;

  const { otherUser, lastMessage, updatedAt, unreadCount } = conversation;
  const lastMessageContent =
    typeof lastMessage === "object" ? lastMessage.content : lastMessage;

  return (
    <Link
      to={to}
      className={`conversation-item d-flex align-items-center ${
        unreadCount > 0 ? "unread" : ""
      }`}
    >
      <Avatar
        src={formatImageUrl(otherUser.profileImage)}
        alt={otherUser.name}
        size="md"
      />

      <div className="conversation-details flex-grow-1">
        <div className="d-flex justify-content-between">
          <div>
            <h6 className="mb-0">{otherUser.name}</h6>
            <small className="text-muted">{otherUser.email}</small>
          </div>
          <small className="text-muted conversation-time">
            {formatConversationTime(updatedAt)}
          </small>
        </div>

        <p className="conversation-preview">
          {lastMessageContent || "No messages yet"}
        </p>
      </div>

      {unreadCount > 0 && (
        <Badge pill bg="primary" className="ms-2 unread-badge">
          {unreadCount}
        </Badge>
      )}
    </Link>
  );
};

ConversationItem.propTypes = {
  conversation: PropTypes.shape({
    id: PropTypes.string.isRequired,
    otherUser: PropTypes.shape({
      id: PropTypes.string,
      name: PropTypes.string,
      profileImage: PropTypes.string,
      email: PropTypes.string,
    }).isRequired,
    lastMessage: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
    updatedAt: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.instanceOf(Date),
    ]),
    unreadCount: PropTypes.number,
  }).isRequired,
  to: PropTypes.string.isRequired,
};

export default ConversationItem;
