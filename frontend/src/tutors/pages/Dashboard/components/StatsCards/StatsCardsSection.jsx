import React from "react";
import { Row, Col, Card } from "react-bootstrap";
import { FaCalendarAlt, FaEnvelope, FaBell, FaUsers } from "react-icons/fa";
import "./StatsCardsSection.css";

/**
 * StatsCardsSection - Section component for displaying tutor statistics in cards
 * @param {Object} props - Component props
 * @param {Object} props.messageStats - Message statistics data
 * @param {number} props.sessionCount - Number of upcoming sessions
 * @param {number} props.requestCount - Number of pending session requests
 * @param {number} props.totalStudents - Total number of students taught
 * @returns {React.ReactElement} - Rendered component
 */
const StatsCardsSection = ({
  messageStats = {},
  sessionCount = 0,
  requestCount = 0,
  totalStudents = 0,
}) => {
  return (
    <Row className="mb-4">
      <Col md={3}>
        <Card className="dashboard-stat-card bg-primary bg-gradient text-dark">
          <Card.Body className="d-flex align-items-center p-3">
            <div className="stat-icon me-3">
              <FaCalendarAlt size={28} />
            </div>
            <div>
              <h6 className="mb-0">Upcoming Sessions</h6>
              <h3 className="mb-0">{sessionCount}</h3>
            </div>
          </Card.Body>
        </Card>
      </Col>
      <Col md={3}>
        <Card className="dashboard-stat-card bg-danger bg-gradient text-dark">
          <Card.Body className="d-flex align-items-center p-3">
            <div className="stat-icon me-3">
              <FaBell size={28} />
            </div>
            <div>
              <h6 className="mb-0">Session Requests</h6>
              <h3 className="mb-0">{requestCount}</h3>
            </div>
          </Card.Body>
        </Card>
      </Col>
      <Col md={3}>
        <Card className="dashboard-stat-card bg-info bg-gradient text-dark">
          <Card.Body className="d-flex align-items-center p-3">
            <div className="stat-icon me-3">
              <FaEnvelope size={28} />
            </div>
            <div>
              <h6 className="mb-0">Unread Messages</h6>
              <h3 className="mb-0">{messageStats.unreadCount || 0}</h3>
            </div>
          </Card.Body>
        </Card>
      </Col>
      <Col md={3}>
        <Card className="dashboard-stat-card bg-secondary bg-gradient text-dark">
          <Card.Body className="d-flex align-items-center p-3">
            <div className="stat-icon me-3">
              <FaUsers size={28} />
            </div>
            <div>
              <h6 className="mb-0">Students Taught</h6>
              <h3 className="mb-0">{totalStudents}</h3>
            </div>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
};

export default StatsCardsSection;
