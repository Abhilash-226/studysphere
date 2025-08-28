import React from "react";
import PropTypes from "prop-types";
import { Button } from "react-bootstrap";
import { FaArrowLeft, FaEllipsisV } from "react-icons/fa";
import { formatImageUrl } from "../../../utils/imageUtils";
import Avatar from "./Avatar";
import "./ChatComponents.css";

/**
 * Header component for chat conversations
 *
 * @component
 * @param {Object} props - Component props
 * @param {Object} props.otherUser - User object for the conversation partner
 * @param {function} props.onBack - Function to handle back button click
 * @param {function} props.onClearChat - Function to clear chat history
 * @param {boolean} props.loading - Loading state
 * @param {number} props.messageCount - Number of messages in the conversation
 */
const ChatHeader = ({
  otherUser,
  onBack,
  onClearChat,
  loading = false,
  messageCount = 0,
}) => {
  if (!otherUser) {
    return (
      <div className="chat-header d-flex align-items-center">
        <Button variant="link" className="p-0 me-3 text-dark" onClick={onBack}>
          <FaArrowLeft />
        </Button>
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <div className="chat-header d-flex align-items-center">
      <Button variant="link" className="p-0 me-3 text-dark" onClick={onBack}>
        <FaArrowLeft />
      </Button>

      <div className="d-flex align-items-center justify-content-between w-100">
        <div className="d-flex align-items-center">
          <Avatar
            src={formatImageUrl(otherUser.profileImage)}
            alt={otherUser.name}
            size="md"
            status="online"
          />
          <div className="ms-2">
            <h6 className="mb-0">{otherUser.name}</h6>
            <small className="text-muted">{otherUser.email}</small>
          </div>
        </div>

        <div>
          <Button
            variant="outline-danger"
            size="sm"
            onClick={onClearChat}
            disabled={loading || messageCount === 0}
          >
            Clear Chat
          </Button>
        </div>
      </div>
    </div>
  );
};

ChatHeader.propTypes = {
  otherUser: PropTypes.shape({
    id: PropTypes.string,
    name: PropTypes.string,
    profileImage: PropTypes.string,
    email: PropTypes.string,
    role: PropTypes.string,
  }),
  onBack: PropTypes.func.isRequired,
  onClearChat: PropTypes.func.isRequired,
  loading: PropTypes.bool,
  messageCount: PropTypes.number,
};

export default ChatHeader;
