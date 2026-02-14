/**
 * ClassroomDetailsPage
 * View detailed information about an offline classroom
 * Includes contact options for students
 */

import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Badge,
  Button,
  Spinner,
  Alert,
  Carousel,
  Modal,
  Form,
} from "react-bootstrap";
import {
  FaMapMarkerAlt,
  FaClock,
  FaUsers,
  FaRupeeSign,
  FaCheckCircle,
  FaPhone,
  FaWhatsapp,
  FaEnvelope,
  FaArrowLeft,
  FaGraduationCap,
  FaChalkboardTeacher,
  FaCalendarAlt,
  FaBuilding,
  FaWifi,
  FaParking,
  FaSnowflake,
  FaBook,
  FaMapPin,
  FaShare,
  FaHeart,
  FaRegHeart,
} from "react-icons/fa";
import { useParams, useNavigate } from "react-router-dom";
import offlineClassroomService from "../../services/offlineClassroom.service";
import { formatImageUrl } from "../../utils/imageUtils";
import "./ClassroomDetailsPage.css";

// Facility icons mapping
const facilityIcons = {
  wifi: FaWifi,
  parking: FaParking,
  ac: FaSnowflake,
  library: FaBook,
};

const ClassroomDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [classroom, setClassroom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showContactModal, setShowContactModal] = useState(false);
  const [inquiryMessage, setInquiryMessage] = useState("");
  const [inquirySending, setInquirySending] = useState(false);
  const [inquirySuccess, setInquirySuccess] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    fetchClassroomDetails();
  }, [id]);

  const fetchClassroomDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await offlineClassroomService.getClassroomById(id);
      if (response.success) {
        setClassroom(response.classroom);
      } else {
        setError("Classroom not found");
      }
    } catch (err) {
      setError("Failed to load classroom details");
    } finally {
      setLoading(false);
    }
  };

  const handleInquiry = async () => {
    try {
      setInquirySending(true);
      await offlineClassroomService.recordInquiry(id, {
        message: inquiryMessage,
      });
      setInquirySuccess(true);
      setTimeout(() => {
        setShowContactModal(false);
        setInquirySuccess(false);
        setInquiryMessage("");
      }, 2000);
    } catch (err) {
      // Silent fail for inquiry tracking
    } finally {
      setInquirySending(false);
    }
  };

  const handleWhatsAppClick = () => {
    if (classroom?.contactInfo?.whatsapp) {
      const phone = classroom.contactInfo.whatsapp.replace(/\D/g, "");
      const message = encodeURIComponent(
        `Hi, I found your classroom "${classroom.name}" on StudySphere. I'm interested in joining. Can you please share more details?`,
      );
      window.open(`https://wa.me/91${phone}?text=${message}`, "_blank");
      handleInquiry();
    }
  };

  const handlePhoneClick = () => {
    if (classroom?.contactInfo?.phone) {
      window.location.href = `tel:${classroom.contactInfo.phone}`;
      handleInquiry();
    }
  };

  const handleEmailClick = () => {
    if (classroom?.contactInfo?.email) {
      const subject = encodeURIComponent(`Inquiry about ${classroom.name}`);
      const body = encodeURIComponent(
        `Hi,\n\nI found your classroom "${classroom.name}" on StudySphere. I'm interested in joining.\n\nPlease share more details about:\n- Available batches\n- Fee structure\n- Starting dates\n\nThank you!`,
      );
      window.location.href = `mailto:${classroom.contactInfo.email}?subject=${subject}&body=${body}`;
      handleInquiry();
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: classroom?.name,
          text: `Check out this classroom: ${classroom?.name}`,
          url: window.location.href,
        });
      } catch (err) {
        // User cancelled or share failed
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("Link copied to clipboard!");
    }
  };

  const formatSchedule = (schedule) => {
    if (!schedule) return [];
    const dayLabels = {
      monday: "Mon",
      tuesday: "Tue",
      wednesday: "Wed",
      thursday: "Thu",
      friday: "Fri",
      saturday: "Sat",
      sunday: "Sun",
    };
    return schedule.days?.map((d) => dayLabels[d] || d) || [];
  };

  const formatFee = (feeStructure) => {
    if (!feeStructure) return "";
    const periodLabels = {
      per_session: "per session",
      weekly: "per week",
      monthly: "per month",
      quarterly: "per quarter",
      yearly: "per year",
    };
    return {
      amount: `₹${feeStructure.amount?.toLocaleString()}`,
      period: periodLabels[feeStructure.period] || "",
    };
  };

  if (loading) {
    return (
      <div className="classroom-details-page">
        <Container className="py-5 text-center">
          <Spinner animation="border" variant="primary" />
          <p className="mt-3 text-muted">Loading classroom details...</p>
        </Container>
      </div>
    );
  }

  if (error || !classroom) {
    return (
      <div className="classroom-details-page">
        <Container className="py-5">
          <Alert variant="danger">
            {error || "Classroom not found"}
            <Button
              variant="link"
              onClick={() => navigate("/classrooms")}
              className="ms-2"
            >
              Back to Classrooms
            </Button>
          </Alert>
        </Container>
      </div>
    );
  }

  const fee = formatFee(classroom.feeStructure);
  const scheduleDays = formatSchedule(classroom.schedule);

  return (
    <div className="classroom-details-page">
      <Container>
        {/* Back Button */}
        <Button
          variant="link"
          className="back-button"
          onClick={() => navigate("/classrooms")}
        >
          <FaArrowLeft className="me-2" />
          Back to Classrooms
        </Button>

        {/* Hero Section - Side by Side Layout */}
        <div className="hero-section">
          <div className="hero-content">
            {/* Image Gallery */}
            <div className="hero-gallery">
              {classroom.images && classroom.images.length > 0 ? (
                <Carousel className="gallery-carousel">
                  {classroom.images.map((image, index) => (
                    <Carousel.Item key={index}>
                      <img
                        src={formatImageUrl(image)}
                        alt={`${classroom.name} - Image ${index + 1}`}
                        className="gallery-image"
                      />
                    </Carousel.Item>
                  ))}
                </Carousel>
              ) : (
                <div className="no-image-placeholder">
                  <FaBook size={48} />
                  <p>No images available</p>
                </div>
              )}
            </div>

            {/* Quick Info Card */}
            <div className="hero-info">
              <div className="quick-info-card">
                <div className="classroom-header-compact">
                  <h1 className="classroom-title">
                    {classroom.name}
                    {classroom.isVerified && (
                      <Badge bg="success" className="verified-badge-inline">
                        <FaCheckCircle className="me-1" />
                        Verified
                      </Badge>
                    )}
                  </h1>
                  <div className="header-actions">
                    <Button
                      variant="outline-secondary"
                      onClick={() => setIsSaved(!isSaved)}
                    >
                      {isSaved ? <FaHeart /> : <FaRegHeart />}
                    </Button>
                    <Button variant="outline-secondary" onClick={handleShare}>
                      <FaShare />
                    </Button>
                  </div>
                </div>

                <div className="quick-meta">
                  <div className="meta-item">
                    <FaMapMarkerAlt />
                    <span>
                      {classroom.location?.area}, {classroom.location?.city}
                    </span>
                  </div>
                  <div className="meta-item">
                    <FaUsers />
                    <span>
                      {classroom.batchInfo?.batchType === "individual"
                        ? "Individual Classes"
                        : `Group (Max ${classroom.batchInfo?.maxStudents})`}
                    </span>
                  </div>
                </div>

                {/* Fee Display */}
                <div className="fee-display">
                  <span className="fee-amount">{fee.amount}</span>
                  <span className="fee-period">{fee.period}</span>
                </div>

                {/* Contact Buttons */}
                <div className="contact-buttons">
                  {classroom.contactInfo?.whatsapp && (
                    <Button
                      variant="success"
                      className="contact-btn whatsapp"
                      onClick={handleWhatsAppClick}
                    >
                      <FaWhatsapp />
                      WhatsApp
                    </Button>
                  )}
                  {classroom.contactInfo?.phone && (
                    <Button
                      variant="primary"
                      className="contact-btn phone"
                      onClick={handlePhoneClick}
                    >
                      <FaPhone />
                      Call
                    </Button>
                  )}
                </div>
                {classroom.contactInfo?.email && (
                  <Button
                    variant="secondary"
                    className="contact-btn email w-100"
                    onClick={handleEmailClick}
                  >
                    <FaEnvelope />
                    Email
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Two Column Content */}
        <Row className="g-4 mt-2">
          {/* Left Column */}
          <Col lg={7}>
            {/* Subjects & Grades */}
            <Card className="info-card mb-3">
              <Row>
                <Col md={classroom.targetGrades?.length > 0 ? 7 : 12}>
                  <div className="subjects-section">
                    <h6>
                      <FaBook className="me-2" />
                      Subjects Offered
                    </h6>
                    <div className="subjects-list">
                      {classroom.subjects?.map((subject) => (
                        <Badge
                          key={subject}
                          bg="primary"
                          className="subject-badge"
                        >
                          {subject}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </Col>
                {classroom.targetGrades &&
                  classroom.targetGrades.length > 0 && (
                    <Col md={5}>
                      <div className="grades-section-inline">
                        <h6>
                          <FaGraduationCap className="me-2" />
                          For Grades
                        </h6>
                        <div className="grades-list">
                          {classroom.targetGrades.map((grade) => (
                            <Badge
                              key={grade}
                              bg="secondary"
                              className="grade-badge"
                            >
                              {grade}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </Col>
                  )}
              </Row>
            </Card>

            {/* Description */}
            <Card className="info-card mb-3">
              <h5>
                <FaChalkboardTeacher className="me-2" />
                About This Classroom
              </h5>
              <p className="description-text">{classroom.description}</p>
            </Card>

            {/* Location */}
            <Card className="info-card mb-3">
              <h5>
                <FaMapPin className="me-2" />
                Location
              </h5>
              <div className="location-details">
                <p>
                  <strong>Address:</strong> {classroom.location?.address}
                </p>
                {classroom.location?.landmark && (
                  <p>
                    <strong>Landmark:</strong> {classroom.location?.landmark}
                  </p>
                )}
                <p>
                  <strong>Area:</strong> {classroom.location?.area},{" "}
                  {classroom.location?.city}
                </p>
                <p>
                  <strong>Pincode:</strong> {classroom.location?.pincode}
                </p>
              </div>
            </Card>
          </Col>

          {/* Right Column */}
          <Col lg={5}>
            {/* Schedule */}
            <Card className="info-card mb-3">
              <h5>
                <FaCalendarAlt className="me-2" />
                Class Schedule
              </h5>
              <div className="schedule-section">
                <div className="schedule-days">
                  {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(
                    (day) => (
                      <span
                        key={day}
                        className={`day-badge ${
                          scheduleDays.includes(day) ? "active" : ""
                        }`}
                      >
                        {day}
                      </span>
                    ),
                  )}
                </div>
                <div className="schedule-time">
                  <FaClock className="me-2" />
                  {classroom.schedule?.startTime} -{" "}
                  {classroom.schedule?.endTime}
                </div>
              </div>
            </Card>

            {/* Tutor Card */}
            {classroom.tutor && (
              <Card className="tutor-card mb-3">
                <h5>
                  <FaChalkboardTeacher className="me-2" />
                  Instructor
                </h5>
                <div className="tutor-info">
                  <img
                    src={formatImageUrl(classroom.tutor.profileImage)}
                    alt={classroom.tutor.name}
                    className="tutor-image"
                    onError={(e) => {
                      e.target.src = "/images/avatar-placeholder.jpg";
                    }}
                  />
                  <div className="tutor-details">
                    <h6>{classroom.tutor.name}</h6>
                    {classroom.tutor.qualifications && (
                      <p className="tutor-qualifications">
                        {classroom.tutor.qualifications.slice(0, 2).join(", ")}
                      </p>
                    )}
                    {classroom.tutor.experience && (
                      <span className="tutor-experience">
                        {classroom.tutor.experience} years experience
                      </span>
                    )}
                  </div>
                </div>
              </Card>
            )}

            {/* Batch Info */}
            <Card className="info-card mb-3">
              <h5>
                <FaUsers className="me-2" />
                Batch Details
              </h5>
              <div className="batch-info">
                <div className="info-row">
                  <span className="info-label">Batch Type</span>
                  <span className="info-value">
                    {classroom.batchInfo?.batchType === "individual"
                      ? "Individual"
                      : classroom.batchInfo?.batchType === "group"
                        ? "Group"
                        : "Individual & Group"}
                  </span>
                </div>
                {classroom.batchInfo?.batchType !== "individual" && (
                  <div className="info-row">
                    <span className="info-label">Batch Size</span>
                    <span className="info-value">
                      {classroom.batchInfo?.currentStudents || 0}/
                      {classroom.batchInfo?.maxStudents} students
                    </span>
                  </div>
                )}
              </div>
            </Card>

            {/* Facilities */}
            {classroom.facilities && classroom.facilities.length > 0 && (
              <Card className="info-card mb-3">
                <h5>
                  <FaBuilding className="me-2" />
                  Facilities
                </h5>
                <div className="facilities-list">
                  {classroom.facilities.map((facility) => {
                    const IconComponent =
                      facilityIcons[facility.toLowerCase()] || FaCheckCircle;
                    return (
                      <div key={facility} className="facility-item">
                        <IconComponent className="facility-icon" />
                        <span>{facility}</span>
                      </div>
                    );
                  })}
                </div>
              </Card>
            )}
          </Col>
        </Row>
      </Container>

      {/* Contact Modal */}
      <Modal
        show={showContactModal}
        onHide={() => setShowContactModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Contact Tutor</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {inquirySuccess ? (
            <Alert variant="success">
              <FaCheckCircle className="me-2" />
              Your inquiry has been sent!
            </Alert>
          ) : (
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Message (Optional)</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={inquiryMessage}
                  onChange={(e) => setInquiryMessage(e.target.value)}
                  placeholder="Introduce yourself and mention what you're looking for..."
                />
              </Form.Group>
            </Form>
          )}
        </Modal.Body>
        {!inquirySuccess && (
          <Modal.Footer>
            <Button
              variant="secondary"
              onClick={() => setShowContactModal(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleInquiry}
              disabled={inquirySending}
            >
              {inquirySending ? (
                <>
                  <Spinner size="sm" className="me-2" />
                  Sending...
                </>
              ) : (
                "Send Inquiry"
              )}
            </Button>
          </Modal.Footer>
        )}
      </Modal>
    </div>
  );
};

export default ClassroomDetailsPage;
