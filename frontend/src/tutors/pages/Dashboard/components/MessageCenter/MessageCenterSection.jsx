import React from "react";
import { Card, Button, Row, Col } from "react-bootstrap";
import { Link } from "react-router-dom";
import { FaEnvelope, FaCalendarCheck, FaComments } from "react-icons/fa";
import "./MessageCenterSection.css";

/**
 * MessageCenterSection - Section component for displaying message center stats
 * @param {Object} props - Component props
 * @param {Object} props.messageStats - Message statistics data
 * @returns {React.ReactElement} - Rendered component
 */
const MessageCenterSection = ({ messageStats = {} }) => {
  const {
    unreadCount = 0,
    totalConversations = 0,
    responseRate = 0,
    averageResponseTime = 0,
  } = messageStats;

  return (
    <Card className="mb-4 message-center-card">
      <Card.Header className="d-flex justify-content-between align-items-center">
        <div className="d-flex align-items-center">
          <FaComments className="me-2 text-primary" />
          <h5 className="mb-0">Message Center</h5>
        </div>
        <Link to="/tutor/chat" className="btn btn-sm btn-outline-primary">
          View Messages
        </Link>
      </Card.Header>
      <Card.Body className="py-3">
        <div className="message-stats-row">
          <div className="message-stat-item">
            <div className="icon-bg bg-primary text-white">
              <FaEnvelope size={16} />
            </div>
            <div className="stat-content">
              <span className="stat-value">{unreadCount}</span>
              <span className="stat-label">Unread</span>
            </div>
          </div>
          <div className="message-stat-item">
            <div className="icon-bg bg-success text-white">
              <FaComments size={16} />
            </div>
            <div className="stat-content">
              <span className="stat-value">{totalConversations}</span>
              <span className="stat-label">Conversations</span>
            </div>
          </div>
        </div>
        <Button
          as={Link}
          to="/tutor/chat"
          variant="primary"
          size="sm"
          className="w-100 mt-3"
        >
          <FaEnvelope className="me-2" /> Check Messages
        </Button>
      </Card.Body>
    </Card>
  );
};

export default MessageCenterSection;
