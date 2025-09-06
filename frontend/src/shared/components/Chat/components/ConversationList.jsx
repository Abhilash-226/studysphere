import React from "react";
import PropTypes from "prop-types";
import { ListGroup, Spinner, Alert } from "react-bootstrap";
import ConversationItem from "../common/ConversationItem";
import useChatService from "../hooks/useChatService";

/**
 * ConversationList component for displaying a list of conversations
 * Integrates with chat service for real-time updates
 */
const ConversationList = ({
  onConversationSelect,
  selectedConversationId,
  className = "",
  showHeader = true,
}) => {
  const { conversations, loading, error, loadConversations, clearError } =
    useChatService();

  // Handle conversation selection
  const handleConversationClick = (conversation) => {
    if (onConversationSelect) {
      onConversationSelect(conversation);
    }
  };

  // Handle retry on error
  const handleRetry = () => {
    clearError();
    loadConversations();
  };

  if (loading && (!conversations || conversations.length === 0)) {
    return (
      <div className={`conversation-list ${className}`}>
        {showHeader && (
          <div className="conversation-list-header p-3 border-bottom">
            <h5 className="mb-0">Messages</h5>
          </div>
        )}
        <div className="d-flex justify-content-center align-items-center py-4">
          <Spinner animation="border" size="sm" className="me-2" />
          <span>Loading conversations...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`conversation-list ${className}`}>
        {showHeader && (
          <div className="conversation-list-header p-3 border-bottom">
            <h5 className="mb-0">Messages</h5>
          </div>
        )}
        <Alert
          variant="danger"
          className="m-3"
          dismissible
          onClose={clearError}
        >
          <Alert.Heading>Error loading conversations</Alert.Heading>
          <p className="mb-2">{error}</p>
          <button
            className="btn btn-outline-danger btn-sm"
            onClick={handleRetry}
          >
            Try Again
          </button>
        </Alert>
      </div>
    );
  }

  if (!conversations || conversations.length === 0) {
    return (
      <div className={`conversation-list ${className}`}>
        {showHeader && (
          <div className="conversation-list-header p-3 border-bottom">
            <h5 className="mb-0">Messages</h5>
          </div>
        )}
        <div className="text-center py-4 text-muted">
          <div className="mb-2">
            <i className="bi bi-chat-dots" style={{ fontSize: "2rem" }}></i>
          </div>
          <p className="mb-0">No conversations yet</p>
          <small>Start a conversation with a tutor!</small>
        </div>
      </div>
    );
  }

  return (
    <div className={`conversation-list ${className}`}>
      {showHeader && (
        <div className="conversation-list-header p-3 border-bottom">
          <h5 className="mb-0">Messages</h5>
          <small className="text-muted">
            {conversations.length} conversation
            {conversations.length !== 1 ? "s" : ""}
          </small>
        </div>
      )}

      <div className="conversation-list-content">
        <ListGroup variant="flush">
          {conversations.map((conversation) => (
            <ListGroup.Item
              key={conversation._id}
              action
              active={selectedConversationId === conversation._id}
              onClick={() => handleConversationClick(conversation)}
              className="conversation-list-item border-0 px-0"
            >
              <ConversationItem
                conversation={conversation}
                to={`/chat/${conversation._id}`}
              />
            </ListGroup.Item>
          ))}
        </ListGroup>
      </div>
    </div>
  );
};

ConversationList.propTypes = {
  /** Callback function called when a conversation is selected */
  onConversationSelect: PropTypes.func,
  /** ID of the currently selected conversation */
  selectedConversationId: PropTypes.string,
  /** Additional CSS classes */
  className: PropTypes.string,
  /** Whether to show the header section */
  showHeader: PropTypes.bool,
};

export default ConversationList;
