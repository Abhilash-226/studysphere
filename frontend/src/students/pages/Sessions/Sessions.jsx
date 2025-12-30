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
  Modal,
} from "react-bootstrap";
import {
  FaCalendarAlt,
  FaClock,
  FaUser,
  FaMapMarkerAlt,
  FaFilter,
  FaEye,
  FaCheck,
  FaTimes,
  FaExclamationCircle,
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
    { value: "pending_completion", label: "Pending Approval", variant: "info" },
    { value: "completed", label: "Completed", variant: "success" },
    { value: "cancelled", label: "Cancelled", variant: "danger" },
    { value: "rescheduled", label: "Rescheduled", variant: "warning" },
  ];

  // State for rejection modal
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectingSessionId, setRejectingSessionId] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

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

      const response = await sessionService.getStudentSessions();

      if (response && response.success) {
        setSessions(response.sessions || []);
      } else {
        setError("Failed to load sessions");
      }
    } catch (err) {
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
    if (!sessionId || sessionId === "undefined") {
      setError("Invalid session ID. Cannot view details.");
      return;
    }
    navigate(`/student/sessions/${sessionId}`);
  };

  const handleJoinSession = (session) => {
    // Navigate to classroom for online sessions
    if (session.mode === "online") {
      navigate(`/student/classroom/${session.id || session._id}`);
    } else if (session.meetingLink) {
      window.open(session.meetingLink, "_blank");
    } else {
      setError("This is not an online session");
    }
  };

  // Handle approving session completion
  const handleApproveCompletion = async (sessionId) => {
    try {
      setActionLoading(true);
      const result = await sessionService.approveSessionCompletion(sessionId);
      if (result.success) {
        setError(null);
        fetchSessions(); // Refresh sessions
      } else {
        setError(result.message || "Failed to approve completion");
      }
    } catch (err) {
      setError("Failed to approve session completion");
    } finally {
      setActionLoading(false);
    }
  };

  // Open rejection modal
  const handleOpenRejectModal = (sessionId) => {
    setRejectingSessionId(sessionId);
    setRejectionReason("");
    setShowRejectModal(true);
  };

  // Handle rejecting session completion
  const handleRejectCompletion = async () => {
    if (!rejectingSessionId) return;

    try {
      setActionLoading(true);
      const result = await sessionService.rejectSessionCompletion(
        rejectingSessionId,
        rejectionReason
      );
      if (result.success) {
        setError(null);
        setShowRejectModal(false);
        setRejectingSessionId(null);
        setRejectionReason("");
        fetchSessions(); // Refresh sessions
      } else {
        setError(result.message || "Failed to reject completion");
      }
    } catch (err) {
      setError("Failed to reject session completion");
    } finally {
      setActionLoading(false);
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
                            session.mode === "online" && (
                              <Button
                                variant="success"
                                size="sm"
                                className="mt-3 w-100"
                                onClick={() => handleJoinSession(session)}
                              >
                                Join Session
                              </Button>
                            )}

                          {/* Pending completion approval section */}
                          {session.status === "pending_completion" && (
                            <div className="pending-approval-section mt-3 p-3 bg-light rounded">
                              <div className="d-flex align-items-center mb-2">
                                <FaExclamationCircle className="text-info me-2" />
                                <strong className="text-info">
                                  Completion Approval Required
                                </strong>
                              </div>
                              <p className="text-muted small mb-3">
                                Your tutor has marked this session as complete.
                                Please confirm if the session was completed
                                satisfactorily.
                              </p>
                              {session.completionRequest?.notes && (
                                <p className="text-muted small mb-3">
                                  <strong>Tutor's notes:</strong>{" "}
                                  {session.completionRequest.notes}
                                </p>
                              )}
                              <div className="d-flex gap-2">
                                <Button
                                  variant="success"
                                  size="sm"
                                  onClick={() =>
                                    handleApproveCompletion(session.id)
                                  }
                                  disabled={actionLoading}
                                >
                                  <FaCheck className="me-1" />
                                  Approve
                                </Button>
                                <Button
                                  variant="outline-danger"
                                  size="sm"
                                  onClick={() =>
                                    handleOpenRejectModal(session.id)
                                  }
                                  disabled={actionLoading}
                                >
                                  <FaTimes className="me-1" />
                                  Reject
                                </Button>
                              </div>
                            </div>
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

      {/* Rejection Reason Modal */}
      <Modal show={showRejectModal} onHide={() => setShowRejectModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Reject Session Completion</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            Please provide a reason for rejecting this session completion. This
            will help the tutor understand your concerns.
          </p>
          <Form.Group>
            <Form.Label>Reason for Rejection</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="e.g., Session was not completed as scheduled, content was not covered, etc."
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowRejectModal(false)}>
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={handleRejectCompletion}
            disabled={actionLoading}
          >
            {actionLoading ? (
              <>
                <Spinner size="sm" animation="border" className="me-1" />
                Rejecting...
              </>
            ) : (
              "Reject Completion"
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default Sessions;
