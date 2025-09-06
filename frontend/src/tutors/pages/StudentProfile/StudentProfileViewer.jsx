import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Container,
  Row,
  Col,
  Card,
  Badge,
  Button,
  ProgressBar,
  Tab,
  Tabs,
  Alert,
  ListGroup,
} from "react-bootstrap";
import {
  FaUser,
  FaGraduationCap,
  FaBrain,
  FaHistory,
  FaArrowLeft,
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaEnvelope,
  FaPhone,
  FaClock,
  FaCheckCircle,
} from "react-icons/fa";
import studentProfileService from "../../../shared/services/studentProfile.service";
import uploadService from "../../../shared/services/upload.service";
import "./StudentProfileViewer.css";

const StudentProfileViewer = () => {
  const { studentId } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    loadStudentProfile();
  }, [studentId]);

  const loadStudentProfile = async () => {
    try {
      setLoading(true);
      const response = await studentProfileService.getStudentProfile(studentId);

      if (response.success) {
        setStudent(response.student);
      } else {
        setError(response.message || "Failed to load student profile");
      }
    } catch (error) {
      console.error("Error loading student profile:", error);
      setError("Failed to load student profile");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleString("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  const getCompletionColor = (percentage) => {
    if (percentage >= 80) return "success";
    if (percentage >= 60) return "warning";
    return "danger";
  };

  if (loading) {
    return (
      <Container className="py-5">
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-5">
        <Alert variant="danger">{error}</Alert>
        <Button variant="primary" onClick={() => navigate(-1)}>
          <FaArrowLeft className="me-2" />
          Go Back
        </Button>
      </Container>
    );
  }

  if (!student) {
    return (
      <Container className="py-5">
        <Alert variant="warning">Student profile not found</Alert>
      </Container>
    );
  }

  return (
    <Container className="py-5">
      {/* Header */}
      <Row className="mb-4">
        <Col>
          <Button
            variant="outline-primary"
            onClick={() => navigate(-1)}
            className="mb-3"
          >
            <FaArrowLeft className="me-2" />
            Back to Dashboard
          </Button>

          <div className="student-profile-header">
            <Row className="align-items-center">
              <Col md={2}>
                <img
                  src={uploadService.getImageUrl(student.user.profileImage)}
                  alt={student.user.firstName}
                  className="profile-image"
                  style={{
                    width: "100px",
                    height: "100px",
                    borderRadius: "50%",
                    objectFit: "cover",
                    border: "4px solid white",
                  }}
                  onError={(e) => {
                    e.target.src = "/images/avatar-placeholder.jpg";
                  }}
                />
              </Col>
              <Col md={6}>
                <h2 className="mb-1">
                  {student.user.firstName} {student.user.lastName}
                </h2>
                <p className="mb-2">
                  <Badge bg="primary" text="white" className="me-2">
                    {student.personalInfo.academicLevel || "Student"}
                  </Badge>
                  <Badge bg="secondary" text="white">
                    {student.personalInfo.grade || "N/A"}
                  </Badge>
                </p>
                <p className="mb-0">
                  <FaGraduationCap className="me-2" />
                  {student.personalInfo.school || "School not specified"}
                </p>
                {student.location && (
                  <p className="mb-0">
                    <FaMapMarkerAlt className="me-2" />
                    {[
                      student.location.city,
                      student.location.state,
                      student.location.country,
                    ]
                      .filter(Boolean)
                      .join(", ")}
                  </p>
                )}
              </Col>
              <Col md={4} className="text-end">
                <div className="profile-stats">
                  <div className="mb-3">
                    <small>Profile Completion</small>
                    <ProgressBar
                      variant={getCompletionColor(
                        student.metadata.profileCompleteness
                      )}
                      now={student.metadata.profileCompleteness}
                      label={`${student.metadata.profileCompleteness}%`}
                      className="mb-2"
                    />
                  </div>
                  <div>
                    <small>
                      Member since: {formatDate(student.metadata.memberSince)}
                    </small>
                  </div>
                </div>
              </Col>
            </Row>
          </div>
        </Col>
      </Row>

      {/* Profile Tabs */}
      <Tabs
        activeKey={activeTab}
        onSelect={(k) => setActiveTab(k)}
        className="mb-4"
      >
        {/* Overview Tab */}
        <Tab
          eventKey="overview"
          title={
            <span>
              <FaUser className="me-2" />
              Overview
            </span>
          }
        >
          <Row>
            <Col md={8}>
              <Card className="mb-4">
                <Card.Body>
                  <h5>About {student.user.firstName}</h5>
                  {student.personalInfo.bio ? (
                    <p>{student.personalInfo.bio}</p>
                  ) : (
                    <p className="text-muted">No bio provided yet.</p>
                  )}

                  {student.personalInfo.interests &&
                    student.personalInfo.interests.length > 0 && (
                      <div className="mt-3">
                        <h6>Interests & Hobbies</h6>
                        <div>
                          {student.personalInfo.interests.map(
                            (interest, index) => (
                              <Badge
                                key={index}
                                bg="light"
                                text="dark"
                                className="me-2 mb-2"
                              >
                                {interest}
                              </Badge>
                            )
                          )}
                        </div>
                      </div>
                    )}
                </Card.Body>
              </Card>

              <Card className="mb-4">
                <Card.Body>
                  <h5>Academic Information</h5>
                  <Row>
                    <Col md={6}>
                      <h6>Subjects</h6>
                      {student.academicInfo.subjects &&
                      student.academicInfo.subjects.length > 0 ? (
                        <div className="mb-3">
                          {student.academicInfo.subjects.map(
                            (subject, index) => (
                              <Badge
                                key={index}
                                bg="primary"
                                text="white"
                                className="me-2 mb-2"
                              >
                                {subject}
                              </Badge>
                            )
                          )}
                        </div>
                      ) : (
                        <p className="text-muted mb-3">No subjects specified</p>
                      )}

                      <h6>Academic Goals</h6>
                      {student.academicInfo.academicGoals &&
                      student.academicInfo.academicGoals.length > 0 ? (
                        <ul className="mb-3">
                          {student.academicInfo.academicGoals.map(
                            (goal, index) => (
                              <li key={index}>{goal}</li>
                            )
                          )}
                        </ul>
                      ) : (
                        <p className="text-muted mb-3">
                          No academic goals specified
                        </p>
                      )}
                    </Col>
                    <Col md={6}>
                      <h6>Strengths</h6>
                      {student.academicInfo.strengths &&
                      student.academicInfo.strengths.length > 0 ? (
                        <div className="mb-3">
                          {student.academicInfo.strengths.map(
                            (strength, index) => (
                              <Badge
                                key={index}
                                bg="success"
                                text="white"
                                className="me-2 mb-2"
                              >
                                {strength}
                              </Badge>
                            )
                          )}
                        </div>
                      ) : (
                        <p className="text-muted mb-3">
                          No strengths specified
                        </p>
                      )}

                      <h6>Areas for Improvement</h6>
                      {student.academicInfo.areasForImprovement &&
                      student.academicInfo.areasForImprovement.length > 0 ? (
                        <div className="mb-3">
                          {student.academicInfo.areasForImprovement.map(
                            (area, index) => (
                              <Badge
                                key={index}
                                bg="warning"
                                text="dark"
                                className="me-2 mb-2"
                              >
                                {area}
                              </Badge>
                            )
                          )}
                        </div>
                      ) : (
                        <p className="text-muted mb-3">
                          No improvement areas specified
                        </p>
                      )}
                    </Col>
                  </Row>

                  {student.personalInfo.currentGPA && (
                    <div className="mt-3">
                      <h6>Current GPA</h6>
                      <Badge bg="info" text="white" className="fs-6">
                        {student.personalInfo.currentGPA}/4.0
                      </Badge>
                    </div>
                  )}
                </Card.Body>
              </Card>
            </Col>

            <Col md={4}>
              <Card className="mb-4">
                <Card.Body>
                  <h6>Learning Preferences</h6>

                  {student.learningPreferences.learningStyle &&
                    student.learningPreferences.learningStyle.length > 0 && (
                      <div className="mb-3">
                        <small className="text-muted">Learning Style</small>
                        <div>
                          {student.learningPreferences.learningStyle.map(
                            (style, index) => (
                              <Badge
                                key={index}
                                bg="outline-primary"
                                className="me-2 mb-1"
                              >
                                {style}
                              </Badge>
                            )
                          )}
                        </div>
                      </div>
                    )}

                  <div className="mb-3">
                    <small className="text-muted">Schedule Preference</small>
                    <div>
                      {student.learningPreferences.studySchedulePreference ||
                        "Not specified"}
                    </div>
                  </div>

                  {student.background.availableStudyTime && (
                    <div className="mb-3">
                      <small className="text-muted">Available Study Time</small>
                      <div>{student.background.availableStudyTime}</div>
                    </div>
                  )}

                  {student.learningPreferences.preferredTeachingMode &&
                    student.learningPreferences.preferredTeachingMode.length >
                      0 && (
                      <div className="mb-3">
                        <small className="text-muted">
                          Preferred Teaching Mode
                        </small>
                        <div>
                          {student.learningPreferences.preferredTeachingMode.map(
                            (mode, index) => (
                              <Badge
                                key={index}
                                bg="secondary"
                                className="me-2 mb-1"
                              >
                                {mode
                                  .replace(/_/g, " ")
                                  .replace(/\b\w/g, (l) => l.toUpperCase())}
                              </Badge>
                            )
                          )}
                        </div>
                      </div>
                    )}
                </Card.Body>
              </Card>

              {(student.parentInfo.parentName ||
                student.parentInfo.parentEmail) && (
                <Card className="mb-4">
                  <Card.Body>
                    <h6>Parent/Guardian Contact</h6>
                    {student.parentInfo.parentName && (
                      <div className="mb-2">
                        <small className="text-muted">Name</small>
                        <div>{student.parentInfo.parentName}</div>
                      </div>
                    )}
                    {student.parentInfo.parentEmail && (
                      <div className="mb-2">
                        <small className="text-muted">Email</small>
                        <div>
                          <FaEnvelope className="me-2" />
                          {student.parentInfo.parentEmail}
                        </div>
                      </div>
                    )}
                    {student.parentInfo.parentPhone && (
                      <div className="mb-2">
                        <small className="text-muted">Phone</small>
                        <div>
                          <FaPhone className="me-2" />
                          {student.parentInfo.parentPhone}
                        </div>
                      </div>
                    )}
                    {student.parentInfo.parentInvolvement && (
                      <div>
                        <small className="text-muted">Involvement Level</small>
                        <div>
                          <Badge bg="info">
                            {student.parentInfo.parentInvolvement}
                          </Badge>
                        </div>
                      </div>
                    )}
                  </Card.Body>
                </Card>
              )}
            </Col>
          </Row>
        </Tab>

        {/* Learning Details Tab */}
        <Tab
          eventKey="learning"
          title={
            <span>
              <FaBrain className="me-2" />
              Learning Details
            </span>
          }
        >
          <Row>
            <Col md={6}>
              <Card className="mb-4">
                <Card.Body>
                  <h5>Help Needed</h5>

                  <h6>Homework Help</h6>
                  {student.learningPreferences.homeworkHelpNeeds &&
                  student.learningPreferences.homeworkHelpNeeds.length > 0 ? (
                    <ul>
                      {student.learningPreferences.homeworkHelpNeeds.map(
                        (need, index) => (
                          <li key={index}>{need}</li>
                        )
                      )}
                    </ul>
                  ) : (
                    <p className="text-muted">
                      No specific homework help needs specified
                    </p>
                  )}

                  <h6>Exam Preparation</h6>
                  {student.learningPreferences.examPreparationNeeds &&
                  student.learningPreferences.examPreparationNeeds.length >
                    0 ? (
                    <ul>
                      {student.learningPreferences.examPreparationNeeds.map(
                        (need, index) => (
                          <li key={index}>{need}</li>
                        )
                      )}
                    </ul>
                  ) : (
                    <p className="text-muted">
                      No specific exam preparation needs specified
                    </p>
                  )}
                </Card.Body>
              </Card>
            </Col>

            <Col md={6}>
              <Card className="mb-4">
                <Card.Body>
                  <h5>Special Considerations</h5>

                  <div className="mb-3">
                    <h6>Previous Tutoring Experience</h6>
                    <div className="d-flex align-items-center">
                      {student.background.previousTutoringExperience ? (
                        <>
                          <FaCheckCircle className="text-success me-2" />
                          <span>Yes</span>
                        </>
                      ) : (
                        <>
                          <span className="text-muted">
                            No previous experience
                          </span>
                        </>
                      )}
                    </div>
                    {student.background.tutoringExperienceDetails && (
                      <div className="mt-2">
                        <small className="text-muted">Details:</small>
                        <p>{student.background.tutoringExperienceDetails}</p>
                      </div>
                    )}
                  </div>

                  {student.background.specialLearningNeeds && (
                    <div className="mb-3">
                      <h6>Special Learning Needs</h6>
                      <p>{student.background.specialLearningNeeds}</p>
                    </div>
                  )}
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Tab>

        {/* Session History Tab */}
        <Tab
          eventKey="history"
          title={
            <span>
              <FaHistory className="me-2" />
              Session History
            </span>
          }
        >
          <Card>
            <Card.Body>
              <h5>Previous Sessions</h5>
              {student.sessionHistory && student.sessionHistory.length > 0 ? (
                <ListGroup variant="flush">
                  {student.sessionHistory.map((session, index) => (
                    <ListGroup.Item
                      key={index}
                      className="d-flex justify-content-between align-items-start"
                    >
                      <div className="ms-2 me-auto">
                        <div className="fw-bold">
                          {session.title || session.subject}
                        </div>
                        <small className="text-muted">
                          <FaCalendarAlt className="me-1" />
                          {formatTime(session.startTime)}
                        </small>
                        {session.notes && (
                          <div className="mt-1">
                            <small>Notes: {session.notes}</small>
                          </div>
                        )}
                      </div>
                      <Badge
                        bg={
                          session.status === "completed"
                            ? "success"
                            : session.status === "scheduled"
                            ? "primary"
                            : "secondary"
                        }
                        pill
                      >
                        {session.status}
                      </Badge>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              ) : (
                <Alert variant="info">
                  No session history available with this student yet.
                </Alert>
              )}
            </Card.Body>
          </Card>
        </Tab>
      </Tabs>
    </Container>
  );
};

export default StudentProfileViewer;
