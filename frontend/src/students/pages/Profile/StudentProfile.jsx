import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  Alert,
  ProgressBar,
  Badge,
  Tab,
  Tabs,
} from "react-bootstrap";
import {
  FaUser,
  FaGraduationCap,
  FaBrain,
  FaHistory,
  FaSave,
  FaEdit,
} from "react-icons/fa";
import studentProfileService from "../../../shared/services/studentProfile.service";
import uploadService from "../../../shared/services/upload.service";
import { formatImageUrl } from "../../../shared/utils/imageUtils";
import { useAuth } from "../../../shared/context/AuthContext";
import { ProfileImageUpload } from "./components";
import "./StudentProfile.css";

const StudentProfile = () => {
  const { currentUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [activeTab, setActiveTab] = useState("personal");
  const [isEditing, setIsEditing] = useState(false);

  // Form data state
  const [formData, setFormData] = useState(
    studentProfileService.getDefaultProfile()
  );

  // Predefined options
  const academicLevels = [
    "Elementary School",
    "Middle School",
    "High School",
    "College/University",
    "Graduate School",
    "Professional Development",
  ];

  const learningStyles = [
    "Visual",
    "Auditory",
    "Kinesthetic",
    "Reading/Writing",
  ];
  const schedulePreferences = ["Morning", "Afternoon", "Evening", "Flexible"];
  const studyTimeOptions = [
    "1-2 hours/week",
    "3-5 hours/week",
    "6-10 hours/week",
    "10+ hours/week",
  ];
  const parentInvolvementLevels = ["High", "Medium", "Low", "Independent"];
  const genderOptions = ["Male", "Female", "Other", "Prefer not to say"];

  // Load profile data
  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const response = await studentProfileService.getMyProfile();

      if (response.success) {
        setProfile(response.student);
        // Combine student data with user data (including gender)
        const combinedData = {
          ...studentProfileService.getDefaultProfile(),
          ...response.student,
          // Include gender from user object
          gender: response.student.user?.gender || "",
        };
        setFormData(combinedData);
      } else {
        // Profile doesn't exist yet, use default
        setProfile(studentProfileService.getDefaultProfile());
        setFormData(studentProfileService.getDefaultProfile());
        setIsEditing(true); // Start in edit mode for new profiles
      }
    } catch (error) {
      console.error("Error loading profile:", error);
      setError("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    // Special validation for currentGPA
    if (field === "currentGPA") {
      if (value === "" || value === null || value === undefined) {
        setFormData((prev) => ({
          ...prev,
          [field]: "",
        }));
        return;
      }

      const numValue = parseFloat(value);
      if (isNaN(numValue) || numValue < 0 || numValue > 4.0) {
        // Don't update if invalid
        return;
      }

      setFormData((prev) => ({
        ...prev,
        [field]: numValue,
      }));
      return;
    }

    // Default handling for other fields
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleArrayInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value
        .split(",")
        .map((item) => item.trim())
        .filter((item) => item !== ""),
    }));
  };

  const handleLocationChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      location: {
        ...prev.location,
        [field]: value,
      },
    }));
  };

  // Helper function to clean form data before sending
  const cleanFormData = (data) => {
    const cleaned = { ...data };

    console.log("Before cleaning:", cleaned);

    // For enum fields, remove them entirely if they're empty
    const enumFields = [
      "gender",
      "academicLevel",
      "studySchedulePreference",
      "availableStudyTime",
      "parentInvolvement",
    ];

    enumFields.forEach((field) => {
      if (
        cleaned[field] === "" ||
        cleaned[field] === null ||
        cleaned[field] === undefined
      ) {
        console.log(
          `Removing empty enum field: ${field} with value:`,
          cleaned[field]
        );
        delete cleaned[field];
      }
    });

    // Handle learningStyle as array
    if (Array.isArray(cleaned.learningStyle)) {
      cleaned.learningStyle = cleaned.learningStyle.filter(
        (item) => item && item.trim() !== ""
      );
      if (cleaned.learningStyle.length === 0) {
        delete cleaned.learningStyle;
      }
    } else if (!cleaned.learningStyle || cleaned.learningStyle === "") {
      delete cleaned.learningStyle;
    }

    // Clean array fields - remove empty strings
    const arrayFields = [
      "subjects",
      "academicGoals",
      "strengths",
      "areasForImprovement",
      "interests",
    ];

    arrayFields.forEach((field) => {
      if (Array.isArray(cleaned[field])) {
        cleaned[field] = cleaned[field].filter(
          (item) => item && item.trim() !== ""
        );
      }
    });

    // Convert numeric fields with validation
    if (
      cleaned.currentGPA !== undefined &&
      cleaned.currentGPA !== null &&
      cleaned.currentGPA !== ""
    ) {
      const gpa = parseFloat(cleaned.currentGPA);
      if (isNaN(gpa) || gpa < 0 || gpa > 4.0) {
        // Invalid GPA - remove it
        console.log(`Removing invalid GPA: ${cleaned.currentGPA}`);
        delete cleaned.currentGPA;
      } else {
        cleaned.currentGPA = gpa;
      }
    } else {
      delete cleaned.currentGPA;
    }

    // Remove empty string fields to avoid validation issues
    Object.keys(cleaned).forEach((key) => {
      if (
        cleaned[key] === "" ||
        cleaned[key] === null ||
        cleaned[key] === undefined
      ) {
        console.log(`Removing empty field: ${key} with value:`, cleaned[key]);
        delete cleaned[key];
      }
    });

    console.log("After cleaning:", cleaned);
    return cleaned;
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError("");
      setSuccess("");

      // Clean the form data before sending
      const cleanedData = cleanFormData(formData);
      console.log("Original form data:", formData);
      console.log("Cleaned form data:", cleanedData);

      const response = await studentProfileService.updateMyProfile(cleanedData);

      if (response.success) {
        setProfile(response.student);
        setSuccess("Profile updated successfully!");
        setIsEditing(false);
      } else {
        setError(response.message || "Failed to update profile");
      }
    } catch (error) {
      console.error("Error saving profile:", error);
      setError("Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (profile) {
      setFormData({ ...studentProfileService.getDefaultProfile(), ...profile });
    }
    setIsEditing(false);
    setError("");
    setSuccess("");
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

  const completionPercentage = profile
    ? studentProfileService.calculateCompleteness(profile)
    : studentProfileService.calculateCompleteness(formData);

  const suggestions = profile
    ? studentProfileService.getCompletionSuggestions(profile)
    : studentProfileService.getCompletionSuggestions(formData);

  return (
    <div className="student-profile">
      <Container className="py-4" style={{ maxWidth: "1200px" }}>
        {/* Enhanced Header with Profile Image */}
        <Card className="mb-4 border-0 shadow-sm">
          <Card.Body className="p-4">
            <Row className="align-items-center">
              <Col md={2} className="text-center mb-3 mb-md-0">
                <div className="profile-image-container position-relative">
                  <img
                    src={formatImageUrl(currentUser?.profileImage)}
                    alt="Profile"
                    className="profile-image rounded-circle border border-3 border-light shadow"
                    style={{
                      width: "100px",
                      height: "100px",
                      objectFit: "cover",
                    }}
                    onError={(e) => {
                      e.target.src = "/images/default-avatar.png";
                    }}
                  />
                  <Badge
                    bg={getCompletionColor(completionPercentage)}
                    className="position-absolute bottom-0 end-0 rounded-pill"
                    style={{ fontSize: "0.7rem" }}
                  >
                    {completionPercentage}%
                  </Badge>
                </div>

                {/* Profile Image Upload */}
                {isEditing && (
                  <div className="mt-3">
                    <ProfileImageUpload
                      onUploadSuccess={(imagePath) => {
                        // Refresh profile data or update UI as needed
                        console.log("Profile image uploaded:", imagePath);
                      }}
                    />
                  </div>
                )}
              </Col>
              <Col md={6}>
                <div>
                  <h2 className="mb-2 fw-bold text-primary">
                    <FaUser className="me-2" />
                    {currentUser?.firstName} {currentUser?.lastName}
                  </h2>
                  <p className="text-muted mb-2">
                    Complete your profile to help tutors provide better
                    personalized learning
                  </p>
                  <div className="mb-2">
                    <small className="text-muted d-block mb-1">
                      Profile Completion
                    </small>
                    <ProgressBar
                      variant={getCompletionColor(completionPercentage)}
                      now={completionPercentage}
                      style={{ height: "8px" }}
                    />
                  </div>
                </div>
              </Col>
              <Col md={4} className="text-end">
                {!isEditing ? (
                  <Button
                    variant="primary"
                    size="lg"
                    onClick={() => setIsEditing(true)}
                    className="shadow-sm"
                  >
                    <FaEdit className="me-2" />
                    Edit Profile
                  </Button>
                ) : (
                  <div className="d-flex flex-column gap-2">
                    <Button
                      variant="success"
                      onClick={handleSave}
                      disabled={saving}
                      className="shadow-sm"
                    >
                      <FaSave className="me-2" />
                      {saving ? "Saving..." : "Save Changes"}
                    </Button>
                    <Button variant="outline-secondary" onClick={handleCancel}>
                      Cancel
                    </Button>
                  </div>
                )}
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {/* Enhanced Alerts */}
        {error && (
          <Alert
            variant="danger"
            dismissible
            onClose={() => setError("")}
            className="border-0 shadow-sm"
          >
            <Alert.Heading className="h6">
              <i className="fas fa-exclamation-triangle me-2"></i>
              Error
            </Alert.Heading>
            {error}
          </Alert>
        )}
        {success && (
          <Alert
            variant="success"
            dismissible
            onClose={() => setSuccess("")}
            className="border-0 shadow-sm"
          >
            <Alert.Heading className="h6">
              <i className="fas fa-check-circle me-2"></i>
              Success
            </Alert.Heading>
            {success}
          </Alert>
        )}

        {/* Enhanced Profile Suggestions */}
        {suggestions.length > 0 && (
          <Card
            className="mb-4 border-0"
            style={{ backgroundColor: "#e3f2fd" }}
          >
            <Card.Body className="p-4">
              <div className="d-flex align-items-start">
                <div
                  className="bg-primary text-white rounded-circle p-2 me-3"
                  style={{ minWidth: "40px", height: "40px" }}
                >
                  <i className="fas fa-lightbulb"></i>
                </div>
                <div className="flex-grow-1">
                  <h6 className="fw-bold text-primary mb-2">
                    Complete Your Profile:
                  </h6>
                  <ul className="mb-0 list-unstyled">
                    {suggestions.slice(0, 3).map((suggestion, index) => (
                      <li key={index} className="mb-1">
                        <i className="fas fa-arrow-right text-primary me-2"></i>
                        {suggestion}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </Card.Body>
          </Card>
        )}

        {/* Enhanced Profile Tabs */}
        <Card className="border-0 shadow-sm">
          <Tabs
            activeKey={activeTab}
            onSelect={(k) => setActiveTab(k)}
            className="nav-pills-custom border-0 p-3"
          >
            {/* Personal Information Tab */}
            <Tab
              eventKey="personal"
              title={
                <span className="d-flex align-items-center">
                  <FaUser className="me-2" />
                  <span className="d-none d-sm-inline">Personal Info</span>
                  <span className="d-sm-none">Personal</span>
                </span>
              }
            >
              <div className="p-4">
                <h5 className="text-primary mb-4 section-header">
                  <FaUser className="me-2" />
                  Personal Information
                </h5>

                {!isEditing ? (
                  // Display Mode
                  <>
                    <Row className="mb-4">
                      <Col md={6}>
                        <div className="info-item mb-3">
                          <label className="info-label">Grade/Year</label>
                          <div className="info-value">
                            {formData.grade || (
                              <span className="text-muted">Not specified</span>
                            )}
                          </div>
                        </div>
                      </Col>
                      <Col md={6}>
                        <div className="info-item mb-3">
                          <label className="info-label">Academic Level</label>
                          <div className="info-value">
                            {formData.academicLevel || (
                              <span className="text-muted">Not specified</span>
                            )}
                          </div>
                        </div>
                      </Col>
                    </Row>

                    <Row className="mb-4">
                      <Col md={6}>
                        <div className="info-item mb-3">
                          <label className="info-label">
                            School/Institution
                          </label>
                          <div className="info-value">
                            {formData.school || (
                              <span className="text-muted">Not specified</span>
                            )}
                          </div>
                        </div>
                      </Col>
                      <Col md={6}>
                        <div className="info-item mb-3">
                          <label className="info-label">Current GPA</label>
                          <div className="info-value">
                            {formData.currentGPA ? (
                              <span className="badge bg-success">
                                {formData.currentGPA}/4.0
                              </span>
                            ) : (
                              <span className="text-muted">Not specified</span>
                            )}
                          </div>
                        </div>
                      </Col>
                    </Row>

                    <Row className="mb-4">
                      <Col md={6}>
                        <div className="info-item mb-3">
                          <label className="info-label">Gender</label>
                          <div className="info-value">
                            {formData.gender || (
                              <span className="text-muted">Not specified</span>
                            )}
                          </div>
                        </div>
                      </Col>
                    </Row>

                    <div className="info-item mb-3">
                      <label className="info-label">Bio</label>
                      <div className="info-value">
                        {formData.bio ? (
                          <p className="mb-0" style={{ lineHeight: "1.6" }}>
                            {formData.bio}
                          </p>
                        ) : (
                          <span className="text-muted">No bio provided</span>
                        )}
                      </div>
                    </div>

                    <div className="info-item mb-3">
                      <label className="info-label">Interests & Hobbies</label>
                      <div className="info-value">
                        {formData.interests && formData.interests.length > 0 ? (
                          <div className="d-flex flex-wrap gap-2">
                            {formData.interests.map((interest, index) => (
                              <Badge
                                key={index}
                                bg="primary"
                                text="white"
                                className="px-2 py-1"
                              >
                                {interest}
                              </Badge>
                            ))}
                          </div>
                        ) : (
                          <span className="text-muted">
                            No interests specified
                          </span>
                        )}
                      </div>
                    </div>
                  </>
                ) : (
                  // Edit Mode
                  <>
                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-4">
                          <Form.Label className="fw-semibold">
                            Grade/Year
                          </Form.Label>
                          <Form.Control
                            type="text"
                            value={formData.grade || ""}
                            onChange={(e) =>
                              handleInputChange("grade", e.target.value)
                            }
                            disabled={!isEditing}
                            placeholder="e.g., 10th Grade, Sophomore, etc."
                            className="form-control-lg"
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-4">
                          <Form.Label className="fw-semibold">
                            Academic Level
                          </Form.Label>
                          <Form.Select
                            value={formData.academicLevel || ""}
                            onChange={(e) =>
                              handleInputChange("academicLevel", e.target.value)
                            }
                            disabled={!isEditing}
                            className="form-control-lg"
                          >
                            <option value="">Select academic level</option>
                            {academicLevels.map((level) => (
                              <option key={level} value={level}>
                                {level}
                              </option>
                            ))}
                          </Form.Select>
                        </Form.Group>
                      </Col>
                    </Row>

                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-4">
                          <Form.Label className="fw-semibold">
                            School/Institution
                          </Form.Label>
                          <Form.Control
                            type="text"
                            value={formData.school || ""}
                            onChange={(e) =>
                              handleInputChange("school", e.target.value)
                            }
                            disabled={!isEditing}
                            placeholder="Your school or institution name"
                            className="form-control-lg"
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-4">
                          <Form.Label className="fw-semibold">
                            Current GPA (optional)
                          </Form.Label>
                          <Form.Control
                            type="number"
                            step="0.01"
                            min="0"
                            max="4.0"
                            value={formData.currentGPA || ""}
                            onChange={(e) =>
                              handleInputChange("currentGPA", e.target.value)
                            }
                            disabled={!isEditing}
                            placeholder="0.00 - 4.00"
                            className="form-control-lg"
                          />
                        </Form.Group>
                      </Col>
                    </Row>

                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-4">
                          <Form.Label className="fw-semibold">
                            Gender (optional)
                          </Form.Label>
                          <Form.Select
                            value={formData.gender || ""}
                            onChange={(e) =>
                              handleInputChange("gender", e.target.value)
                            }
                            disabled={!isEditing}
                            className="form-control-lg"
                          >
                            <option value="">Select gender</option>
                            {genderOptions.map((gender) => (
                              <option key={gender} value={gender}>
                                {gender}
                              </option>
                            ))}
                          </Form.Select>
                        </Form.Group>
                      </Col>
                    </Row>

                    <Form.Group className="mb-4">
                      <Form.Label className="fw-semibold">Bio</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={4}
                        value={formData.bio || ""}
                        onChange={(e) =>
                          handleInputChange("bio", e.target.value)
                        }
                        disabled={!isEditing}
                        placeholder="Tell us about yourself, your interests, and learning goals..."
                        maxLength={500}
                        className="form-control-lg"
                      />
                      <Form.Text className="text-muted">
                        {formData.bio ? formData.bio.length : 0}/500 characters
                      </Form.Text>
                    </Form.Group>

                    <Form.Group className="mb-4">
                      <Form.Label className="fw-semibold">
                        Interests & Hobbies
                      </Form.Label>
                      <Form.Control
                        type="text"
                        value={
                          formData.interests
                            ? formData.interests.join(", ")
                            : ""
                        }
                        onChange={(e) =>
                          handleArrayInputChange("interests", e.target.value)
                        }
                        disabled={!isEditing}
                        placeholder="e.g., Reading, Sports, Music, Art (separate with commas)"
                        className="form-control-lg"
                      />
                    </Form.Group>
                  </>
                )}
              </div>
            </Tab>

            {/* Academic Information Tab */}
            <Tab
              eventKey="academic"
              title={
                <span className="d-flex align-items-center">
                  <FaGraduationCap className="me-2" />
                  <span className="d-none d-sm-inline">Academic Info</span>
                  <span className="d-sm-none">Academic</span>
                </span>
              }
            >
              <div className="p-4">
                <h5 className="text-primary mb-4 section-header">
                  <FaGraduationCap className="me-2" />
                  Academic Information
                </h5>

                {!isEditing ? (
                  // Display Mode
                  <>
                    <div className="info-item mb-4">
                      <label className="info-label">Subjects of Interest</label>
                      <div className="info-value">
                        {formData.subjects && formData.subjects.length > 0 ? (
                          <div className="d-flex flex-wrap gap-2">
                            {formData.subjects.map((subject, index) => (
                              <Badge
                                key={index}
                                bg="primary"
                                className="px-3 py-2"
                              >
                                {subject}
                              </Badge>
                            ))}
                          </div>
                        ) : (
                          <span className="text-muted">
                            No subjects specified
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="info-item mb-4">
                      <label className="info-label">Academic Goals</label>
                      <div className="info-value">
                        {formData.academicGoals &&
                        formData.academicGoals.length > 0 ? (
                          <ul className="list-unstyled mb-0">
                            {formData.academicGoals.map((goal, index) => (
                              <li key={index} className="mb-2">
                                <i className="fas fa-target text-primary me-2"></i>
                                {goal}
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <span className="text-muted">
                            No academic goals specified
                          </span>
                        )}
                      </div>
                    </div>

                    <Row className="mb-4">
                      <Col md={6}>
                        <div className="info-item">
                          <label className="info-label">Strengths</label>
                          <div className="info-value">
                            {formData.strengths &&
                            formData.strengths.length > 0 ? (
                              <div className="d-flex flex-wrap gap-2">
                                {formData.strengths.map((strength, index) => (
                                  <Badge
                                    key={index}
                                    bg="success"
                                    className="px-2 py-1"
                                  >
                                    {strength}
                                  </Badge>
                                ))}
                              </div>
                            ) : (
                              <span className="text-muted">
                                No strengths specified
                              </span>
                            )}
                          </div>
                        </div>
                      </Col>
                      <Col md={6}>
                        <div className="info-item">
                          <label className="info-label">
                            Areas for Improvement
                          </label>
                          <div className="info-value">
                            {formData.areasForImprovement &&
                            formData.areasForImprovement.length > 0 ? (
                              <div className="d-flex flex-wrap gap-2">
                                {formData.areasForImprovement.map(
                                  (area, index) => (
                                    <Badge
                                      key={index}
                                      bg="warning"
                                      className="px-2 py-1"
                                    >
                                      {area}
                                    </Badge>
                                  )
                                )}
                              </div>
                            ) : (
                              <span className="text-muted">
                                No improvement areas specified
                              </span>
                            )}
                          </div>
                        </div>
                      </Col>
                    </Row>
                  </>
                ) : (
                  // Edit Mode
                  <>
                    <Form.Group className="mb-4">
                      <Form.Label className="fw-semibold">
                        Subjects of Interest
                      </Form.Label>
                      <Form.Control
                        type="text"
                        value={
                          formData.subjects ? formData.subjects.join(", ") : ""
                        }
                        onChange={(e) =>
                          handleArrayInputChange("subjects", e.target.value)
                        }
                        disabled={!isEditing}
                        placeholder="e.g., Mathematics, Physics, English, History (separate with commas)"
                        className="form-control-lg"
                      />
                      <Form.Text className="text-muted">
                        List the subjects you want to learn or need help with
                      </Form.Text>
                    </Form.Group>

                    <Form.Group className="mb-4">
                      <Form.Label className="fw-semibold">
                        Academic Goals
                      </Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={3}
                        value={
                          formData.academicGoals
                            ? formData.academicGoals.join(", ")
                            : ""
                        }
                        onChange={(e) =>
                          handleArrayInputChange(
                            "academicGoals",
                            e.target.value
                          )
                        }
                        disabled={!isEditing}
                        placeholder="e.g., Improve grades, Pass exams, Learn new skills (separate with commas)"
                        className="form-control-lg"
                      />
                    </Form.Group>

                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-4">
                          <Form.Label className="fw-semibold">
                            Strengths
                          </Form.Label>
                          <Form.Control
                            type="text"
                            value={
                              formData.strengths
                                ? formData.strengths.join(", ")
                                : ""
                            }
                            onChange={(e) =>
                              handleArrayInputChange(
                                "strengths",
                                e.target.value
                              )
                            }
                            disabled={!isEditing}
                            placeholder="e.g., Quick learner, Good at math, Creative"
                            className="form-control-lg"
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-4">
                          <Form.Label className="fw-semibold">
                            Areas for Improvement
                          </Form.Label>
                          <Form.Control
                            type="text"
                            value={
                              formData.areasForImprovement
                                ? formData.areasForImprovement.join(", ")
                                : ""
                            }
                            onChange={(e) =>
                              handleArrayInputChange(
                                "areasForImprovement",
                                e.target.value
                              )
                            }
                            disabled={!isEditing}
                            placeholder="e.g., Time management, Writing skills"
                            className="form-control-lg"
                          />
                        </Form.Group>
                      </Col>
                    </Row>
                  </>
                )}
              </div>
            </Tab>

            {/* Learning Style Tab */}
            <Tab
              eventKey="learning"
              title={
                <span className="d-flex align-items-center">
                  <FaBrain className="me-2" />
                  <span className="d-none d-sm-inline">Learning Style</span>
                  <span className="d-sm-none">Learning</span>
                </span>
              }
            >
              <div className="p-4">
                <h5 className="text-primary mb-4 section-header">
                  <FaBrain className="me-2" />
                  Learning Preferences
                </h5>

                {!isEditing ? (
                  // Display Mode
                  <>
                    <div className="info-item mb-4">
                      <label className="info-label">
                        Preferred Learning Style
                      </label>
                      <div className="info-value">
                        {formData.learningStyle &&
                        formData.learningStyle.length > 0 ? (
                          <div className="d-flex flex-wrap gap-2">
                            {formData.learningStyle.map((style, index) => (
                              <Badge
                                key={index}
                                bg="info"
                                className="px-3 py-2 fs-6"
                              >
                                {style}
                              </Badge>
                            ))}
                          </div>
                        ) : (
                          <span className="text-muted">
                            No learning style specified
                          </span>
                        )}
                      </div>
                    </div>

                    <Row className="mb-4">
                      <Col md={6}>
                        <div className="info-item">
                          <label className="info-label">
                            Study Schedule Preference
                          </label>
                          <div className="info-value">
                            {formData.studySchedulePreference ? (
                              <div className="d-flex align-items-center">
                                <i className="fas fa-clock text-primary me-2"></i>
                                <span>{formData.studySchedulePreference}</span>
                              </div>
                            ) : (
                              <span className="text-muted">
                                No preference specified
                              </span>
                            )}
                          </div>
                        </div>
                      </Col>
                      <Col md={6}>
                        <div className="info-item">
                          <label className="info-label">
                            Available Study Time
                          </label>
                          <div className="info-value">
                            {formData.availableStudyTime ? (
                              <div className="d-flex align-items-center">
                                <i className="fas fa-hourglass-half text-success me-2"></i>
                                <span>{formData.availableStudyTime}</span>
                              </div>
                            ) : (
                              <span className="text-muted">
                                No time commitment specified
                              </span>
                            )}
                          </div>
                        </div>
                      </Col>
                    </Row>
                  </>
                ) : (
                  // Edit Mode
                  <>
                    <Form.Group className="mb-4">
                      <Form.Label className="fw-semibold">
                        Preferred Learning Style
                      </Form.Label>
                      <Form.Select
                        value={
                          Array.isArray(formData.learningStyle)
                            ? formData.learningStyle[0] || ""
                            : formData.learningStyle || ""
                        }
                        onChange={(e) =>
                          handleInputChange(
                            "learningStyle",
                            e.target.value ? [e.target.value] : []
                          )
                        }
                        disabled={!isEditing}
                        className="form-control-lg"
                      >
                        <option value="">Select learning style</option>
                        {learningStyles.map((style) => (
                          <option key={style} value={style}>
                            {style}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>

                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-4">
                          <Form.Label className="fw-semibold">
                            Study Schedule Preference
                          </Form.Label>
                          <Form.Select
                            value={formData.studySchedulePreference || ""}
                            onChange={(e) =>
                              handleInputChange(
                                "studySchedulePreference",
                                e.target.value
                              )
                            }
                            disabled={!isEditing}
                            className="form-control-lg"
                          >
                            <option value="">Select preference</option>
                            {schedulePreferences.map((pref) => (
                              <option key={pref} value={pref}>
                                {pref}
                              </option>
                            ))}
                          </Form.Select>
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-4">
                          <Form.Label className="fw-semibold">
                            Available Study Time
                          </Form.Label>
                          <Form.Select
                            value={formData.availableStudyTime || ""}
                            onChange={(e) =>
                              handleInputChange(
                                "availableStudyTime",
                                e.target.value
                              )
                            }
                            disabled={!isEditing}
                            className="form-control-lg"
                          >
                            <option value="">Select time commitment</option>
                            {studyTimeOptions.map((time) => (
                              <option key={time} value={time}>
                                {time}
                              </option>
                            ))}
                          </Form.Select>
                        </Form.Group>
                      </Col>
                    </Row>
                  </>
                )}
              </div>
            </Tab>

            {/* Background Tab */}
            <Tab
              eventKey="background"
              title={
                <span className="d-flex align-items-center">
                  <FaHistory className="me-2" />
                  <span className="d-none d-sm-inline">Background</span>
                  <span className="d-sm-none">Background</span>
                </span>
              }
            >
              <div className="p-4">
                <h5 className="text-primary mb-4 section-header">
                  <FaHistory className="me-2" />
                  Background Information
                </h5>

                {!isEditing ? (
                  // Display Mode
                  <>
                    <Row className="mb-4">
                      <Col md={6}>
                        <div className="info-item">
                          <label className="info-label">
                            Parent/Guardian Name
                          </label>
                          <div className="info-value">
                            {formData.parentName ? (
                              <div className="d-flex align-items-center">
                                <i className="fas fa-user-friends text-primary me-2"></i>
                                <span>{formData.parentName}</span>
                              </div>
                            ) : (
                              <span className="text-muted">Not specified</span>
                            )}
                          </div>
                        </div>
                      </Col>
                      <Col md={6}>
                        <div className="info-item">
                          <label className="info-label">
                            Parent/Guardian Contact
                          </label>
                          <div className="info-value">
                            {formData.parentPhone ? (
                              <div className="d-flex align-items-center">
                                <i className="fas fa-phone text-success me-2"></i>
                                <span>{formData.parentPhone}</span>
                              </div>
                            ) : (
                              <span className="text-muted">Not specified</span>
                            )}
                          </div>
                        </div>
                      </Col>
                    </Row>

                    <div className="info-item mb-4">
                      <label className="info-label">
                        Parent Involvement Level
                      </label>
                      <div className="info-value">
                        {formData.parentInvolvement ? (
                          <Badge bg="secondary" className="px-3 py-2">
                            {formData.parentInvolvement}
                          </Badge>
                        ) : (
                          <span className="text-muted">Not specified</span>
                        )}
                      </div>
                    </div>

                    <div className="info-item mb-4">
                      <label className="info-label">
                        Special Needs or Learning Differences
                      </label>
                      <div className="info-value">
                        {formData.specialLearningNeeds ? (
                          <div className="alert alert-info mb-0">
                            <i className="fas fa-info-circle me-2"></i>
                            {formData.specialLearningNeeds}
                          </div>
                        ) : (
                          <span className="text-muted">
                            No special needs specified
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="info-item mb-4">
                      <label className="info-label">Location</label>
                      <div className="info-value">
                        <Row>
                          <Col md={6}>
                            <div className="mb-2">
                              <strong>City:</strong>{" "}
                              {formData.location?.city ? (
                                <span className="text-primary">
                                  {formData.location.city}
                                </span>
                              ) : (
                                <span className="text-muted">
                                  Not specified
                                </span>
                              )}
                            </div>
                          </Col>
                          <Col md={6}>
                            <div className="mb-2">
                              <strong>State/Province:</strong>{" "}
                              {formData.location?.state ? (
                                <span className="text-primary">
                                  {formData.location.state}
                                </span>
                              ) : (
                                <span className="text-muted">
                                  Not specified
                                </span>
                              )}
                            </div>
                          </Col>
                        </Row>
                        <Row>
                          <Col md={6}>
                            <div className="mb-2">
                              <strong>Country:</strong>{" "}
                              {formData.location?.country ? (
                                <span className="text-primary">
                                  {formData.location.country}
                                </span>
                              ) : (
                                <span className="text-muted">
                                  Not specified
                                </span>
                              )}
                            </div>
                          </Col>
                          <Col md={6}>
                            <div className="mb-2">
                              <strong>Postal Code:</strong>{" "}
                              {formData.location?.postalCode ? (
                                <span className="text-primary">
                                  {formData.location.postalCode}
                                </span>
                              ) : (
                                <span className="text-muted">
                                  Not specified
                                </span>
                              )}
                            </div>
                          </Col>
                        </Row>
                        {(formData.location?.address ||
                          formData.location?.timeZone) && (
                          <Row>
                            {formData.location?.address && (
                              <Col md={6}>
                                <div className="mb-2">
                                  <strong>Address:</strong>{" "}
                                  <span className="text-primary">
                                    {formData.location.address}
                                  </span>
                                </div>
                              </Col>
                            )}
                            {formData.location?.timeZone && (
                              <Col md={6}>
                                <div className="mb-2">
                                  <strong>Time Zone:</strong>{" "}
                                  <span className="text-primary">
                                    {formData.location.timeZone}
                                  </span>
                                </div>
                              </Col>
                            )}
                          </Row>
                        )}
                      </div>
                    </div>
                  </>
                ) : (
                  // Edit Mode
                  <>
                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-4">
                          <Form.Label className="fw-semibold">
                            Parent/Guardian Name
                          </Form.Label>
                          <Form.Control
                            type="text"
                            value={formData.parentName || ""}
                            onChange={(e) =>
                              handleInputChange("parentName", e.target.value)
                            }
                            disabled={!isEditing}
                            placeholder="Parent or guardian's name"
                            className="form-control-lg"
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-4">
                          <Form.Label className="fw-semibold">
                            Parent/Guardian Contact
                          </Form.Label>
                          <Form.Control
                            type="text"
                            value={formData.parentPhone || ""}
                            onChange={(e) =>
                              handleInputChange("parentPhone", e.target.value)
                            }
                            disabled={!isEditing}
                            placeholder="Phone number"
                            className="form-control-lg"
                          />
                        </Form.Group>
                      </Col>
                    </Row>

                    <Form.Group className="mb-4">
                      <Form.Label className="fw-semibold">
                        Parent Involvement Level
                      </Form.Label>
                      <Form.Select
                        value={formData.parentInvolvement || ""}
                        onChange={(e) =>
                          handleInputChange("parentInvolvement", e.target.value)
                        }
                        disabled={!isEditing}
                        className="form-control-lg"
                      >
                        <option value="">Select involvement level</option>
                        {parentInvolvementLevels.map((level) => (
                          <option key={level} value={level}>
                            {level}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>

                    <Form.Group className="mb-4">
                      <Form.Label className="fw-semibold">
                        Special Needs or Learning Differences
                      </Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={3}
                        value={formData.specialLearningNeeds || ""}
                        onChange={(e) =>
                          handleInputChange(
                            "specialLearningNeeds",
                            e.target.value
                          )
                        }
                        disabled={!isEditing}
                        placeholder="Any learning differences, accommodations needed, or special requirements..."
                        className="form-control-lg"
                      />
                      <Form.Text className="text-muted">
                        This information helps tutors provide better support
                      </Form.Text>
                    </Form.Group>

                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-4">
                          <Form.Label className="fw-semibold">City</Form.Label>
                          <Form.Control
                            type="text"
                            value={formData.location?.city || ""}
                            onChange={(e) =>
                              handleLocationChange("city", e.target.value)
                            }
                            disabled={!isEditing}
                            placeholder="Your city"
                            className="form-control-lg"
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-4">
                          <Form.Label className="fw-semibold">
                            State/Province
                          </Form.Label>
                          <Form.Control
                            type="text"
                            value={formData.location?.state || ""}
                            onChange={(e) =>
                              handleLocationChange("state", e.target.value)
                            }
                            disabled={!isEditing}
                            placeholder="Your state or province"
                            className="form-control-lg"
                          />
                        </Form.Group>
                      </Col>
                    </Row>

                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-4">
                          <Form.Label className="fw-semibold">
                            Country
                          </Form.Label>
                          <Form.Control
                            type="text"
                            value={formData.location?.country || ""}
                            onChange={(e) =>
                              handleLocationChange("country", e.target.value)
                            }
                            disabled={!isEditing}
                            placeholder="Your country"
                            className="form-control-lg"
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-4">
                          <Form.Label className="fw-semibold">
                            Postal Code
                          </Form.Label>
                          <Form.Control
                            type="text"
                            value={formData.location?.postalCode || ""}
                            onChange={(e) =>
                              handleLocationChange("postalCode", e.target.value)
                            }
                            disabled={!isEditing}
                            placeholder="Your postal/zip code"
                            className="form-control-lg"
                          />
                        </Form.Group>
                      </Col>
                    </Row>

                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-4">
                          <Form.Label className="fw-semibold">
                            Address (optional)
                          </Form.Label>
                          <Form.Control
                            type="text"
                            value={formData.location?.address || ""}
                            onChange={(e) =>
                              handleLocationChange("address", e.target.value)
                            }
                            disabled={!isEditing}
                            placeholder="Your street address"
                            className="form-control-lg"
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-4">
                          <Form.Label className="fw-semibold">
                            Time Zone (optional)
                          </Form.Label>
                          <Form.Control
                            type="text"
                            value={formData.location?.timeZone || ""}
                            onChange={(e) =>
                              handleLocationChange("timeZone", e.target.value)
                            }
                            disabled={!isEditing}
                            placeholder="e.g., UTC+5:30, EST, PST"
                            className="form-control-lg"
                          />
                        </Form.Group>
                      </Col>
                    </Row>
                  </>
                )}
              </div>
            </Tab>
          </Tabs>
        </Card>
      </Container>
    </div>
  );
};

export default StudentProfile;
