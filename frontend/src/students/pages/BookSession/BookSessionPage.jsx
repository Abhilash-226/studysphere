import React, { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  Alert,
  Badge,
  InputGroup,
} from "react-bootstrap";
import {
  FaArrowLeft,
  FaCalendarAlt,
  FaClock,
  FaUser,
  FaVideo,
  FaMapMarkerAlt,
  FaDollarSign,
  FaPaperPlane,
} from "react-icons/fa";
import sessionRequestService from "../../../shared/services/sessionRequestService";
import tutorService from "../../../shared/services/tutor.service";
import uploadService from "../../../shared/services/upload.service";
import { formatImageUrl } from "../../../shared/utils/imageUtils";
import { useAuth } from "../../../shared/context/AuthContext";
import "./BookSessionPage.css";

/**
 * BookSessionPage - Page for students to book sessions with tutors
 */
const BookSessionPage = () => {
  const navigate = useNavigate();
  const { tutorId } = useParams();
  const location = useLocation();
  const { user } = useAuth();

  // Get tutor data from navigation state or fetch it
  const [tutorData, setTutorData] = useState(location.state?.tutor || null);
  const [tutorLoading, setTutorLoading] = useState(!tutorData);

  const [formData, setFormData] = useState({
    subject: "",
    title: "",
    description: "",
    selectedDate: "",
    startTime: "",
    duration: "60", // Duration in minutes (default 1 hour)
    mode: "online", // Only online sessions
    message: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Handle profile image loading errors with fallback chain
  const handleImageError = (e) => {
    console.warn(`Failed to load tutor profile image:`, e.target.src);
    e.target.onerror = null;
    // Use consistent fallback image
    e.target.src = "/images/default-avatar.png";
  };
  const [success, setSuccess] = useState(false);

  // Fetch tutor data if not available from navigation state
  useEffect(() => {
    const fetchTutorData = async () => {
      if (!tutorData && tutorId) {
        try {
          setTutorLoading(true);
          const response = await tutorService.getTutorById(tutorId);
          console.log("Fetched tutor data:", response);

          const tutor = response.tutor || response;
          if (tutor && (tutor.image || tutor.profileImage)) {
            const imageUrl = tutor.image || tutor.profileImage;
            console.log("Tutor image data:", {
              image: tutor.image,
              profileImage: tutor.profileImage,
              selected: imageUrl,
            });
            uploadService.debugImagePath(imageUrl);
          }

          setTutorData(tutor);
        } catch (err) {
          setError("Failed to load tutor information");
          console.error("Error fetching tutor:", err);
        } finally {
          setTutorLoading(false);
        }
      } else {
        setTutorLoading(false);
        if (tutorData) {
          console.log("Tutor data from navigation:", tutorData);
          if (tutorData.image || tutorData.profileImage) {
            const imageUrl = tutorData.image || tutorData.profileImage;
            console.log("Navigation tutor image data:", {
              image: tutorData.image,
              profileImage: tutorData.profileImage,
              selected: imageUrl,
            });
            uploadService.debugImagePath(imageUrl);
          }
        }
      }
    };

    fetchTutorData();
  }, [tutorData, tutorId]);

  // Redirect if no tutor data and no tutorId
  useEffect(() => {
    if (!tutorData && !tutorId) {
      navigate("/tutors");
    }
  }, [tutorData, tutorId, navigate]);

  // Calculate proposed price based on duration and tutor's hourly rate
  const calculatePrice = () => {
    if (!formData.duration || !tutorData?.hourlyRate) {
      return 0;
    }

    const durationHours = parseInt(formData.duration) / 60;

    if (durationHours <= 0) {
      return 0;
    }

    return Math.round(durationHours * tutorData.hourlyRate * 100) / 100;
  };

  const proposedPrice = calculatePrice();

  // Handle form field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Create start and end time from date and time inputs
  const getSessionStartTime = () => {
    if (!formData.selectedDate || !formData.startTime) return null;
    return new Date(`${formData.selectedDate}T${formData.startTime}`);
  };

  const getSessionEndTime = () => {
    const startTime = getSessionStartTime();
    if (!startTime || !formData.duration) return null;
    return new Date(
      startTime.getTime() + parseInt(formData.duration) * 60 * 1000
    );
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    console.log("Form submission started");
    console.log("Form data:", formData);
    console.log("Tutor data:", tutorData);

    try {
      // Validate form
      if (
        !formData.subject ||
        !formData.title ||
        !formData.selectedDate ||
        !formData.startTime ||
        !formData.duration
      ) {
        throw new Error("Please fill in all required fields");
      }

      const startTime = getSessionStartTime();
      const endTime = getSessionEndTime();

      if (!startTime || !endTime) {
        throw new Error("Invalid date or time selected");
      }

      if (startTime <= new Date()) {
        throw new Error("Session time must be in the future");
      }

      if (proposedPrice <= 0) {
        throw new Error("Invalid session duration");
      }

      // Create session request
      const requestData = {
        tutorId: tutorData?.id || tutorId,
        subject: formData.subject,
        title: formData.title,
        description: formData.description,
        requestedStartTime: startTime.toISOString(),
        requestedEndTime: endTime.toISOString(),
        mode: formData.mode,
        location: null, // Always null for online sessions
        proposedPrice,
        message: formData.message,
      };

      console.log("Sending request data:", requestData);

      const result = await sessionRequestService.createSessionRequest(
        requestData
      );
      console.log("Request sent successfully:", result);
      setSuccess(true);

      // Redirect to dashboard after a short delay
      setTimeout(() => {
        navigate("/students/dashboard", {
          state: { message: "Session request sent successfully!" },
        });
      }, 2000);
    } catch (err) {
      console.error("Form submission error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <Container className="mt-5">
        <Row className="justify-content-center">
          <Col md={6}>
            <Card className="success-card">
              <Card.Body className="text-center">
                <FaPaperPlane size={48} className="text-success mb-3" />
                <h3>Request Sent Successfully!</h3>
                <p className="text-muted">
                  Your session request has been sent to {tutorData?.name}.
                  You'll be notified when they respond.
                </p>
                <Button
                  variant="primary"
                  onClick={() => navigate("/students/dashboard")}
                >
                  Go to Dashboard
                </Button>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    );
  }

  // Loading state while fetching tutor data
  if (tutorLoading) {
    return (
      <Container className="mt-5">
        <Row className="justify-content-center">
          <Col md={6}>
            <Card>
              <Card.Body className="text-center py-5">
                <div className="spinner-border text-primary mb-3" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <h5>Loading tutor information...</h5>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    );
  }

  // Error state if tutor data couldn't be loaded
  if (!tutorData) {
    return (
      <Container className="mt-5">
        <Row className="justify-content-center">
          <Col md={6}>
            <Card>
              <Card.Body className="text-center py-5">
                <h5>Tutor not found</h5>
                <p className="text-muted">
                  Unable to load tutor information. Please try again.
                </p>
                <Button variant="primary" onClick={() => navigate("/tutors")}>
                  Browse Tutors
                </Button>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    );
  }

  return (
    <Container className="book-session-page">
      {/* Header */}
      <Row className="mb-4">
        <Col>
          <div className="d-flex align-items-center mb-3">
            <Button
              variant="outline-secondary"
              size="sm"
              onClick={() => navigate(-1)}
              className="me-3"
            >
              <FaArrowLeft className="me-1" />
              Back
            </Button>
            <h2 className="mb-0">Book a Session</h2>
          </div>
        </Col>
      </Row>

      <Row>
        {/* Tutor Info Card */}
        <Col lg={4} className="mb-4">
          <Card className="tutor-info-card">
            <Card.Body>
              <div className="text-center mb-3">
                <img
                  src={formatImageUrl(
                    tutorData?.image || tutorData?.profileImage
                  )}
                  alt={tutorData?.name}
                  className="tutor-avatar"
                  onError={handleImageError}
                />
                <h5 className="mt-2">{tutorData?.name}</h5>
                <Badge bg="primary">${tutorData?.hourlyRate}/hour</Badge>
              </div>

              <div className="tutor-details">
                <h6>Subjects:</h6>
                <div className="subjects-list">
                  {tutorData?.subjects && tutorData.subjects.length > 0 ? (
                    tutorData.subjects.map((subject, index) => (
                      <Badge key={index} bg="secondary" className="me-1 mb-1">
                        {subject}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-muted">No subjects listed</span>
                  )}
                </div>

                {tutorData?.bio && (
                  <>
                    <h6 className="mt-3">About:</h6>
                    <p className="text-muted small">{tutorData.bio}</p>
                  </>
                )}
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* Booking Form */}
        <Col lg={8}>
          <Card className="booking-form-card">
            <Card.Header>
              <h5 className="mb-0">Session Details</h5>
            </Card.Header>
            <Card.Body>
              {error && (
                <Alert
                  variant="danger"
                  dismissible
                  onClose={() => setError("")}
                >
                  {error}
                </Alert>
              )}

              <Form onSubmit={handleSubmit}>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Subject *</Form.Label>
                      <Form.Select
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        required
                      >
                        <option value="">Select a subject</option>
                        {tutorData?.subjects &&
                        tutorData.subjects.length > 0 ? (
                          tutorData.subjects.map((subject, index) => (
                            <option key={index} value={subject}>
                              {subject}
                            </option>
                          ))
                        ) : (
                          <option value="General" key="general">
                            General Tutoring
                          </option>
                        )}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Session Title *</Form.Label>
                      <Form.Control
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        placeholder="e.g., Algebra Help, Essay Review"
                        required
                      />
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
                    onChange={handleChange}
                    placeholder="Describe what you'd like to work on..."
                  />
                </Form.Group>

                <Row>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Date *</Form.Label>
                      <Form.Control
                        type="date"
                        name="selectedDate"
                        value={formData.selectedDate}
                        onChange={handleChange}
                        min={new Date().toISOString().split("T")[0]}
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Start Time *</Form.Label>
                      <Form.Control
                        type="time"
                        name="startTime"
                        value={formData.startTime}
                        onChange={handleChange}
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
                        onChange={handleChange}
                        required
                      >
                        <option value="30">30 minutes</option>
                        <option value="60">1 hour</option>
                        <option value="90">1.5 hours</option>
                        <option value="120">2 hours</option>
                        <option value="180">3 hours</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>

                {/* Online Session Mode (Fixed) */}
                <Form.Group className="mb-3">
                  <Form.Label>Session Mode</Form.Label>
                  <div>
                    <Form.Check
                      type="radio"
                      id="mode-online"
                      name="mode"
                      value="online"
                      checked={true}
                      disabled={true}
                      label={
                        <span>
                          <FaVideo className="me-1" />
                          Online Session
                        </span>
                      }
                    />
                    <small className="text-muted">
                      Only online sessions are available for booking
                    </small>
                  </div>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Message to Tutor</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Any additional information for the tutor..."
                  />
                </Form.Group>

                {/* Price Display */}
                {proposedPrice > 0 && (
                  <Card className="price-card mb-3">
                    <Card.Body>
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <h6 className="mb-1">Estimated Cost</h6>
                          <small className="text-muted">
                            Based on{" "}
                            {tutorData?.hourlyRate
                              ? `$${tutorData.hourlyRate}/hour`
                              : "hourly rate"}
                          </small>
                        </div>
                        <div className="price-display">
                          <FaDollarSign className="me-1" />
                          <span className="price-amount">${proposedPrice}</span>
                        </div>
                      </div>
                    </Card.Body>
                  </Card>
                )}

                <div className="d-flex justify-content-end">
                  <Button
                    variant="secondary"
                    className="me-2"
                    onClick={() => navigate(-1)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    disabled={loading || proposedPrice <= 0}
                  >
                    {loading ? "Sending Request..." : "Send Request"}
                    <FaPaperPlane className="ms-2" />
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default BookSessionPage;
