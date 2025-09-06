import React, { useState, useEffect } from "react";
import {
  Card,
  ListGroup,
  Badge,
  Button,
  Modal,
  Form,
  Alert,
} from "react-bootstrap";
import {
  FaCheck,
  FaTimes,
  FaCalendarCheck,
  FaUserGraduate,
  FaClock,
  FaMapMarkerAlt,
  FaVideo,
  FaDollarSign,
} from "react-icons/fa";
import sessionRequestService from "../../../../../shared/services/sessionRequestService";
import "./SessionRequestsSection.css";

/**
 * SessionRequestsSection - Component for displaying and handling tutor session requests
 * @param {Object} props - Component props
 * @param {Array} props.sessionRequests - Array of session requests (from real-time data)
 * @param {Function} props.onStatusChange - Function to call when a session status changes
 * @param {Function} props.onRefresh - Function to refresh session requests
 * @param {boolean} props.loading - Loading state
 * @returns {React.ReactElement} - Rendered component
 */
const SessionRequestsSection = ({
  sessionRequests: propSessionRequests = [],
  onStatusChange,
  onRefresh,
  loading: propLoading = false,
}) => {
  const [sessionRequests, setSessionRequests] = useState(propSessionRequests);
  const [loading, setLoading] = useState(propLoading);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [declineMessage, setDeclineMessage] = useState("");
  const [currentRequestId, setCurrentRequestId] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Update local state when props change (real-time updates)
  useEffect(() => {
    setSessionRequests(propSessionRequests);
    setLoading(propLoading);
  }, [propSessionRequests, propLoading]);

  // Fetch session requests on component mount (fallback if no props provided)
  useEffect(() => {
    if (propSessionRequests.length === 0 && !propLoading) {
      fetchSessionRequests();
    }
  }, []);

  const fetchSessionRequests = async () => {
    try {
      setLoading(true);
      setError("");
      const requests = await sessionRequestService.getRequestsForTutor();
      setSessionRequests(requests);
      if (onRefresh) {
        onRefresh(requests);
      }
    } catch (err) {
      setError("Failed to load session requests");
      console.error("Error fetching session requests:", err);
    } finally {
      setLoading(false);
    }
  };

  // Handle accept session request
  const handleAccept = async (requestId) => {
    try {
      setActionLoading(true);
      await sessionRequestService.acceptRequest(requestId);

      // Refresh the requests list
      await fetchSessionRequests();

      if (onStatusChange) {
        onStatusChange();
      }
    } catch (error) {
      console.error("Error accepting session:", error);

      let errorMessage = "Failed to accept session request";
      if (error.message && error.message.includes("Conflict")) {
        errorMessage =
          "Scheduling conflict: You already have a session scheduled at this time";
      }

      setError(errorMessage);
    } finally {
      setActionLoading(false);
    }
  };

  // Open decline modal with request ID
  const openDeclineModal = (requestId) => {
    setCurrentRequestId(requestId);
    setDeclineMessage("");
    setShowModal(true);
  };

  // Handle decline session request
  const handleDecline = async () => {
    try {
      setActionLoading(true);
      await sessionRequestService.declineRequest(
        currentRequestId,
        declineMessage
      );
      setShowModal(false);

      // Refresh the requests list
      await fetchSessionRequests();

      if (onStatusChange) {
        onStatusChange();
      }
    } catch (error) {
      setError("Failed to decline session request");
      console.error("Error declining session:", error);
    } finally {
      setActionLoading(false);
    }
  };

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
    <>
      <Card className="mb-4">
        <Card.Header className="d-flex justify-content-between align-items-center">
          <div className="d-flex align-items-center">
            <FaCalendarCheck className="me-2 text-primary" />
            <h5 className="mb-0">Session Requests</h5>
          </div>
          {sessionRequests.length > 0 && (
            <Badge bg="danger" pill>
              {sessionRequests.length}
            </Badge>
          )}
        </Card.Header>

        {error && (
          <Alert
            variant="danger"
            className="m-3"
            dismissible
            onClose={() => setError("")}
          >
            {error}
          </Alert>
        )}

        {loading ? (
          <Card.Body className="text-center py-4">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-2 text-muted">Loading session requests...</p>
          </Card.Body>
        ) : sessionRequests.length === 0 ? (
          <Card.Body className="text-center py-4">
            <div className="mb-3">
              <FaCalendarCheck size={48} className="text-muted" />
            </div>
            <h5>No Pending Requests</h5>
            <p className="text-muted">
              You don't have any pending session requests.
            </p>
          </Card.Body>
        ) : (
          <ListGroup variant="flush">
            {sessionRequests.map((request) => (
              <ListGroup.Item
                key={request._id}
                className="d-flex justify-content-between align-items-start session-request-item p-3"
              >
                <div className="flex-grow-1">
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <div>
                      <div className="d-flex align-items-center mb-1">
                        <FaUserGraduate className="me-2 text-primary" />
                        <span className="fw-bold">
                          {request.student?.firstName}{" "}
                          {request.student?.lastName}
                        </span>
                      </div>
                      <h6 className="mb-1">{request.title}</h6>
                    </div>
                    <div className="text-end">
                      <div className="d-flex align-items-center text-success mb-1">
                        <FaDollarSign className="me-1" />
                        <span className="fw-bold">
                          ${request.proposedPrice}
                        </span>
                      </div>
                      <Badge bg="info">{request.subject}</Badge>
                    </div>
                  </div>

                  <div className="row mb-2">
                    <div className="col-md-6">
                      <div className="d-flex align-items-center mb-1">
                        <FaClock className="me-2 text-muted" />
                        <small className="text-muted">
                          {formatDate(request.requestedStartTime)} •{" "}
                          {formatTime(request.requestedStartTime)} -{" "}
                          {formatTime(request.requestedEndTime)}
                        </small>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="d-flex align-items-center mb-1">
                        {request.mode === "online" ? (
                          <>
                            <FaVideo className="me-2 text-muted" />
                            <small className="text-muted">Online Session</small>
                          </>
                        ) : (
                          <>
                            <FaMapMarkerAlt className="me-2 text-muted" />
                            <small className="text-muted">
                              {request.location}
                            </small>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {request.description && (
                    <div className="mb-2">
                      <small className="text-muted fw-bold">Description:</small>
                      <p className="mb-1 small">{request.description}</p>
                    </div>
                  )}

                  {request.message && (
                    <div className="mb-2">
                      <small className="text-muted fw-bold">
                        Student Message:
                      </small>
                      <p className="mb-1 small text-muted">{request.message}</p>
                    </div>
                  )}

                  <div className="session-request-actions">
                    <Button
                      variant="outline-success"
                      size="sm"
                      className="me-2"
                      onClick={() => handleAccept(request._id)}
                      disabled={actionLoading}
                    >
                      <FaCheck className="me-1" /> Accept
                    </Button>
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => openDeclineModal(request._id)}
                      disabled={actionLoading}
                    >
                      <FaTimes className="me-1" /> Decline
                    </Button>
                  </div>
                </div>
              </ListGroup.Item>
            ))}
          </ListGroup>
        )}
      </Card>

      {/* Decline Session Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Decline Session Request</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group>
            <Form.Label>Message to student (optional)</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              placeholder="Provide a reason or message for declining this session request..."
              value={declineMessage}
              onChange={(e) => setDeclineMessage(e.target.value)}
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={handleDecline}
            disabled={actionLoading}
          >
            {actionLoading ? "Declining..." : "Decline Request"}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default SessionRequestsSection;
