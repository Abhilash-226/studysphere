import React, { useState, useRef, useCallback } from "react";
import PropTypes from "prop-types";
import { Form, Button, InputGroup, Spinner } from "react-bootstrap";
import useChatService from "../hooks/useChatService";

/**
 * MessageInput component for composing and sending messages
 * Features auto-resize, keyboard shortcuts, and loading states
 */
const MessageInput = ({
  conversationId,
  placeholder = "Type a message...",
  onMessageSent,
  disabled = false,
  className = "",
}) => {
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const textareaRef = useRef(null);

  const { sendMessage, loading } = useChatService();

  // Handle message submission
  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();

      if (!message.trim() || !conversationId || isSending || disabled) {
        return;
      }

      setIsSending(true);

      try {
        await sendMessage(message.trim(), conversationId);
        setMessage("");

        // Reset textarea height
        if (textareaRef.current) {
          textareaRef.current.style.height = "auto";
        }

        // Call callback if provided
        if (onMessageSent) {
          onMessageSent(message.trim());
        }
      } catch (error) {
        console.error("Error sending message:", error);
      } finally {
        setIsSending(false);
      }
    },
    [message, conversationId, sendMessage, onMessageSent, isSending, disabled]
  );

  // Handle keyboard shortcuts
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  // Auto-resize textarea
  const handleTextareaChange = (e) => {
    const value = e.target.value;
    setMessage(value);

    // Auto-resize textarea
    const textarea = e.target;
    textarea.style.height = "auto";
    const scrollHeight = textarea.scrollHeight;

    // Limit max height to 150px (about 5-6 lines)
    const maxHeight = 150;
    textarea.style.height = `${Math.min(scrollHeight, maxHeight)}px`;
  };

  const isSubmitDisabled =
    !message.trim() || !conversationId || isSending || loading || disabled;

  // Reduced debug logging - only log when message changes
  if (message.trim()) {
    console.log("MessageInput ready to send:", {
      hasMessage: !!message.trim(),
      hasConversationId: !!conversationId,
      isSubmitDisabled,
    });
  }

  return (
    <div className={`w-100 ${className}`}>
      <Form onSubmit={handleSubmit}>
        <InputGroup>
          <Form.Control
            as="textarea"
            ref={textareaRef}
            value={message}
            onChange={handleTextareaChange}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled || isSending}
            className="message-input border-0 shadow-none"
            style={{
              resize: "none",
              minHeight: "40px",
              maxHeight: "150px",
              borderRadius: "20px",
              paddingTop: "10px",
              paddingBottom: "10px",
              fontSize: "14px",
            }}
          />
          <Button
            type="submit"
            variant="primary"
            disabled={isSubmitDisabled}
            className="send-btn"
            onClick={(e) => {
              console.log("Send button clicked!", e);
              if (!isSubmitDisabled) {
                console.log("Button should work - not disabled");
              } else {
                console.log("Button is disabled, click ignored");
              }
            }}
            style={{
              borderRadius: "50%",
              marginLeft: "8px",
              minWidth: "40px",
              height: "40px",
              cursor: "pointer",
              border: "none",
              outline: "none",
            }}
          >
            {isSending ? (
              <Spinner animation="border" size="sm" />
            ) : (
              <i
                className="fas fa-paper-plane"
                style={{ pointerEvents: "none" }}
              ></i>
            )}
          </Button>
        </InputGroup>
      </Form>
    </div>
  );
};

MessageInput.propTypes = {
  /** ID of the conversation to send messages to */
  conversationId: PropTypes.string,
  /** Placeholder text for the input */
  placeholder: PropTypes.string,
  /** Callback fired when a message is successfully sent */
  onMessageSent: PropTypes.func,
  /** Whether the input should be disabled */
  disabled: PropTypes.bool,
  /** Additional CSS classes */
  className: PropTypes.string,
};

export default MessageInput;
