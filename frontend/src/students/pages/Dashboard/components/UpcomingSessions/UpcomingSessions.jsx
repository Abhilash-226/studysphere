import React from "react";
import { Card, ListGroup, Button, Badge } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import {
  FaCalendarAlt,
  FaClock,
  FaMapMarkerAlt,
  FaVideo,
} from "react-icons/fa";
import "./UpcomingSessions.css";

/**
 * UpcomingSessions - Component for displaying upcoming tutoring sessions
 * @param {Object} props - Component props
 * @param {Array} props.sessions - Array of upcoming session objects
 * @returns {React.ReactElement} - Rendered component
 */
const UpcomingSessions = ({ sessions }) => {
  const navigate = useNavigate();

  // Format date to display in a user-friendly way
  const formatDate = (dateString) => {
    const options = { weekday: "long", month: "short", day: "numeric" };
    return new Date(dateString).toLocaleDateString("en-US", options);
  };

  // Format time to display in AM/PM format
  const formatTime = (timeString) => {
    const date = new Date(timeString);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Card className="upcoming-sessions-card mb-4">
      <Card.Header className="bg-white">
        <div className="d-flex align-items-center justify-content-between">
          <div className="d-flex align-items-center">
            <FaCalendarAlt className="text-primary me-2" />
            <h5 className="mb-0">Upcoming Sessions</h5>
          </div>
          <Link
            to="/student/sessions"
            className="btn btn-sm btn-outline-primary"
          >
            View All
          </Link>
        </div>
      </Card.Header>
      <ListGroup variant="flush">
        {Array.isArray(sessions) && sessions.length > 0 ? (
          sessions.map((session, index) => (
            <ListGroup.Item key={index} className="py-3">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="mb-1">{session.subject}</h6>
                  <p className="mb-1 text-muted">
                    with {session.tutorName || "Tutor"}
                  </p>
                  <div className="d-flex align-items-center small text-muted mb-2">
                    <FaClock className="me-1" />
                    <span>
                      {formatDate(session.startTime)} •{" "}
                      {formatTime(session.startTime)} -{" "}
                      {formatTime(session.endTime)}
                    </span>
                  </div>
                  <div className="d-flex align-items-center small text-muted">
                    <FaMapMarkerAlt className="me-1" />
                    <span>
                      {session.mode === "online"
                        ? "Online Session"
                        : `In Person - ${session.location || "TBD"}`}
                    </span>
                  </div>
                </div>
                <div className="d-flex flex-column align-items-end">
                  <Badge
                    bg={
                      session.status === "confirmed"
                        ? "success"
                        : session.status === "pending"
                        ? "warning"
                        : session.status === "scheduled"
                        ? "primary"
                        : "secondary"
                    }
                    text={session.status === "pending" ? "dark" : "white"}
                    className="mb-2"
                  >
                    {session.status === "confirmed"
                      ? "Confirmed"
                      : session.status === "pending"
                      ? "Pending"
                      : session.status === "scheduled"
                      ? "Scheduled"
                      : session.status}
                  </Badge>
                  <div className="d-flex gap-2">
                    {/* Enter Classroom button for online sessions - ClassroomPage handles join logic */}
                    {session.mode === "online" &&
                      (session.status === "scheduled" ||
                        session.status === "confirmed") && (
                        <Button
                          variant={
                            session.isClassActive
                              ? "success"
                              : "outline-primary"
                          }
                          size="sm"
                          onClick={() =>
                            navigate(
                              `/student/classroom/${session.id || session._id}`
                            )
                          }
                        >
                          <FaVideo className="me-1" />
                          {session.isClassActive ? "Join Now" : "Classroom"}
                        </Button>
                      )}
                    <Button
                      as={Link}
                      to={`/student/sessions/${session.id || session._id}`}
                      variant="outline-secondary"
                      size="sm"
                    >
                      Details
                    </Button>
                  </div>
                </div>
              </div>
            </ListGroup.Item>
          ))
        ) : (
          <ListGroup.Item className="text-center py-5">
            <p className="mb-2 text-muted">No upcoming sessions scheduled</p>
            <Button as={Link} to="/tutors" variant="primary">
              Find a Tutor
            </Button>
          </ListGroup.Item>
        )}
      </ListGroup>
    </Card>
  );
};

export default UpcomingSessions;
