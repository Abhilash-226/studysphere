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
} from "react-bootstrap";
import {
  FaArrowLeft,
  FaCalendarAlt,
  FaClock,
  FaVideo,
  FaRupeeSign,
  FaPaperPlane,
  FaStar,
  FaCheckCircle,
  FaGraduationCap,
  FaBook,
  FaEdit,
  FaInfoCircle,
} from "react-icons/fa";
import { HiSparkles } from "react-icons/hi";
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
        navigate("/student/dashboard", {
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
      <div className="book-session-page">
        <Container>
          <Row className="justify-content-center align-items-center min-vh-75">
            <Col md={6} lg={5}>
              <Card className="success-card">
                <Card.Body className="text-center p-5">
                  <div className="success-icon-wrapper">
                    <FaCheckCircle size={60} />
                  </div>
                  <h3 className="mt-4 mb-3">Request Sent Successfully!</h3>
                  <p className="text-muted mb-4">
                    Your session request has been sent to{" "}
                    <strong>{tutorData?.name}</strong>. You'll receive a
                    notification when they respond.
                  </p>
                  <Button
                    variant="primary"
                    size="lg"
                    className="px-5"
                    onClick={() => navigate("/student/dashboard")}
                  >
                    Go to Dashboard
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>
    );
  }

  // Loading state while fetching tutor data
  if (tutorLoading) {
    return (
      <div className="book-session-page">
        <Container>
          <Row className="justify-content-center align-items-center min-vh-75">
            <Col md={6}>
              <Card className="loading-card">
                <Card.Body className="text-center py-5">
                  <div className="loading-spinner">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  </div>
                  <h5 className="mt-4">Loading tutor information...</h5>
                  <p className="text-muted">Please wait a moment</p>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>
    );
  }

  // Error state if tutor data couldn't be loaded
  if (!tutorData) {
    return (
      <div className="book-session-page">
        <Container>
          <Row className="justify-content-center align-items-center min-vh-75">
            <Col md={6}>
              <Card className="error-card">
                <Card.Body className="text-center py-5">
                  <div className="error-icon">😕</div>
                  <h5 className="mt-3">Tutor not found</h5>
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
      </div>
    );
  }

  return (
    <div className="book-session-page">
      {/* Page Header */}
      <div className="page-header">
        <div className="header-content">
          <Button
            variant="link"
            className="back-button"
            onClick={() => navigate(-1)}
            aria-label="Back"
          >
            <FaArrowLeft />
          </Button>
          <h1 className="page-title">Book Your Session</h1>
        </div>
      </div>

      <Container className="main-content">
        {error && (
          <Alert
            variant="danger"
            dismissible
            onClose={() => setError("")}
            className="mb-4"
          >
            <FaInfoCircle className="me-2" />
            {error}
          </Alert>
        )}

        <Row className="g-4">
          {/* Tutor Profile Card */}
          <Col lg={4}>
            <div className="tutor-card-wrapper">
              <Card className="tutor-info-card">
                <div className="tutor-card-header">
                  <div className="online-badge">
                    <FaVideo /> Online Session
                  </div>
                </div>
                <Card.Body>
                  <div className="tutor-profile">
                    <div className="avatar-wrapper">
                      <img
                        src={formatImageUrl(
                          tutorData?.image || tutorData?.profileImage
                        )}
                        alt={tutorData?.name}
                        className="tutor-avatar"
                        onError={handleImageError}
                      />
                      <div className="avatar-ring"></div>
                    </div>
                    <h4 className="tutor-name">{tutorData?.name}</h4>
                    {tutorData?.rating && (
                      <div className="tutor-rating">
                        <FaStar className="star-icon" />
                        <span>{tutorData.rating}</span>
                      </div>
                    )}
                  </div>

                  <div className="rate-badge">
                    <FaRupeeSign />
                    <span className="rate-amount">{tutorData?.hourlyRate}</span>
                    <span className="rate-period">/hour</span>
                  </div>

                  <div className="tutor-subjects">
                    <div className="section-label">
                      <FaGraduationCap />
                      <span>Expertise</span>
                    </div>
                    <div className="subjects-grid">
                      {tutorData?.subjects && tutorData.subjects.length > 0 ? (
                        tutorData.subjects.map((subject, index) => (
                          <span key={index} className="subject-chip">
                            {subject}
                          </span>
                        ))
                      ) : (
                        <span className="text-muted">No subjects listed</span>
                      )}
                    </div>
                  </div>

                  {tutorData?.bio && (
                    <div className="tutor-bio">
                      <div className="section-label">
                        <FaInfoCircle />
                        <span>About</span>
                      </div>
                      <p>{tutorData.bio}</p>
                    </div>
                  )}
                </Card.Body>
              </Card>

              {/* Quick Info */}
              <div className="quick-info">
                <div className="info-item">
                  <FaVideo className="info-icon" />
                  <span>HD Video Call</span>
                </div>
                <div className="info-item">
                  <FaCheckCircle className="info-icon" />
                  <span>Instant Confirmation</span>
                </div>
              </div>
            </div>
          </Col>

          {/* Booking Form */}
          <Col lg={8}>
            <Card className="booking-form-card">
              <Card.Body className="p-4">
                <Form onSubmit={handleSubmit}>
                  {/* Section: What to Learn */}
                  <div className="form-section">
                    <div className="section-header">
                      <div className="section-icon">
                        <FaBook />
                      </div>
                      <h5>What would you like to learn?</h5>
                    </div>

                    <Row className="g-3">
                      <Col md={6}>
                        <Form.Group>
                          <Form.Label>Subject</Form.Label>
                          <Form.Select
                            name="subject"
                            value={formData.subject}
                            onChange={handleChange}
                            className="custom-select"
                            required
                          >
                            <option value="">Choose a subject</option>
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
                        <Form.Group>
                          <Form.Label>Session Title</Form.Label>
                          <Form.Control
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            className="custom-input"
                            placeholder="e.g., Calculus Fundamentals"
                            required
                          />
                        </Form.Group>
                      </Col>
                      <Col xs={12}>
                        <Form.Group>
                          <Form.Label>
                            Description{" "}
                            <span className="optional-tag">Optional</span>
                          </Form.Label>
                          <Form.Control
                            as="textarea"
                            rows={2}
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            className="custom-textarea"
                            placeholder="Describe what you'd like to cover or any specific questions..."
                          />
                        </Form.Group>
                      </Col>
                    </Row>
                  </div>

                  {/* Section: Schedule */}
                  <div className="form-section">
                    <div className="section-header">
                      <div className="section-icon">
                        <FaCalendarAlt />
                      </div>
                      <h5>When do you want to meet?</h5>
                    </div>

                    <Row className="g-3">
                      <Col md={4}>
                        <Form.Group>
                          <Form.Label>
                            <FaCalendarAlt className="label-icon" /> Date
                          </Form.Label>
                          <Form.Control
                            type="date"
                            name="selectedDate"
                            value={formData.selectedDate}
                            onChange={handleChange}
                            className="custom-input"
                            min={new Date().toISOString().split("T")[0]}
                            required
                          />
                        </Form.Group>
                      </Col>
                      <Col md={4}>
                        <Form.Group>
                          <Form.Label>
                            <FaClock className="label-icon" /> Start Time
                          </Form.Label>
                          <Form.Control
                            type="time"
                            name="startTime"
                            value={formData.startTime}
                            onChange={handleChange}
                            className="custom-input"
                            required
                          />
                        </Form.Group>
                      </Col>
                      <Col md={4}>
                        <Form.Group>
                          <Form.Label>
                            <FaClock className="label-icon" /> Duration
                          </Form.Label>
                          <Form.Select
                            name="duration"
                            value={formData.duration}
                            onChange={handleChange}
                            className="custom-select"
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
                  </div>

                  {/* Section: Message */}
                  <div className="form-section">
                    <div className="section-header">
                      <div className="section-icon">
                        <FaEdit />
                      </div>
                      <h5>Message to Tutor (Optional)</h5>
                    </div>

                    <Form.Group>
                      <Form.Control
                        as="textarea"
                        rows={2}
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        className="custom-textarea"
                        placeholder="Any special requirements or questions..."
                      />
                    </Form.Group>
                  </div>

                  {/* Price Summary */}
                  {proposedPrice > 0 && (
                    <div className="price-summary">
                      <div className="price-header">
                        <HiSparkles className="sparkle-icon" />
                        <span>Session Summary</span>
                      </div>
                      <div className="price-details">
                        <div className="price-row">
                          <span>Duration</span>
                          <span>{formData.duration} minutes</span>
                        </div>
                        <div className="price-row">
                          <span>Rate</span>
                          <span>₹{tutorData?.hourlyRate}/hour</span>
                        </div>
                        <div className="price-row total">
                          <span>Total</span>
                          <span className="total-amount">₹{proposedPrice}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="form-actions">
                    <Button
                      variant="outline-secondary"
                      className="cancel-btn"
                      onClick={() => navigate(-1)}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      className="submit-btn"
                      disabled={loading || proposedPrice <= 0}
                    >
                      {loading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <FaPaperPlane className="me-2" />
                          Send Request
                        </>
                      )}
                    </Button>
                  </div>
                </Form>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default BookSessionPage;
