import React from "react";
import { Card, ListGroup, Badge, Button } from "react-bootstrap";
import { Link } from "react-router-dom";
import { FaCalendarAlt, FaVideo, FaUserGraduate, FaUser } from "react-icons/fa";
import "./UpcomingSessionsSection.css";

/**
 * UpcomingSessionsSection - Section component for displaying upcoming tutoring sessions
 * @param {Object} props - Component props
 * @param {Array} props.sessions - List of upcoming sessions
 * @returns {React.ReactElement} - Rendered component
 */
const UpcomingSessionsSection = ({ sessions = [] }) => {
  // Ensure sessions is always an array
  const sessionsList = Array.isArray(sessions) ? sessions : [];

  // Format date function
  const formatDate = (dateString) => {
    const options = { weekday: "short", month: "short", day: "numeric" };
    return new Date(dateString).toLocaleDateString("en-US", options);
  };

  // Format time function
  const formatTime = (dateString) => {
    const options = { hour: "numeric", minute: "2-digit", hour12: true };
    return new Date(dateString).toLocaleTimeString("en-US", options);
  };

  return (
    <Card className="mb-4">
      <Card.Header className="d-flex justify-content-between align-items-center">
        <div className="d-flex align-items-center">
          <FaCalendarAlt className="me-2 text-primary" />
          <h5 className="mb-0">Upcoming Sessions</h5>
        </div>
        <Link to="/tutor/sessions" className="btn btn-sm btn-outline-primary">
          View All
        </Link>
      </Card.Header>

      {sessionsList.length === 0 ? (
        <Card.Body className="text-center py-4">
          <div className="mb-3">
            <FaCalendarAlt size={48} className="text-muted" />
          </div>
          <h5>No Upcoming Sessions</h5>
          <p className="text-muted">
            You don't have any upcoming sessions scheduled.
          </p>
        </Card.Body>
      ) : (
        <ListGroup variant="flush">
          {sessionsList.map((session) => (
            <ListGroup.Item
              key={session.id}
              className="d-flex justify-content-between align-items-center"
            >
              <div className="d-flex align-items-center">
                <div className="session-time me-3 text-center">
                  <div className="fw-bold">{formatDate(session.startTime)}</div>
                  <div>{formatTime(session.startTime)}</div>
                </div>
                <div>
                  <div className="d-flex align-items-center mb-1">
                    <FaUserGraduate className="me-2 text-primary" />
                    <span className="fw-bold">{session.student.name}</span>
                  </div>
                  <div className="d-flex align-items-center">
                    <Badge
                      bg={session.mode === "online" ? "info" : "success"}
                      className="me-2"
                    >
                      {session.mode === "online" ? "Online" : "In-Person"}
                    </Badge>
                    <span>{session.subject}</span>
                  </div>
                </div>
              </div>
              <div>
                {session.mode === "online" && (
                  <Button variant="outline-primary" size="sm" className="me-2">
                    <FaVideo className="me-1" /> Join
                  </Button>
                )}
                <Button
                  as={Link}
                  to={`/tutor/student/${session.student.id}`}
                  variant="outline-info"
                  size="sm"
                  className="me-2"
                >
                  <FaUser className="me-1" /> Profile
                </Button>
                <Button variant="outline-secondary" size="sm">
                  Details
                </Button>
              </div>
            </ListGroup.Item>
          ))}
        </ListGroup>
      )}
    </Card>
  );
};

export default UpcomingSessionsSection;
