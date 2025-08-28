import React from "react";
import PropTypes from "prop-types";
import { Form, InputGroup } from "react-bootstrap";
import { FaSearch } from "react-icons/fa";
import ConversationItem from "./ConversationItem";
import "./ChatComponents.css";

/**
 * Conversation list component for displaying a list of conversations
 * with optional search functionality
 *
 * @component
 * @param {Object} props - Component props
 * @param {Array} props.conversations - Array of conversation objects
 * @param {Function} props.onSearch - Search callback function
 * @param {string} props.searchTerm - Current search term
 * @param {string} props.basePath - Base path for conversation links
 * @param {string} props.activeConversationId - Currently active conversation ID
 */
const ConversationList = ({
  conversations,
  onSearch,
  searchTerm,
  basePath,
  activeConversationId,
}) => {
  return (
    <div className="conversation-list">
      {onSearch && (
        <InputGroup className="conversation-search-input mb-3">
          <InputGroup.Text>
            <FaSearch />
          </InputGroup.Text>
          <Form.Control
            placeholder="Search conversations"
            value={searchTerm}
            onChange={(e) => onSearch(e.target.value)}
          />
        </InputGroup>
      )}

      <div className="conversation-items-container">
        {conversations && conversations.length > 0 ? (
          conversations.map((conversation) => (
            <ConversationItem
              key={conversation.id}
              conversation={conversation}
              to={`${basePath}/${conversation.id}`}
              active={activeConversationId === conversation.id}
            />
          ))
        ) : (
          <div className="no-conversations text-center p-3">
            <p className="text-muted">No conversations yet</p>
          </div>
        )}
      </div>
    </div>
  );
};

ConversationList.propTypes = {
  conversations: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
    })
  ).isRequired,
  onSearch: PropTypes.func,
  searchTerm: PropTypes.string,
  basePath: PropTypes.string.isRequired,
  activeConversationId: PropTypes.string,
};

ConversationList.defaultProps = {
  onSearch: null,
  searchTerm: "",
  activeConversationId: null,
};

export default ConversationList;
