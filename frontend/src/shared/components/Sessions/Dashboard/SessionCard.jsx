import React, { useState } from "react";
import {
  Card,
  Badge,
  Button,
  Modal,
  Form,
  Row,
  Col,
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
import "./SessionCard.css";

/**
 * SessionCard - Individual session card component
 * @param {Object} props - Component props
 * @param {Object} props.session - Session data
 * @param {string} props.userRole - User role (student/tutor)
 * @param {Function} props.onAction - Callback for session actions
 * @returns {React.ReactElement} - Rendered component
 */
const SessionCard = ({ session, userRole, onAction }) => {
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("");
  const [actionData, setActionData] = useState({
    reason: "",
    notes: "",
    rating: 5,
    review: "",
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
      rating: 5,
      review: "",
    });
    setShowModal(true);
  };

  // Handle form submission
  const handleSubmit = () => {
    if (onAction) {
      onAction(session.id, modalType, actionData);
    }
    setShowModal(false);
  };

  // Get the other user (student for tutor, tutor for student)
  const otherUser = userRole === "student" ? session.tutor : session.student;
  const startDateTime = formatDateTime(session.startTime);
  const endDateTime = formatDateTime(session.endTime);
  const isUpcoming = new Date(session.startTime) > new Date();
  const canCancel = isUpcoming && session.status === "scheduled";
  const canComplete =
    userRole === "tutor" && session.status === "scheduled" && !isUpcoming;
  const canReview =
    userRole === "student" && session.status === "completed" && !session.rating;

  return (
    <>
      <Card className={`session-card ${session.status}`}>
        <Card.Body>
          {/* Header with status and price */}
          <div className="session-header">
            <Badge
              bg={getStatusVariant(session.status)}
              className="status-badge"
            >
              {session.status.charAt(0).toUpperCase() + session.status.slice(1)}
            </Badge>
            <div className="session-price">
              <FaDollarSign className="me-1" />${session.price}
            </div>
          </div>

          {/* Title and Subject */}
          <h5 className="session-title">{session.title}</h5>
          <Badge bg="outline-primary" className="subject-badge mb-3">
            {session.subject}
          </Badge>

          {/* Other User Info */}
          <div className="user-info">
            <img
              src={otherUser.profileImage || "/images/avatar-placeholder.jpg"}
              alt={otherUser.name}
              className="user-avatar"
            />
            <div className="user-details">
              <h6 className="user-name">{otherUser.name}</h6>
              <small className="text-muted">
                {userRole === "student" ? "Tutor" : "Student"}
              </small>
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
                  <span>In Person</span>
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
              <small className="text-muted">({session.rating}/5)</small>
            </div>
          )}

          {/* Description */}
          {session.description && (
            <p className="session-description">{session.description}</p>
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

            {canReview && (
              <Button
                variant="outline-primary"
                size="sm"
                onClick={() => handleModalAction("review")}
              >
                <FaStar className="me-1" />
                Review
              </Button>
            )}

            {session.status === "scheduled" && isUpcoming && (
              <OverlayTrigger
                placement="top"
                overlay={<Tooltip>Join session when it starts</Tooltip>}
              >
                <Button
                  variant="primary"
                  size="sm"
                  disabled={new Date(session.startTime) > new Date()}
                >
                  <FaVideo className="me-1" />
                  Join
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
            {modalType === "review" && "Review Session"}
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
                placeholder="Add any notes about the session..."
              />
            </Form.Group>
          )}

          {modalType === "review" && (
            <>
              <Form.Group className="mb-3">
                <Form.Label>Rating</Form.Label>
                <div className="rating-input">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <FaStar
                      key={star}
                      className={`rating-star ${
                        star <= actionData.rating ? "active" : ""
                      }`}
                      onClick={() =>
                        setActionData((prev) => ({ ...prev, rating: star }))
                      }
                    />
                  ))}
                </div>
              </Form.Group>
              <Form.Group>
                <Form.Label>Review (optional)</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={actionData.review}
                  onChange={(e) =>
                    setActionData((prev) => ({
                      ...prev,
                      review: e.target.value,
                    }))
                  }
                  placeholder="Share your experience with this session..."
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
            variant={modalType === "cancel" ? "danger" : "primary"}
            onClick={handleSubmit}
          >
            {modalType === "cancel" && "Cancel Session"}
            {modalType === "complete" && "Mark Complete"}
            {modalType === "review" && "Submit Review"}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

SessionCard.propTypes = {
  session: PropTypes.object.isRequired,
  userRole: PropTypes.oneOf(["student", "tutor"]).isRequired,
  onAction: PropTypes.func,
};

export default SessionCard;
