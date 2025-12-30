import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Container, Spinner, Alert, Button, Modal } from "react-bootstrap";
import {
  FaStar,
  FaMapMarkerAlt,
  FaGraduationCap,
  FaBriefcase,
  FaClock,
  FaCalendarAlt,
  FaVideo,
  FaUsers,
  FaCheckCircle,
  FaChevronLeft,
  FaBookOpen,
  FaUserGraduate,
  FaEnvelope,
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
  const [activeTab, setActiveTab] = useState("about");

  // Check if user is logged in and is a student
  const isStudent = isAuthenticated() && getUserRole() === "student";

  // Helper functions for teaching mode checks
  const hasOnlineMode = () => {
    if (!tutor?.teachingMode) return false;
    if (Array.isArray(tutor.teachingMode)) {
      return tutor.teachingMode.some(
        (mode) => mode === "online" || mode.startsWith("online_")
      );
    }
    return (
      tutor.teachingMode === "online" ||
      tutor.teachingMode.startsWith("online_")
    );
  };

  const hasOfflineMode = () => {
    if (!tutor?.teachingMode) return false;
    if (Array.isArray(tutor.teachingMode)) {
      return tutor.teachingMode.some(
        (mode) => mode === "offline" || mode.startsWith("offline_")
      );
    }
    return (
      tutor.teachingMode === "offline" ||
      tutor.teachingMode.startsWith("offline_")
    );
  };

  // Handle profile image loading errors with fallback chain
  const handleImageError = (e) => {
    e.target.onerror = null;
    if (e.target.src.includes("tutor-placeholder.svg")) {
      e.target.src = "/images/tutor-placeholder.jpg";
    } else if (e.target.src.includes("tutor-placeholder.jpg")) {
      e.target.src = "/images/avatar-placeholder.jpg";
    } else {
      e.target.src = "/images/tutors/tutor-placeholder.svg";
    }
  };

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
        navigate(
          "/login-student?message=You need to login as a student to book a session"
        );
      }
    } else {
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
      <div className="tutor-details-loading">
        <Spinner animation="border" variant="primary" />
        <p>Loading tutor profile...</p>
      </div>
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
    <div className="tutor-details-page">
      {/* Hero Section */}
      <div className="tutor-hero">
        <Container>
          <Link to="/tutors" className="tutor-hero__back">
            <FaChevronLeft /> Back to Tutors
          </Link>

          <div className="tutor-hero__content">
            <div className="tutor-hero__avatar-section">
              <div className="tutor-hero__avatar-wrapper">
                <img
                  src={formatImageUrl(tutor.image || tutor.profileImage)}
                  alt={`${tutor.name}'s profile`}
                  className="tutor-hero__avatar"
                  onError={handleImageError}
                  loading="lazy"
                />
                {tutor.rating && (
                  <div className="tutor-hero__rating-badge">
                    <FaStar /> {tutor.rating}
                  </div>
                )}
              </div>

              <div className="tutor-hero__modes">
                {hasOnlineMode() && (
                  <span className="tutor-hero__mode tutor-hero__mode--online">
                    <FaVideo /> Online
                  </span>
                )}
                {hasOfflineMode() && (
                  <span className="tutor-hero__mode tutor-hero__mode--offline">
                    <FaUsers /> In-Person
                  </span>
                )}
              </div>
            </div>

            <div className="tutor-hero__info">
              <div className="tutor-hero__title-row">
                <h1 className="tutor-hero__name">{tutor.name}</h1>
                {tutor.rating && (
                  <span className="tutor-hero__verified">
                    <FaCheckCircle /> Verified
                  </span>
                )}
              </div>

              <p className="tutor-hero__specialization">
                {tutor.specialization}
              </p>

              <div className="tutor-hero__meta">
                {tutor.experience && (
                  <span className="tutor-hero__meta-item">
                    <FaBriefcase /> {tutor.experience} years experience
                  </span>
                )}
                {tutor.location && (
                  <span className="tutor-hero__meta-item">
                    <FaMapMarkerAlt /> {tutor.location.city}
                    {tutor.location.state && `, ${tutor.location.state}`}
                  </span>
                )}
                {tutor.reviews > 0 && (
                  <span className="tutor-hero__meta-item">
                    <FaStar /> {tutor.reviews} reviews
                  </span>
                )}
              </div>

              {hasOnlineMode() && (
                <div className="tutor-hero__price">
                  <span className="tutor-hero__price-amount">
                    ₹{tutor.hourlyRate || 500}
                  </span>
                  <span className="tutor-hero__price-unit">/hour</span>
                </div>
              )}

              <div className="tutor-hero__actions">
                {hasOnlineMode() && (
                  <button
                    className="tutor-hero__btn tutor-hero__btn--primary"
                    onClick={handleBookSession}
                  >
                    <FaCalendarAlt /> Book a Session
                  </button>
                )}
                <ContactTutorButton
                  tutorId={tutor.userId}
                  tutorName={tutor.name}
                  className="tutor-hero__btn tutor-hero__btn--outline"
                />
              </div>

              {!hasOnlineMode() && hasOfflineMode() && (
                <p className="tutor-hero__offline-note">
                  <FaEnvelope /> Contact the tutor directly to discuss in-person
                  sessions and fees.
                </p>
              )}
            </div>
          </div>
        </Container>
      </div>

      {/* Content Section */}
      <div className="tutor-content">
        <Container>
          {/* Tabs Navigation */}
          <div className="tutor-tabs">
            <button
              className={`tutor-tabs__btn ${
                activeTab === "about" ? "tutor-tabs__btn--active" : ""
              }`}
              onClick={() => setActiveTab("about")}
            >
              <FaUserGraduate /> About
            </button>
            <button
              className={`tutor-tabs__btn ${
                activeTab === "subjects" ? "tutor-tabs__btn--active" : ""
              }`}
              onClick={() => setActiveTab("subjects")}
            >
              <FaBookOpen /> Subjects
            </button>
            <button
              className={`tutor-tabs__btn ${
                activeTab === "schedule" ? "tutor-tabs__btn--active" : ""
              }`}
              onClick={() => setActiveTab("schedule")}
            >
              <FaClock /> Availability
            </button>
          </div>

          {/* Tab Content */}
          <div className="tutor-tab-content">
            {activeTab === "about" && (
              <div className="tutor-section">
                <div className="tutor-section__card">
                  <h3 className="tutor-section__title">About {tutor.name}</h3>
                  <p className="tutor-section__bio">
                    {tutor.bio || "No bio provided."}
                  </p>
                </div>

                <div className="tutor-section__grid">
                  <div className="tutor-info-card">
                    <div className="tutor-info-card__icon">
                      <FaGraduationCap />
                    </div>
                    <div className="tutor-info-card__content">
                      <h4>Education</h4>
                      <p className="tutor-info-card__main">
                        {tutor.qualification}
                      </p>
                      {tutor.university && <p>{tutor.university}</p>}
                      {tutor.graduationYear && (
                        <p>Class of {tutor.graduationYear}</p>
                      )}
                    </div>
                  </div>

                  <div className="tutor-info-card">
                    <div className="tutor-info-card__icon">
                      <FaBriefcase />
                    </div>
                    <div className="tutor-info-card__content">
                      <h4>Experience</h4>
                      <p className="tutor-info-card__main">
                        {tutor.experience} years
                      </p>
                      <p>of teaching experience</p>
                    </div>
                  </div>

                  {tutor.location && (
                    <div className="tutor-info-card">
                      <div className="tutor-info-card__icon">
                        <FaMapMarkerAlt />
                      </div>
                      <div className="tutor-info-card__content">
                        <h4>Location</h4>
                        <p className="tutor-info-card__main">
                          {tutor.location.city}
                        </p>
                        <p>
                          {tutor.location.state}
                          {tutor.location.country &&
                            `, ${tutor.location.country}`}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === "subjects" && (
              <div className="tutor-section">
                <div className="tutor-section__card">
                  <h3 className="tutor-section__title">Subjects Taught</h3>
                  {tutor.subjects && tutor.subjects.length > 0 ? (
                    <div className="tutor-subjects-grid">
                      {tutor.subjects.map((subject, index) => (
                        <div key={index} className="tutor-subject-card">
                          <FaBookOpen className="tutor-subject-card__icon" />
                          <span>{subject}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="tutor-section__empty">
                      No subjects specified.
                    </p>
                  )}
                </div>
              </div>
            )}

            {activeTab === "schedule" && (
              <div className="tutor-section">
                <div className="tutor-section__card">
                  <h3 className="tutor-section__title">
                    Availability Schedule
                  </h3>
                  {tutor.availability && tutor.availability.length > 0 ? (
                    <div className="tutor-schedule">
                      {tutor.availability.map((slot, index) => (
                        <div key={index} className="tutor-schedule__slot">
                          <div className="tutor-schedule__day">
                            <FaCalendarAlt />
                            <span>{slot.day}</span>
                          </div>
                          <div className="tutor-schedule__time">
                            <FaClock />
                            <span>
                              {slot.startTime} - {slot.endTime}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="tutor-section__empty">
                      No availability schedule provided.
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </Container>
      </div>

      {/* Booking Modal */}
      <Modal
        show={showBookingModal}
        onHide={() => setShowBookingModal(false)}
        centered
        className="booking-modal"
      >
        <Modal.Header closeButton>
          <Modal.Title>Book a Session</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="booking-modal__content">
            <img
              src={formatImageUrl(tutor.image || tutor.profileImage)}
              alt={tutor.name}
              className="booking-modal__avatar"
              onError={handleImageError}
            />
            <h4>{tutor.name}</h4>
            <p className="booking-modal__specialization">
              {tutor.specialization}
            </p>
            <div className="booking-modal__price">
              <span className="booking-modal__price-label">Hourly Rate:</span>
              <span className="booking-modal__price-amount">
                ₹{tutor.hourlyRate || 500}/hour
              </span>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <button
            className="booking-modal__btn booking-modal__btn--secondary"
            onClick={() => setShowBookingModal(false)}
          >
            Cancel
          </button>
          <button
            className="booking-modal__btn booking-modal__btn--primary"
            onClick={redirectToBooking}
          >
            Proceed to Booking
          </button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default TutorDetailsPage;
