import React, { useState } from "react";
import { Card, ListGroup, Badge, Button, Modal, Form } from "react-bootstrap";
import {
  FaCheck,
  FaTimes,
  FaCalendarCheck,
  FaUserGraduate,
} from "react-icons/fa";
import tutorService from "../../../../../shared/services/tutor.service";
import "./SessionRequestsSection.css";

/**
 * SessionRequestsSection - Component for displaying and handling tutor session requests
 * @param {Object} props - Component props
 * @param {Array} props.sessionRequests - List of session requests
 * @param {Function} props.onStatusChange - Function to call when a session status changes
 * @returns {React.ReactElement} - Rendered component
 */
const SessionRequestsSection = ({ sessionRequests = [], onStatusChange }) => {
  const [showModal, setShowModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [loading, setLoading] = useState(false);

  // Handle accept session request
  const handleAccept = async (sessionId) => {
    try {
      setLoading(true);
      await tutorService.acceptSession(sessionId);
      setLoading(false);

      if (onStatusChange) {
        onStatusChange();
      }
    } catch (error) {
      console.error("Error accepting session:", error);
      setLoading(false);
    }
  };

  // Open reject modal with session ID
  const openRejectModal = (sessionId) => {
    setCurrentSessionId(sessionId);
    setRejectReason("");
    setShowModal(true);
  };

  // Handle reject session request
  const handleReject = async () => {
    try {
      setLoading(true);
      await tutorService.rejectSession(currentSessionId, rejectReason);
      setShowModal(false);
      setLoading(false);

      if (onStatusChange) {
        onStatusChange();
      }
    } catch (error) {
      console.error("Error rejecting session:", error);
      setLoading(false);
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

        {sessionRequests.length === 0 ? (
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
                className="d-flex justify-content-between align-items-center session-request-item"
              >
                <div className="d-flex align-items-start">
                  <div className="session-time me-3 text-center">
                    <div className="fw-bold">
                      {formatDate(request.startTime)}
                    </div>
                    <div>{formatTime(request.startTime)}</div>
                  </div>
                  <div>
                    <div className="d-flex align-items-center mb-1">
                      <FaUserGraduate className="me-2 text-primary" />
                      <span className="fw-bold">
                        {request.student?.firstName} {request.student?.lastName}
                      </span>
                    </div>
                    <div className="d-flex align-items-center mb-2">
                      <Badge bg="info" className="me-2">
                        {request.subject}
                      </Badge>
                      <span className="text-muted">
                        {request.duration} minutes
                      </span>
                    </div>
                    {request.notes && (
                      <div className="session-request-notes text-muted">
                        <small>{request.notes}</small>
                      </div>
                    )}
                  </div>
                </div>
                <div className="session-request-actions">
                  <Button
                    variant="outline-success"
                    size="sm"
                    className="me-2"
                    onClick={() => handleAccept(request._id)}
                    disabled={loading}
                  >
                    <FaCheck className="me-1" /> Accept
                  </Button>
                  <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={() => openRejectModal(request._id)}
                    disabled={loading}
                  >
                    <FaTimes className="me-1" /> Reject
                  </Button>
                </div>
              </ListGroup.Item>
            ))}
          </ListGroup>
        )}
      </Card>

      {/* Reject Session Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Reject Session Request</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group>
            <Form.Label>Reason for rejection (optional)</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              placeholder="Provide a reason for rejecting this session request..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleReject} disabled={loading}>
            {loading ? "Rejecting..." : "Reject Session"}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default SessionRequestsSection;
