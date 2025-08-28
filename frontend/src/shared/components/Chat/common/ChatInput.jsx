import React, { useState } from "react";
import PropTypes from "prop-types";
import { Form, Button, Spinner } from "react-bootstrap";
import { FaPaperPlane } from "react-icons/fa";
import "./ChatComponents.css";

/**
 * Chat input component for typing and sending messages
 *
 * @component
 * @param {Object} props - Component props
 * @param {function} props.onSendMessage - Function to handle message sending
 * @param {boolean} props.isLoading - Whether the message is being sent
 * @param {boolean} props.disabled - Whether the input is disabled
 */
const ChatInput = ({ onSendMessage, isLoading = false, disabled = false }) => {
  const [message, setMessage] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!message.trim()) return;

    onSendMessage(message);
    setMessage("");
  };

  return (
    <Form onSubmit={handleSubmit} className="chat-input-form">
      <div className="d-flex">
        <Form.Control
          type="text"
          placeholder="Type a message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          disabled={isLoading || disabled}
          className="message-input"
        />
        <Button
          type="submit"
          variant="primary"
          className="ms-2 send-btn"
          disabled={!message.trim() || isLoading || disabled}
        >
          {isLoading ? (
            <Spinner
              as="span"
              animation="border"
              size="sm"
              role="status"
              aria-hidden="true"
            />
          ) : (
            <FaPaperPlane />
          )}
        </Button>
      </div>
    </Form>
  );
};

ChatInput.propTypes = {
  onSendMessage: PropTypes.func.isRequired,
  isLoading: PropTypes.bool,
  disabled: PropTypes.bool,
};

export default ChatInput;
