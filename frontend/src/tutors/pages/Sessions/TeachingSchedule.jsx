import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
  ButtonGroup,
  Dropdown,
} from "react-bootstrap";
import {
  FaCalendarAlt,
  FaClock,
  FaUser,
  FaMapMarkerAlt,
  FaEye,
  FaVideo,
  FaSearch,
  FaFilter,
  FaChartLine,
  FaRupeeSign,
} from "react-icons/fa";
import sessionService from "../../../shared/services/session.service";
import { formatImageUrl } from "../../../shared/utils/imageUtils";
import "./TeachingSchedule.css";

const TeachingSchedule = () => {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState([]);
  const [filteredSessions, setFilteredSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  // Session status options for filtering (tutor perspective)
  const statusOptions = [
    { value: "all", label: "All Sessions", variant: "secondary" },
    { value: "scheduled", label: "Upcoming", variant: "primary" },
    { value: "pending_completion", label: "Pending Approval", variant: "info" },
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

      const response = await sessionService.getTutorSessions();

      if (response && response.success) {
        setSessions(response.sessions || []);
      } else {
        setError("Failed to load sessions");
      }
    } catch (err) {
      if (err.message && err.message.includes("404")) {
        setError(
          "Tutor profile not found. Please complete your profile setup."
        );
      } else if (err.message && err.message.includes("401")) {
        setError("Please log in to view your teaching schedule.");
      } else {
        setError("Unable to load sessions. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...sessions];

    // Filter by status
    if (filter !== "all") {
      filtered = filtered.filter((session) => session.status === filter);
    }

    // Filter by search term
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (session) =>
          session.subject?.toLowerCase().includes(searchLower) ||
          session.description?.toLowerCase().includes(searchLower) ||
          session.student?.name?.toLowerCase().includes(searchLower)
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
    if (!sessionId || sessionId === "undefined") {
      setError("Invalid session ID. Cannot view details.");
      return;
    }
    navigate(`/tutor/sessions/${sessionId}`);
  };

  const handleJoinSession = (session) => {
    // Navigate to classroom for online sessions
    if (session.mode === "online") {
      navigate(`/tutor/classroom/${session.id || session._id}`);
    } else if (session.meetingLink) {
      window.open(session.meetingLink, "_blank");
    } else {
      setError("This is not an online session");
    }
  };

  const handleMarkCompleted = async (sessionId) => {
    try {
      const result = await sessionService.markSessionCompleted(sessionId);
      if (result.success) {
        // Show success message that request was sent
        setError(null);
        alert("Completion request sent to student for approval.");
      }
      fetchSessions(); // Refresh the sessions list
    } catch (error) {
      setError("Failed to send completion request");
    }
  };

  const handleCancelSession = async (sessionId) => {
    try {
      await sessionService.cancelSession(sessionId);
      fetchSessions(); // Refresh the sessions list
    } catch (error) {
      setError("Failed to cancel session");
    }
  };

  if (loading) {
    return (
      <Container className="teaching-schedule-page py-4">
        <div className="text-center">
          <Spinner animation="border" variant="primary" />
          <p className="mt-3">Loading your teaching schedule...</p>
        </div>
      </Container>
    );
  }

  return (
    <Container className="teaching-schedule-page py-4">
      <Row>
        <Col>
          {/* Header */}
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h2 className="mb-1">
                <FaCalendarAlt className="me-2 text-primary" />
                My Teaching Schedule
              </h2>
              <p className="text-muted mb-0">
                Manage your sessions and track your teaching progress
              </p>
            </div>
            <div className="d-flex gap-2">
              <Button
                variant="outline-primary"
                onClick={() => navigate("/tutor/dashboard")}
              >
                <FaChartLine className="me-1" />
                Dashboard
              </Button>
            </div>
          </div>

          {/* Error Alert */}
          {error && (
            <Alert
              variant="danger"
              dismissible
              onClose={() => setError(null)}
              className="mb-4"
            >
              {error}
            </Alert>
          )}

          {/* Filters and Search */}
          <Card className="mb-4">
            <Card.Body>
              <Row className="align-items-center">
                <Col md={8}>
                  <div className="d-flex flex-wrap gap-2">
                    {statusOptions.map((option) => (
                      <Button
                        key={option.value}
                        variant={
                          filter === option.value
                            ? option.variant
                            : `outline-${option.variant}`
                        }
                        size="sm"
                        onClick={() => setFilter(option.value)}
                        className="filter-button"
                      >
                        {option.label}
                        {filter === option.value && (
                          <Badge bg="light" text="dark" className="ms-2">
                            {
                              sessions.filter(
                                (s) =>
                                  option.value === "all" ||
                                  s.status === option.value
                              ).length
                            }
                          </Badge>
                        )}
                      </Button>
                    ))}
                  </div>
                </Col>
                <Col md={4}>
                  <Form.Control
                    type="text"
                    placeholder="Search sessions or students..."
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
                    ? "You don't have any teaching sessions yet."
                    : `No ${filter} sessions found.`}
                </p>
                {filter === "all" && (
                  <Button
                    variant="primary"
                    onClick={() => navigate("/tutor/profile")}
                    className="mt-2"
                  >
                    Update Profile
                  </Button>
                )}
              </Card.Body>
            </Card>
          ) : (
            <Row>
              {filteredSessions.map((session) => {
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

                          <div className="student-info mb-3">
                            <div className="d-flex align-items-center">
                              <img
                                src={formatImageUrl(
                                  session.student?.profileImage
                                )}
                                alt={session.student?.name}
                                className="student-avatar me-2"
                                onError={(e) => {
                                  e.target.src =
                                    "/images/students/student-placeholder.svg";
                                }}
                              />
                              <div>
                                <div className="d-flex align-items-center">
                                  <FaUser
                                    className="me-1 text-muted"
                                    size={12}
                                  />
                                  <span className="student-name">
                                    {session.student?.name}
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
                            <div className="d-flex align-items-center mb-2">
                              <FaClock className="me-2 text-muted" />
                              <span>
                                {time} - {endTime}
                              </span>
                            </div>
                            {session.price && (
                              <div className="d-flex align-items-center">
                                <FaRupeeSign className="me-2 text-muted" />
                                <span className="fw-bold text-success">
                                  ₹{session.price}
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Session Actions */}
                          <div className="session-actions mt-3">
                            {session.status === "scheduled" && (
                              <div className="d-flex gap-2 flex-wrap">
                                {session.mode === "online" && (
                                  <Button
                                    variant="success"
                                    size="sm"
                                    onClick={() => handleJoinSession(session)}
                                  >
                                    <FaVideo className="me-1" />
                                    Start Session
                                  </Button>
                                )}
                                <Dropdown>
                                  <Dropdown.Toggle
                                    variant="outline-secondary"
                                    size="sm"
                                  >
                                    Actions
                                  </Dropdown.Toggle>
                                  <Dropdown.Menu>
                                    <Dropdown.Item
                                      onClick={() =>
                                        handleMarkCompleted(session.id)
                                      }
                                    >
                                      Request Completion
                                    </Dropdown.Item>
                                    <Dropdown.Item
                                      onClick={() =>
                                        handleCancelSession(session.id)
                                      }
                                      className="text-danger"
                                    >
                                      Cancel Session
                                    </Dropdown.Item>
                                  </Dropdown.Menu>
                                </Dropdown>
                              </div>
                            )}
                            {session.status === "pending_completion" && (
                              <div className="d-flex gap-2 flex-wrap align-items-center">
                                <Badge bg="info" className="py-2 px-3">
                                  <FaClock className="me-1" />
                                  Awaiting Student Approval
                                </Badge>
                              </div>
                            )}
                          </div>
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

export default TeachingSchedule;
