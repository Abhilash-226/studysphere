import React, { useState } from "react";
import {
  Card,
  Badge,
  Button,
  Modal,
  Form,
  OverlayTrigger,
  Tooltip,
} from "react-bootstrap";
import {
  FaCalendarAlt,
  FaClock,
  FaUser,
  FaVideo,
  FaMapMarkerAlt,
  FaStar,
  FaTimes,
  FaCheck,
  FaDollarSign,
  FaCommentDots,
} from "react-icons/fa";
import PropTypes from "prop-types";
import "./TutorSessionCard.css";

/**
 * TutorSessionCard - Session card component for tutors
 * @param {Object} props - Component props
 * @param {Object} props.session - Session data
 * @param {Function} props.onAction - Callback for session actions
 * @returns {React.ReactElement} - Rendered component
 */
const TutorSessionCard = ({ session, onAction }) => {
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("");
  const [actionData, setActionData] = useState({
    reason: "",
    notes: "",
    newStartTime: "",
    newEndTime: "",
  });

  // Format date and time
  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      }),
      time: date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }),
    };
  };

  // Get session duration
  const getSessionDuration = () => {
    const start = new Date(session.startTime);
    const end = new Date(session.endTime);
    const durationMs = end - start;
    const hours = Math.floor(durationMs / (1000 * 60 * 60));
    const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 0) {
      return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
    }
    return `${minutes}m`;
  };

  // Get status badge variant
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

  // Handle modal actions
  const handleModalAction = (type) => {
    setModalType(type);
    setActionData({
      reason: "",
      notes: "",
      newStartTime: "",
      newEndTime: "",
    });
    setShowModal(true);
  };

  // Handle form submission
  const handleSubmit = () => {
    if (onAction) {
      onAction(session._id, modalType, actionData);
    }
    setShowModal(false);
  };

  const startDateTime = formatDateTime(session.startTime);
  const endDateTime = formatDateTime(session.endTime);
  const isUpcoming = new Date(session.startTime) > new Date();
  const isPast = new Date(session.endTime) < new Date();
  const canCancel = isUpcoming && session.status === "scheduled";
  const canComplete = session.status === "scheduled" && isPast;
  const canReschedule = isUpcoming && session.status === "scheduled";

  return (
    <>
      <Card className={`tutor-session-card ${session.status}`}>
        <Card.Body>
          {/* Header with status and earnings */}
          <div className="session-header">
            <Badge
              bg={getStatusVariant(session.status)}
              className="status-badge"
            >
              {session.status.charAt(0).toUpperCase() + session.status.slice(1)}
            </Badge>
            <div className="session-earnings">
              <FaDollarSign className="me-1" />${session.price}
            </div>
          </div>

          {/* Title and Subject */}
          <h5 className="session-title">{session.title}</h5>
          <Badge bg="outline-primary" className="subject-badge mb-3">
            {session.subject}
          </Badge>

          {/* Student Info */}
          <div className="student-info">
            <img
              src={
                session.student?.profileImage ||
                "/images/avatar-placeholder.jpg"
              }
              alt={session.student?.name}
              className="student-avatar"
            />
            <div className="student-details">
              <h6 className="student-name">{session.student?.name}</h6>
              <small className="text-muted">Your Student</small>
            </div>
          </div>

          {/* Session Details */}
          <div className="session-details">
            <div className="detail-item">
              <FaCalendarAlt className="detail-icon" />
              <span>{startDateTime.date}</span>
            </div>
            <div className="detail-item">
              <FaClock className="detail-icon" />
              <span>
                {startDateTime.time} - {endDateTime.time} (
                {getSessionDuration()})
              </span>
            </div>
            <div className="detail-item">
              {session.mode === "online" ? (
                <>
                  <FaVideo className="detail-icon" />
                  <span>Online Session</span>
                </>
              ) : (
                <>
                  <FaMapMarkerAlt className="detail-icon" />
                  <span>In Person - {session.location || "Location TBD"}</span>
                </>
              )}
            </div>
          </div>

          {/* Rating (if completed and reviewed) */}
          {session.rating && (
            <div className="session-rating">
              <div className="rating-stars">
                {[...Array(5)].map((_, index) => (
                  <FaStar
                    key={index}
                    className={
                      index < session.rating ? "star-filled" : "star-empty"
                    }
                  />
                ))}
              </div>
              <small className="text-muted">
                Student rated ({session.rating}/5)
              </small>
            </div>
          )}

          {/* Description */}
          {session.description && (
            <p className="session-description">{session.description}</p>
          )}

          {/* Completion Notes */}
          {session.completionNotes && (
            <div className="completion-notes">
              <FaCommentDots className="me-2 text-muted" />
              <small className="text-muted">{session.completionNotes}</small>
            </div>
          )}

          {/* Action Buttons */}
          <div className="session-actions">
            {canCancel && (
              <Button
                variant="outline-danger"
                size="sm"
                onClick={() => handleModalAction("cancel")}
                className="me-2"
              >
                <FaTimes className="me-1" />
                Cancel
              </Button>
            )}

            {canComplete && (
              <Button
                variant="outline-success"
                size="sm"
                onClick={() => handleModalAction("complete")}
                className="me-2"
              >
                <FaCheck className="me-1" />
                Complete
              </Button>
            )}

            {canReschedule && (
              <Button
                variant="outline-warning"
                size="sm"
                onClick={() => handleModalAction("reschedule")}
                className="me-2"
              >
                <FaCalendarAlt className="me-1" />
                Reschedule
              </Button>
            )}

            {session.status === "scheduled" && isUpcoming && (
              <OverlayTrigger
                placement="top"
                overlay={<Tooltip>Start session when it begins</Tooltip>}
              >
                <Button
                  variant="primary"
                  size="sm"
                  disabled={new Date(session.startTime) > new Date()}
                >
                  <FaVideo className="me-1" />
                  Start Session
                </Button>
              </OverlayTrigger>
            )}
          </div>
        </Card.Body>
      </Card>

      {/* Action Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            {modalType === "cancel" && "Cancel Session"}
            {modalType === "complete" && "Complete Session"}
            {modalType === "reschedule" && "Reschedule Session"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {modalType === "cancel" && (
            <Form.Group>
              <Form.Label>Reason for cancellation</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={actionData.reason}
                onChange={(e) =>
                  setActionData((prev) => ({ ...prev, reason: e.target.value }))
                }
                placeholder="Please provide a reason for cancelling this session..."
              />
            </Form.Group>
          )}

          {modalType === "complete" && (
            <Form.Group>
              <Form.Label>Session notes (optional)</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={actionData.notes}
                onChange={(e) =>
                  setActionData((prev) => ({ ...prev, notes: e.target.value }))
                }
                placeholder="Add any notes about the session, topics covered, homework assigned, etc..."
              />
            </Form.Group>
          )}

          {modalType === "reschedule" && (
            <>
              <Form.Group className="mb-3">
                <Form.Label>New Start Time</Form.Label>
                <Form.Control
                  type="datetime-local"
                  value={actionData.newStartTime}
                  onChange={(e) =>
                    setActionData((prev) => ({
                      ...prev,
                      newStartTime: e.target.value,
                    }))
                  }
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>New End Time</Form.Label>
                <Form.Control
                  type="datetime-local"
                  value={actionData.newEndTime}
                  onChange={(e) =>
                    setActionData((prev) => ({
                      ...prev,
                      newEndTime: e.target.value,
                    }))
                  }
                />
              </Form.Group>
              <Form.Group>
                <Form.Label>Reason for rescheduling (optional)</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={2}
                  value={actionData.reason}
                  onChange={(e) =>
                    setActionData((prev) => ({
                      ...prev,
                      reason: e.target.value,
                    }))
                  }
                  placeholder="Optional reason for rescheduling..."
                />
              </Form.Group>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
          <Button
            variant={
              modalType === "cancel"
                ? "danger"
                : modalType === "complete"
                ? "success"
                : "warning"
            }
            onClick={handleSubmit}
          >
            {modalType === "cancel" && "Cancel Session"}
            {modalType === "complete" && "Mark Complete"}
            {modalType === "reschedule" && "Reschedule Session"}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

TutorSessionCard.propTypes = {
  session: PropTypes.object.isRequired,
  onAction: PropTypes.func,
};

export default TutorSessionCard;
