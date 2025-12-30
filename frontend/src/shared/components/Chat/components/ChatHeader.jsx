import React from "react";
import PropTypes from "prop-types";
import { Button, Dropdown } from "react-bootstrap";
import Avatar from "../common/Avatar";
import { formatUserName } from "../utils/formatters";

/**
 * ChatHeader component for displaying conversation header with user info and actions
 */
const ChatHeader = ({
  conversation,
  onBack,
  onToggleSidebar,
  showBackButton = false,
  showMenuButton = false,
  className = "",
}) => {
  if (!conversation || !conversation.otherUser) {
    return (
      <div className={`chat-header border-bottom bg-white p-3 ${className}`}>
        <div className="d-flex align-items-center">
          {showBackButton && (
            <Button
              variant="link"
              className="p-0 me-3 text-decoration-none"
              onClick={onBack}
            >
              <i className="bi bi-arrow-left fs-5"></i>
            </Button>
          )}
          <div className="text-muted">Select a conversation</div>
        </div>
      </div>
    );
  }

  const { otherUser } = conversation;
  const userName = formatUserName(otherUser);

  return (
    <div className={`chat-header border-bottom p-3 ${className}`}>
      <div className="d-flex align-items-center justify-content-between">
        <div className="d-flex align-items-center flex-grow-1">
          {showBackButton && (
            <Button
              variant="link"
              className="p-0 me-3 text-decoration-none back-btn"
              onClick={onBack}
              aria-label="Go back"
            >
              <i className="bi bi-arrow-left fs-5"></i>
            </Button>
          )}

          <Avatar
            src={otherUser.profileImage}
            alt={userName}
            size="md"
            showOnlineStatus={true}
            isOnline={otherUser.isOnline}
            className="me-3"
          />

          <div className="flex-grow-1 min-width-0">
            <h6 className="mb-0 fw-semibold text-truncate">{userName}</h6>
            {otherUser.isOnline ? (
              <small className="online-status">
                <i
                  className="bi bi-circle-fill me-1"
                  style={{ fontSize: "0.45rem" }}
                ></i>
                Online
              </small>
            ) : (
              <small className="text-muted text-capitalize">
                {otherUser.role || "Offline"}
              </small>
            )}
          </div>
        </div>

        <div className="d-flex align-items-center">
          <Dropdown align="end">
            <Dropdown.Toggle
              variant="light"
              size="sm"
              className="rounded-circle border-0 menu-btn"
              style={{ width: "36px", height: "36px" }}
            >
              <i className="bi bi-three-dots-vertical"></i>
            </Dropdown.Toggle>

            <Dropdown.Menu>
              <Dropdown.Item href="#" disabled>
                <i className="bi bi-person me-2"></i>
                View Profile
              </Dropdown.Item>
              <Dropdown.Item href="#" disabled>
                <i className="bi bi-search me-2"></i>
                Search Messages
              </Dropdown.Item>
              <Dropdown.Divider />
              <Dropdown.Item href="#" className="text-muted" disabled>
                <i className="bi bi-bell-slash me-2"></i>
                Mute Notifications
              </Dropdown.Item>
              <Dropdown.Item href="#" className="text-danger" disabled>
                <i className="bi bi-trash me-2"></i>
                Delete Conversation
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>

          {showMenuButton && (
            <Button
              variant="link"
              className="p-0 ms-2 text-decoration-none"
              onClick={onToggleSidebar}
            >
              <i className="bi bi-list fs-5"></i>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

ChatHeader.propTypes = {
  /** Conversation object containing other user info */
  conversation: PropTypes.shape({
    id: PropTypes.string,
    otherUser: PropTypes.shape({
      id: PropTypes.string,
      name: PropTypes.string,
      firstName: PropTypes.string,
      lastName: PropTypes.string,
      profileImage: PropTypes.string,
      email: PropTypes.string,
      role: PropTypes.string,
      isOnline: PropTypes.bool,
    }),
  }),
  /** Callback for back button click */
  onBack: PropTypes.func,
  /** Callback for sidebar toggle */
  onToggleSidebar: PropTypes.func,
  /** Whether to show the back button */
  showBackButton: PropTypes.bool,
  /** Whether to show the menu button */
  showMenuButton: PropTypes.bool,
  /** Additional CSS classes */
  className: PropTypes.string,
};

export default ChatHeader;
