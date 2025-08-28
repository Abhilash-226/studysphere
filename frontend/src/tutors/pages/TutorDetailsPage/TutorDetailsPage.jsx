import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Badge,
  Tab,
  Tabs,
  Spinner,
  Alert,
  Modal,
} from "react-bootstrap";
import {
  FaStar,
  FaMapMarkerAlt,
  FaGraduationCap,
  FaBriefcase,
  FaClock,
  FaCalendarAlt,
} from "react-icons/fa";
import ContactTutorButton from "../../../shared/components/Chat/ContactTutorButton";
import tutorService from "../../../shared/services/tutor.service";
import { useAuth } from "../../../shared/context/AuthContext";
import { formatImageUrl } from "../../../shared/utils/imageUtils";
import "./TutorDetailsPage.css";

const TutorDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, getUserRole } = useAuth();
  const [tutor, setTutor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showBookingModal, setShowBookingModal] = useState(false);

  // Check if user is logged in and is a student
  const isStudent = isAuthenticated() && getUserRole() === "student";

  useEffect(() => {
    const fetchTutorDetails = async () => {
      try {
        setLoading(true);
        const response = await tutorService.getTutorById(id);
        if (response.success) {
          setTutor(response.tutor);
        } else {
          setError(response.message || "Failed to load tutor details");
        }
      } catch (err) {
        console.error("Error fetching tutor details:", err);
        setError("Failed to load tutor details. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchTutorDetails();
  }, [id]);

  const handleBookSession = () => {
    if (isAuthenticated()) {
      if (getUserRole() === "student") {
        setShowBookingModal(true);
      } else {
        // If tutor trying to book a session
        navigate(
          "/login-student?message=You need to login as a student to book a session"
        );
      }
    } else {
      // Redirect to login if not authenticated
      navigate(
        "/login-student?message=Please login to book a session&redirect=/tutors/" +
          id
      );
    }
  };

  const redirectToBooking = () => {
    navigate(`/book/${id}`);
  };

  if (loading) {
    return (
      <Container
        className="d-flex justify-content-center align-items-center"
        style={{ minHeight: "60vh" }}
      >
        <Spinner animation="border" variant="primary" />
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-5">
        <Alert variant="danger">{error}</Alert>
        <Button variant="secondary" as={Link} to="/tutors">
          Back to Tutors
        </Button>
      </Container>
    );
  }

  if (!tutor) {
    return (
      <Container className="py-5">
        <Alert variant="info">Tutor not found.</Alert>
        <Button variant="secondary" as={Link} to="/tutors">
          Back to Tutors
        </Button>
      </Container>
    );
  }

  return (
    <Container className="tutor-details-container py-5">
      <Row className="mb-4">
        <Col>
          <Link to="/tutors" className="back-link">
            ← Back to All Tutors
          </Link>
        </Col>
      </Row>

      <Row>
        <Col md={4} className="mb-4">
          <Card className="tutor-sidebar">
            <Card.Body className="text-center">
              <div className="profile-image-wrapper mb-3">
                <img
                  src={formatImageUrl(tutor.image)}
                  alt={tutor.name}
                  className="profile-image"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "/images/tutors/tutor-placeholder.svg";
                  }}
                />
              </div>
              <h2 className="tutor-name">{tutor.name}</h2>
              <p className="tutor-specialization">{tutor.specialization}</p>

              <div className="tutor-rating mb-3">
                {tutor.rating ? (
                  <>
                    <span className="rating-value">{tutor.rating}</span>
                    <FaStar className="rating-star" />
                    <span className="rating-count">
                      ({tutor.reviews || 0} reviews)
                    </span>
                  </>
                ) : (
                  <span className="no-reviews">No reviews yet</span>
                )}
              </div>

              <div className="teaching-modes mb-3">
                {Array.isArray(tutor.teachingMode) ? (
                  tutor.teachingMode.map((mode) => (
                    <Badge key={mode} bg="info" className="me-2">
                      {mode === "online_individual"
                        ? "Online (Individual)"
                        : mode === "online_group"
                        ? "Online (Group)"
                        : mode === "offline_home"
                        ? "In-Person (Home)"
                        : mode === "offline_classroom"
                        ? "In-Person (Classroom)"
                        : mode}
                    </Badge>
                  ))
                ) : (
                  <Badge bg="info">{tutor.teachingMode}</Badge>
                )}
              </div>

              <div className="hourly-rate mb-4">
                <span className="rate-amount">${tutor.hourlyRate || 25}</span>
                <span className="rate-unit"> / hour</span>
              </div>

              <div className="action-buttons">
                <Button
                  variant="primary"
                  size="lg"
                  className="book-button w-100 mb-3"
                  onClick={handleBookSession}
                >
                  Book a Session
                </Button>
                <ContactTutorButton
                  tutorId={tutor._id}
                  tutorName={tutor.name}
                />
              </div>
            </Card.Body>
          </Card>

          {tutor.location && (
            <Card className="mt-4">
              <Card.Body>
                <h5 className="mb-3">
                  <FaMapMarkerAlt className="me-2" /> Location
                </h5>
                <p className="mb-0">
                  {tutor.location.city}
                  {tutor.location.state && `, ${tutor.location.state}`}
                  {tutor.location.country && `, ${tutor.location.country}`}
                </p>
              </Card.Body>
            </Card>
          )}
        </Col>

        <Col md={8}>
          <Tabs
            defaultActiveKey="about"
            id="tutor-details-tabs"
            className="mb-4"
          >
            <Tab eventKey="about" title="About">
              <Card>
                <Card.Body>
                  <h4 className="mb-3">About {tutor.name}</h4>
                  <p>{tutor.bio || "No bio provided."}</p>

                  <Row className="qualifications mt-4">
                    <Col sm={6} className="mb-3">
                      <h5 className="mb-3">
                        <FaGraduationCap className="me-2" /> Education
                      </h5>
                      <p>
                        <strong>{tutor.qualification}</strong>
                      </p>
                      {tutor.university && <p>{tutor.university}</p>}
                      {tutor.graduationYear && (
                        <p>Class of {tutor.graduationYear}</p>
                      )}
                    </Col>

                    <Col sm={6} className="mb-3">
                      <h5 className="mb-3">
                        <FaBriefcase className="me-2" /> Experience
                      </h5>
                      <p>{tutor.experience} years of teaching experience</p>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            </Tab>

            <Tab eventKey="subjects" title="Subjects">
              <Card>
                <Card.Body>
                  <h4 className="mb-3">Subjects Taught</h4>
                  <Row className="subjects-list">
                    {tutor.subjects && tutor.subjects.length > 0 ? (
                      tutor.subjects.map((subject, index) => (
                        <Col key={index} md={4} className="mb-3">
                          <Badge
                            bg="light"
                            text="dark"
                            className="p-2 subject-badge"
                          >
                            {subject}
                          </Badge>
                        </Col>
                      ))
                    ) : (
                      <Col>No subjects specified.</Col>
                    )}
                  </Row>
                </Card.Body>
              </Card>
            </Tab>

            <Tab eventKey="schedule" title="Availability">
              <Card>
                <Card.Body>
                  <h4 className="mb-3">
                    <FaClock className="me-2" /> Availability Schedule
                  </h4>
                  {tutor.availability && tutor.availability.length > 0 ? (
                    <div className="availability-schedule">
                      {tutor.availability.map((slot, index) => (
                        <div key={index} className="availability-slot">
                          <div className="day-label">
                            <FaCalendarAlt className="me-2" />
                            {slot.day}
                          </div>
                          <div className="time-slot">
                            {slot.startTime} - {slot.endTime}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p>No availability schedule provided.</p>
                  )}
                </Card.Body>
              </Card>
            </Tab>
          </Tabs>
        </Col>
      </Row>

      {/* Booking Confirmation Modal */}
      <Modal show={showBookingModal} onHide={() => setShowBookingModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Book a Session with {tutor.name}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Would you like to proceed with booking a tutoring session?</p>
          <p>
            Hourly Rate: <strong>${tutor.hourlyRate}/hour</strong>
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowBookingModal(false)}
          >
            Cancel
          </Button>
          <Button variant="primary" onClick={redirectToBooking}>
            Proceed to Booking
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default TutorDetailsPage;
