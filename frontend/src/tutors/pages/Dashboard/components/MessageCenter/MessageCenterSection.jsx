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
    <Card className="mb-4">
      <Card.Header className="d-flex justify-content-between align-items-center">
        <div className="d-flex align-items-center">
          <FaComments className="me-2 text-primary" />
          <h5 className="mb-0">Message Center</h5>
        </div>
        <Link to="/tutor/chat" className="btn btn-sm btn-outline-primary">
          View Messages
        </Link>
      </Card.Header>
      <Card.Body>
        <Row>
          <Col md={6} className="mb-3">
            <div className="d-flex align-items-center">
              <div className="icon-bg bg-primary text-white rounded-circle p-3 me-3">
                <FaEnvelope size={24} />
              </div>
              <div>
                <h6 className="mb-0">Unread Messages</h6>
                <p className="mb-0">{unreadCount} messages</p>
              </div>
            </div>
          </Col>
        </Row>
        <Row className="mt-2">
          <Col md={6} className="mb-3 mb-md-0">
            <div className="d-flex align-items-center">
              <div className="icon-bg bg-success text-white rounded-circle p-3 me-3">
                <FaComments size={24} />
              </div>
              <div>
                <h6 className="mb-0">Total Conversations</h6>
                <p className="mb-0">{totalConversations} active threads</p>
              </div>
            </div>
          </Col>
        </Row>
        <div className="text-center mt-4">
          <Button as={Link} to="/tutor/chat" variant="primary">
            <FaEnvelope className="me-2" /> Check Messages
          </Button>
        </div>
      </Card.Body>
    </Card>
  );
};

export default MessageCenterSection;
