import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Badge,
  Button,
  Form,
  Alert,
  Spinner,
} from "react-bootstrap";
import {
  FaCalendarAlt,
  FaClock,
  FaUser,
  FaMapMarkerAlt,
  FaFilter,
  FaEye,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import sessionService from "../../../shared/services/session.service";
import { formatImageUrl } from "../../../shared/utils/imageUtils";
import "./Sessions.css";

const Sessions = () => {
  const [sessions, setSessions] = useState([]);
  const [filteredSessions, setFilteredSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  // Session status options for filtering
  const statusOptions = [
    { value: "all", label: "All Sessions", variant: "secondary" },
    { value: "scheduled", label: "Scheduled", variant: "primary" },
    { value: "completed", label: "Completed", variant: "success" },
    { value: "cancelled", label: "Cancelled", variant: "danger" },
    { value: "rescheduled", label: "Rescheduled", variant: "warning" },
  ];

  useEffect(() => {
    fetchSessions();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [sessions, filter, searchTerm]);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log("Fetching sessions...");

      // Debug: Check user info
      const userStr = localStorage.getItem("user");
      const currentUser = userStr ? JSON.parse(userStr) : null;
      console.log("Current user role:", currentUser?.role);
      console.log("Current user ID:", currentUser?.id);

      const response = await sessionService.getStudentSessions();
      console.log("Sessions response:", response);

      if (response && response.success) {
        setSessions(response.sessions || []);
        console.log("Sessions set:", response.sessions);
      } else {
        setError("Failed to load sessions");
      }
    } catch (err) {
      console.error("Error fetching sessions:", err);
      if (err.message && err.message.includes("404")) {
        setError(
          "Student profile not found. Please complete your profile setup."
        );
      } else if (err.message && err.message.includes("401")) {
        setError("Please log in to view your sessions.");
      } else {
        setError("Unable to load sessions. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...sessions];

    // Apply status filter
    if (filter !== "all") {
      filtered = filtered.filter((session) => session.status === filter);
    }

    // Apply search filter
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (session) =>
          session.tutor?.name?.toLowerCase().includes(searchLower) ||
          session.subject?.toLowerCase().includes(searchLower) ||
          session.description?.toLowerCase().includes(searchLower)
      );
    }

    // Sort by date (scheduled first, then by date)
    filtered.sort((a, b) => {
      const dateA = new Date(a.startTime);
      const dateB = new Date(b.startTime);

      if (a.status === "scheduled" && b.status !== "scheduled") return -1;
      if (a.status !== "scheduled" && b.status === "scheduled") return 1;

      return dateB - dateA; // Most recent first
    });

    setFilteredSessions(filtered);
  };

  const getStatusVariant = (status) => {
    const statusOption = statusOptions.find(
      (option) => option.value === status
    );
    return statusOption ? statusOption.variant : "secondary";
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString("en-US", {
        weekday: "short",
        year: "numeric",
        month: "short",
        day: "numeric",
      }),
      time: date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
  };

  const handleViewDetails = (sessionId) => {
    console.log("handleViewDetails called with sessionId:", sessionId);
    if (!sessionId || sessionId === "undefined") {
      console.error("Invalid sessionId:", sessionId);
      setError("Invalid session ID. Cannot view details.");
      return;
    }
    navigate(`/student/sessions/${sessionId}`);
  };

  const handleJoinSession = (session) => {
    if (session.meetingLink) {
      window.open(session.meetingLink, "_blank");
    } else {
      setError("Meeting link not available for this session");
    }
  };

  if (loading) {
    return (
      <Container className="sessions-page py-4">
        <div className="text-center">
          <Spinner animation="border" variant="primary" />
          <p className="mt-3">Loading your sessions...</p>
        </div>
      </Container>
    );
  }

  return (
    <Container className="sessions-page py-4">
      <Row>
        <Col>
          <div className="sessions-header mb-4">
            <h2>
              <FaCalendarAlt className="me-2" />
              My Sessions
            </h2>
            <p className="text-muted">
              Manage and track all your tutoring sessions
            </p>
          </div>

          {error && (
            <Alert variant="danger" dismissible onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          {/* Filters and Search */}
          <Card className="mb-4">
            <Card.Body>
              <Row className="align-items-center">
                <Col md={8}>
                  <div className="d-flex flex-wrap gap-2">
                    <FaFilter className="align-self-center text-muted me-2" />
                    {statusOptions.map((option) => (
                      <Button
                        key={option.value}
                        variant={
                          filter === option.value
                            ? option.variant
                            : "outline-secondary"
                        }
                        size="sm"
                        onClick={() => setFilter(option.value)}
                        className="filter-btn"
                      >
                        {option.label}
                        {filter === option.value && (
                          <Badge bg="light" text="dark" className="ms-2">
                            {option.value === "all"
                              ? sessions.length
                              : sessions.filter(
                                  (s) => s.status === option.value
                                ).length}
                          </Badge>
                        )}
                      </Button>
                    ))}
                  </div>
                </Col>
                <Col md={4}>
                  <Form.Control
                    type="text"
                    placeholder="Search sessions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input"
                  />
                </Col>
              </Row>
            </Card.Body>
          </Card>

          {/* Sessions List */}
          {filteredSessions.length === 0 ? (
            <Card className="text-center py-5">
              <Card.Body>
                <FaCalendarAlt size={48} className="text-muted mb-3" />
                <h5>No sessions found</h5>
                <p className="text-muted">
                  {filter === "all"
                    ? "You haven't booked any sessions yet."
                    : `No ${filter} sessions found.`}
                </p>
                {filter === "all" && (
                  <Button
                    variant="primary"
                    onClick={() => navigate("/student/tutors")}
                    className="mt-2"
                  >
                    Find Tutors
                  </Button>
                )}
              </Card.Body>
            </Card>
          ) : (
            <Row>
              {filteredSessions.map((session) => {
                console.log("Rendering session:", session);
                const { date, time } = formatDateTime(session.startTime);
                const endTime = formatDateTime(session.endTime).time;

                return (
                  <Col key={session.id} lg={6} className="mb-4">
                    <Card className={`session-card h-100 ${session.status}`}>
                      <Card.Body>
                        <div className="d-flex justify-content-between align-items-start mb-3">
                          <Badge
                            bg={getStatusVariant(session.status)}
                            className="status-badge"
                          >
                            {session.status.charAt(0).toUpperCase() +
                              session.status.slice(1)}
                          </Badge>
                          <Button
                            variant="outline-primary"
                            size="sm"
                            onClick={() => handleViewDetails(session.id)}
                          >
                            <FaEye className="me-1" />
                            Details
                          </Button>
                        </div>

                        <div className="session-info">
                          <h5 className="session-subject">{session.subject}</h5>
                          {session.description && (
                            <p className="session-topic text-muted">
                              {session.description}
                            </p>
                          )}

                          <div className="tutor-info mb-3">
                            <div className="d-flex align-items-center">
                              <img
                                src={formatImageUrl(
                                  session.tutor?.profileImage
                                )}
                                alt={session.tutor?.name}
                                className="tutor-avatar me-2"
                                onError={(e) => {
                                  e.target.src = "/images/default-avatar.png";
                                }}
                              />
                              <div>
                                <div className="d-flex align-items-center">
                                  <FaUser
                                    className="me-1 text-muted"
                                    size={12}
                                  />
                                  <span className="tutor-name">
                                    {session.tutor?.name}
                                  </span>
                                </div>
                                {session.mode && (
                                  <div className="d-flex align-items-center mt-1">
                                    <FaMapMarkerAlt
                                      className="me-1 text-muted"
                                      size={12}
                                    />
                                    <small className="text-muted">
                                      {session.mode
                                        .replace("_", " ")
                                        .replace(/\b\w/g, (l) =>
                                          l.toUpperCase()
                                        )}
                                    </small>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="session-time">
                            <div className="d-flex align-items-center mb-2">
                              <FaCalendarAlt className="me-2 text-muted" />
                              <span>{date}</span>
                            </div>
                            <div className="d-flex align-items-center">
                              <FaClock className="me-2 text-muted" />
                              <span>
                                {time} - {endTime}
                              </span>
                            </div>
                          </div>

                          {session.status === "scheduled" &&
                            session.meetingLink && (
                              <Button
                                variant="success"
                                size="sm"
                                className="mt-3 w-100"
                                onClick={() => handleJoinSession(session)}
                              >
                                Join Session
                              </Button>
                            )}
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                );
              })}
            </Row>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default Sessions;
