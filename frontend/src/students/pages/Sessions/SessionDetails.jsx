import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Container,
  Row,
  Col,
  Card,
  Badge,
  Button,
  Alert,
  Spinner,
  ListGroup,
} from "react-bootstrap";
import {
  FaArrowLeft,
  FaCalendarAlt,
  FaClock,
  FaUser,
  FaMapMarkerAlt,
  FaVideo,
  FaPhone,
  FaEnvelope,
  FaGraduationCap,
  FaDollarSign,
} from "react-icons/fa";
import sessionService from "../../../shared/services/session.service";
import { formatImageUrl } from "../../../shared/utils/imageUtils";
import "./SessionDetails.css";

const SessionDetails = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  console.log("SessionDetails - sessionId from params:", sessionId);

  useEffect(() => {
    if (sessionId) {
      fetchSessionDetails();
    } else {
      console.log("No sessionId provided");
      setError("No session ID provided");
      setLoading(false);
    }
  }, [sessionId]);

  const fetchSessionDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log("Fetching session details for ID:", sessionId);

      // Debug: Check user info in localStorage
      const userStr = localStorage.getItem("user");
      const token = localStorage.getItem("token");
      console.log("Current user:", userStr ? JSON.parse(userStr) : "No user");
      console.log("Current token:", token ? "Token exists" : "No token");

      const response = await sessionService.getSession(sessionId);
      console.log("Session details response:", response);

      if (response && response.success) {
        setSession(response.session);
      } else {
        setError("Failed to load session details");
      }
    } catch (err) {
      console.error("Error fetching session details:", err);

      // Check for different error types
      const errorMessage = err.message || err.error || err.toString();
      const statusCode = err.response?.status || err.status;

      if (
        statusCode === 403 ||
        errorMessage.includes("Access denied") ||
        errorMessage.includes("permission")
      ) {
        setError(
          "You don't have permission to view this session. It may belong to another user."
        );
      } else if (
        statusCode === 404 ||
        errorMessage.includes("404") ||
        errorMessage.includes("not found")
      ) {
        setError("Session not found. It may have been deleted or moved.");
      } else if (
        statusCode === 401 ||
        errorMessage.includes("401") ||
        errorMessage.includes("unauthorized")
      ) {
        setError("Please log in to view session details.");
      } else {
        setError("Unable to load session details. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
      time: date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
  };

  const getStatusVariant = (status) => {
    switch (status) {
      case "scheduled":
        return "primary";
      case "completed":
        return "success";
      case "cancelled":
        return "danger";
      case "rescheduled":
        return "warning";
      default:
        return "secondary";
    }
  };

  const handleJoinSession = () => {
    if (session.meetingLink) {
      window.open(session.meetingLink, "_blank");
    } else {
      setError("Meeting link not available for this session");
    }
  };

  const handleContactTutor = () => {
    navigate(`/student/chat/${session.tutor.id}`);
  };

  if (loading) {
    return (
      <Container className="session-details-page py-4">
        <div className="text-center">
          <Spinner animation="border" variant="primary" />
          <p className="mt-3">Loading session details...</p>
        </div>
      </Container>
    );
  }

  if (error || !session) {
    return (
      <Container className="session-details-page py-4">
        <Alert variant="danger">
          <Alert.Heading>Unable to Access Session</Alert.Heading>
          <p>{error || "Session not found"}</p>
          {error && error.includes("permission") && (
            <>
              <hr />
              <p className="mb-0">
                <strong>Tip:</strong> You can only view sessions that belong to
                you. If you're looking for your sessions, click "View My
                Sessions" below.
              </p>
            </>
          )}
        </Alert>
        <div className="d-flex gap-2">
          <Button variant="outline-primary" onClick={() => navigate(-1)}>
            <FaArrowLeft className="me-2" />
            Go Back
          </Button>
          <Button
            variant="primary"
            onClick={() => navigate("/student/sessions")}
          >
            View My Sessions
          </Button>
        </div>
      </Container>
    );
  }

  const { date, time } = formatDateTime(session.startTime);
  const endTime = formatDateTime(session.endTime).time;

  return (
    <Container className="session-details-page py-4">
      <Row>
        <Col>
          {/* Header */}
          <div className="d-flex align-items-center mb-4">
            <Button
              variant="outline-primary"
              onClick={() => navigate(-1)}
              className="me-3"
            >
              <FaArrowLeft />
            </Button>
            <div>
              <h2>Session Details</h2>
              <Badge bg={getStatusVariant(session.status)} className="fs-6">
                {session.status.charAt(0).toUpperCase() +
                  session.status.slice(1)}
              </Badge>
            </div>
          </div>

          <Row>
            {/* Main Session Info */}
            <Col lg={8}>
              <Card className="mb-4">
                <Card.Header>
                  <h4 className="mb-0">{session.subject}</h4>
                  <p className="text-muted mb-0 mt-1">
                    Session with {session.tutor?.name}
                  </p>
                </Card.Header>
                <Card.Body>
                  <Row>
                    <Col md={6}>
                      <div className="session-detail-item mb-3">
                        <FaCalendarAlt className="me-2 text-muted" />
                        <strong>Date:</strong> {date}
                      </div>
                      <div className="session-detail-item mb-3">
                        <FaClock className="me-2 text-muted" />
                        <strong>Time:</strong> {time} - {endTime}
                      </div>
                      <div className="session-detail-item mb-3">
                        <FaMapMarkerAlt className="me-2 text-muted" />
                        <strong>Mode:</strong>{" "}
                        {session.mode
                          ? session.mode
                              .replace("_", " ")
                              .replace(/\b\w/g, (l) => l.toUpperCase())
                          : "Not specified"}
                      </div>
                    </Col>
                    <Col md={6}>
                      {session.price && (
                        <div className="session-detail-item mb-3">
                          <FaDollarSign className="me-2 text-muted" />
                          <strong>Price:</strong> ${session.price}
                        </div>
                      )}
                    </Col>
                  </Row>

                  {session.description && (
                    <div className="mt-3">
                      <strong>Description:</strong>
                      <p className="mt-2">{session.description}</p>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="mt-4 d-flex gap-2 flex-wrap">
                    {session.status === "scheduled" && session.meetingLink && (
                      <Button
                        variant="success"
                        onClick={handleJoinSession}
                        size="lg"
                      >
                        <FaVideo className="me-2" />
                        Join Session
                      </Button>
                    )}

                    <Button
                      variant="outline-primary"
                      onClick={handleContactTutor}
                    >
                      <FaEnvelope className="me-2" />
                      Message Tutor
                    </Button>
                  </div>
                </Card.Body>
              </Card>

              {/* Session Notes or Resources */}
              {session.notes && (
                <Card className="mb-4">
                  <Card.Header>
                    <h5 className="mb-0">Session Notes</h5>
                  </Card.Header>
                  <Card.Body>
                    <p>{session.notes}</p>
                  </Card.Body>
                </Card>
              )}
            </Col>

            {/* Tutor Info Sidebar */}
            <Col lg={4}>
              <Card className="tutor-info-card">
                <Card.Header>
                  <h5 className="mb-0">Your Tutor</h5>
                </Card.Header>
                <Card.Body className="text-center">
                  <img
                    src={formatImageUrl(session.tutor?.profileImage)}
                    alt={session.tutor?.name}
                    className="tutor-avatar-large mb-3"
                    onError={(e) => {
                      e.target.src = "/images/default-avatar.png";
                    }}
                  />
                  <h5>{session.tutor?.name}</h5>

                  <div className="mb-2">
                    <small className="text-muted">{session.tutor.email}</small>
                  </div>

                  <div className="d-grid gap-2">
                    <Button
                      variant="outline-primary"
                      size="sm"
                      onClick={() => navigate(`/tutor/${session.tutor.id}`)}
                    >
                      View Profile
                    </Button>
                    <Button
                      variant="outline-secondary"
                      size="sm"
                      onClick={handleContactTutor}
                    >
                      <FaEnvelope className="me-1" />
                      Message
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Col>
      </Row>
    </Container>
  );
};

export default SessionDetails;
