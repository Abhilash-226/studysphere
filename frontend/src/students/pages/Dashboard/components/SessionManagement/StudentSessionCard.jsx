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
  FaDollarSign,
  FaCommentDots,
} from "react-icons/fa";
import PropTypes from "prop-types";
import "./StudentSessionCard.css";

/**
 * StudentSessionCard - Session card component for students
 * @param {Object} props - Component props
 * @param {Object} props.session - Session data
 * @param {Function} props.onAction - Callback for session actions
 * @returns {React.ReactElement} - Rendered component
 */
const StudentSessionCard = ({ session, onAction }) => {
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("");
  const [actionData, setActionData] = useState({
    reason: "",
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
      rating: 5,
      review: "",
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
  const canCancel = isUpcoming && session.status === "scheduled";
  const canReview = session.status === "completed" && !session.rating;

  return (
    <>
      <Card className={`student-session-card ${session.status}`}>
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

          {/* Tutor Info */}
          <div className="tutor-info">
            <img
              src={
                session.tutor?.profileImage || "/images/avatar-placeholder.jpg"
              }
              alt={session.tutor?.name}
              className="tutor-avatar"
            />
            <div className="tutor-details">
              <h6 className="tutor-name">{session.tutor?.name}</h6>
              <small className="text-muted">Your Tutor</small>
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

            {canReview && (
              <Button
                variant="outline-primary"
                size="sm"
                onClick={() => handleModalAction("review")}
              >
                <FaStar className="me-1" />
                Rate & Review
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
                  Join Session
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
            {modalType === "review" && "Rate & Review Session"}
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

          {modalType === "review" && (
            <>
              <Form.Group className="mb-3">
                <Form.Label>How was your session?</Form.Label>
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
            {modalType === "review" && "Submit Review"}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

StudentSessionCard.propTypes = {
  session: PropTypes.object.isRequired,
  onAction: PropTypes.func,
};

export default StudentSessionCard;
