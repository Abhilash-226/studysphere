import React, { useState, useEffect } from "react";
import { Modal, Form, Button, Row, Col, Alert, Badge } from "react-bootstrap";
import {
  FaCalendarAlt,
  FaClock,
  FaMapMarkerAlt,
  FaVideo,
  FaDollarSign,
} from "react-icons/fa";
import PropTypes from "prop-types";
import sessionService from "../../../services/session.service";
import { useAuth } from "../../../context/AuthContext";
import "./SessionBookingModal.css";

/**
 * SessionBookingModal - Modal component for booking sessions with tutors
 * @param {Object} props - Component props
 * @param {boolean} props.show - Whether modal is visible
 * @param {Function} props.onHide - Function to close modal
 * @param {Object} props.tutor - Tutor information
 * @param {Function} props.onBookingSuccess - Callback after successful booking
 * @returns {React.ReactElement} - Rendered component
 */
const SessionBookingModal = ({ show, onHide, tutor, onBookingSuccess }) => {
  const { currentUser } = useAuth();
  const [formData, setFormData] = useState({
    title: "",
    subject: "",
    description: "",
    startDate: "",
    startTime: "",
    duration: "1",
    mode: "online",
    location: {
      address: "",
      city: "",
      state: "",
      zipCode: "",
    },
    notes: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [totalPrice, setTotalPrice] = useState(0);

  // Calculate total price when duration changes
  useEffect(() => {
    if (tutor && formData.duration) {
      setTotalPrice(tutor.hourlyRate * parseFloat(formData.duration));
    }
  }, [tutor, formData.duration]);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (show) {
      setFormData({
        title: "",
        subject: tutor?.subjects?.[0] || "",
        description: "",
        startDate: "",
        startTime: "",
        duration: "1",
        mode: "online",
        location: {
          address: "",
          city: "",
          state: "",
          zipCode: "",
        },
        notes: "",
      });
      setError("");
      setSuccess("");
    }
  }, [show, tutor]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name.startsWith("location.")) {
      const locationField = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        location: {
          ...prev.location,
          [locationField]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      // Validate required fields
      if (
        !formData.title ||
        !formData.subject ||
        !formData.startDate ||
        !formData.startTime
      ) {
        throw new Error("Please fill in all required fields");
      }

      // Create start and end times
      const startDateTime = new Date(
        `${formData.startDate}T${formData.startTime}`
      );
      const endDateTime = new Date(
        startDateTime.getTime() + parseFloat(formData.duration) * 60 * 60 * 1000
      );

      // Validate start time is in the future
      if (startDateTime <= new Date()) {
        throw new Error("Session start time must be in the future");
      }

      // Prepare session data
      const sessionData = {
        tutorId: tutor._id,
        title: formData.title,
        subject: formData.subject,
        description: formData.description,
        startTime: startDateTime.toISOString(),
        endTime: endDateTime.toISOString(),
        mode: formData.mode,
        notes: formData.notes,
      };

      // Add location for offline sessions
      if (formData.mode === "offline") {
        sessionData.location = formData.location;
      }

      // Book the session
      const response = await sessionService.createSession(sessionData);

      if (response.success) {
        setSuccess("Session booked successfully!");
        setTimeout(() => {
          onHide();
          if (onBookingSuccess) {
            onBookingSuccess(response.session);
          }
        }, 2000);
      } else {
        throw new Error(response.message || "Failed to book session");
      }
    } catch (error) {
      console.error("Error booking session:", error);
      setError(error.message || "Failed to book session. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const durationOptions = [
    { value: "0.5", label: "30 minutes" },
    { value: "1", label: "1 hour" },
    { value: "1.5", label: "1.5 hours" },
    { value: "2", label: "2 hours" },
    { value: "2.5", label: "2.5 hours" },
    { value: "3", label: "3 hours" },
  ];

  const getMinDateTime = () => {
    const now = new Date();
    now.setHours(now.getHours() + 1); // Minimum 1 hour from now
    return now.toISOString().slice(0, 16);
  };

  if (!tutor) return null;

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>
          <FaCalendarAlt className="me-2" />
          Book Session with {tutor.name}
        </Modal.Title>
      </Modal.Header>

      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          {success && <Alert variant="success">{success}</Alert>}

          {/* Tutor Info Card */}
          <div className="tutor-info-card mb-4">
            <Row>
              <Col md={3} className="text-center">
                <img
                  src={tutor.profileImage || "/images/avatar-placeholder.jpg"}
                  alt={tutor.name}
                  className="tutor-avatar"
                />
              </Col>
              <Col md={9}>
                <h5>{tutor.name}</h5>
                <p className="text-muted mb-1">{tutor.specialization}</p>
                <div className="d-flex align-items-center mb-2">
                  <FaDollarSign className="me-1" />
                  <span className="fw-bold">${tutor.hourlyRate}/hour</span>
                </div>
                <div className="subjects">
                  {tutor.subjects?.map((subject, index) => (
                    <Badge key={index} bg="primary" className="me-1">
                      {subject}
                    </Badge>
                  ))}
                </div>
              </Col>
            </Row>
          </div>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Session Title *</Form.Label>
                <Form.Control
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="e.g., Algebra Help Session"
                  required
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Subject *</Form.Label>
                <Form.Select
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select a subject</option>
                  {tutor.subjects?.map((subject, index) => (
                    <option key={index} value={subject}>
                      {subject}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          <Form.Group className="mb-3">
            <Form.Label>Description</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Describe what you'd like to work on in this session..."
            />
          </Form.Group>

          <Row>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>Date *</Form.Label>
                <Form.Control
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleInputChange}
                  min={new Date().toISOString().split("T")[0]}
                  required
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>Time *</Form.Label>
                <Form.Control
                  type="time"
                  name="startTime"
                  value={formData.startTime}
                  onChange={handleInputChange}
                  required
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>Duration *</Form.Label>
                <Form.Select
                  name="duration"
                  value={formData.duration}
                  onChange={handleInputChange}
                  required
                >
                  {durationOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          <Form.Group className="mb-3">
            <Form.Label>Session Mode *</Form.Label>
            <div>
              <Form.Check
                inline
                type="radio"
                name="mode"
                value="online"
                label={
                  <>
                    <FaVideo className="me-1" />
                    Online
                  </>
                }
                checked={formData.mode === "online"}
                onChange={handleInputChange}
              />
              <Form.Check
                inline
                type="radio"
                name="mode"
                value="offline"
                label={
                  <>
                    <FaMapMarkerAlt className="me-1" />
                    In Person
                  </>
                }
                checked={formData.mode === "offline"}
                onChange={handleInputChange}
              />
            </div>
          </Form.Group>

          {formData.mode === "offline" && (
            <div className="location-fields mb-3">
              <Form.Label>Location Details</Form.Label>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-2">
                    <Form.Control
                      type="text"
                      name="location.address"
                      value={formData.location.address}
                      onChange={handleInputChange}
                      placeholder="Street Address"
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-2">
                    <Form.Control
                      type="text"
                      name="location.city"
                      value={formData.location.city}
                      onChange={handleInputChange}
                      placeholder="City"
                    />
                  </Form.Group>
                </Col>
              </Row>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-2">
                    <Form.Control
                      type="text"
                      name="location.state"
                      value={formData.location.state}
                      onChange={handleInputChange}
                      placeholder="State"
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-2">
                    <Form.Control
                      type="text"
                      name="location.zipCode"
                      value={formData.location.zipCode}
                      onChange={handleInputChange}
                      placeholder="ZIP Code"
                    />
                  </Form.Group>
                </Col>
              </Row>
            </div>
          )}

          <Form.Group className="mb-3">
            <Form.Label>Additional Notes</Form.Label>
            <Form.Control
              as="textarea"
              rows={2}
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              placeholder="Any special requests or notes for the tutor..."
            />
          </Form.Group>

          {/* Price Summary */}
          <div className="price-summary">
            <div className="d-flex justify-content-between align-items-center">
              <span>Duration: {formData.duration} hour(s)</span>
              <span>Rate: ${tutor.hourlyRate}/hour</span>
            </div>
            <hr />
            <div className="d-flex justify-content-between align-items-center fw-bold">
              <span>Total Price:</span>
              <span className="text-primary">${totalPrice.toFixed(2)}</span>
            </div>
          </div>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={onHide} disabled={loading}>
            Cancel
          </Button>
          <Button
            variant="primary"
            type="submit"
            disabled={
              loading ||
              !formData.title ||
              !formData.subject ||
              !formData.startDate ||
              !formData.startTime
            }
          >
            {loading
              ? "Booking..."
              : `Book Session - $${totalPrice.toFixed(2)}`}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

SessionBookingModal.propTypes = {
  show: PropTypes.bool.isRequired,
  onHide: PropTypes.func.isRequired,
  tutor: PropTypes.object,
  onBookingSuccess: PropTypes.func,
};

export default SessionBookingModal;
