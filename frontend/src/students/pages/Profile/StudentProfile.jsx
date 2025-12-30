import React, { useState, useEffect } from "react";
import {
  Container,
  Card,
  Form,
  Button,
  Alert,
  Badge,
  Nav,
} from "react-bootstrap";
import {
  FaUser,
  FaGraduationCap,
  FaBrain,
  FaMapMarkerAlt,
  FaSave,
  FaEdit,
  FaTimes,
  FaCheckCircle,
  FaExclamationTriangle,
  FaLightbulb,
  FaBook,
  FaClock,
  FaUserFriends,
  FaHeart,
} from "react-icons/fa";
import studentProfileService from "../../../shared/services/studentProfile.service";
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
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState("personal");

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

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const response = await studentProfileService.getMyProfile();

      if (response.success) {
        setProfile(response.student);
        const combinedData = {
          ...studentProfileService.getDefaultProfile(),
          ...response.student,
          gender: response.student.user?.gender || "",
        };
        setFormData(combinedData);
      } else {
        setProfile(studentProfileService.getDefaultProfile());
        setFormData(studentProfileService.getDefaultProfile());
        setIsEditing(true);
      }
    } catch (error) {
      console.error("Error loading profile:", error);
      setError("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    if (field === "currentGPA") {
      if (value === "" || value === null || value === undefined) {
        setFormData((prev) => ({ ...prev, [field]: "" }));
        return;
      }
      const numValue = parseFloat(value);
      if (isNaN(numValue) || numValue < 0 || numValue > 4.0) return;
      setFormData((prev) => ({ ...prev, [field]: numValue }));
      return;
    }
    setFormData((prev) => ({ ...prev, [field]: value }));
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
      location: { ...prev.location, [field]: value },
    }));
  };

  const cleanFormData = (data) => {
    const cleaned = { ...data };
    const enumFields = [
      "gender",
      "academicLevel",
      "studySchedulePreference",
      "availableStudyTime",
      "parentInvolvement",
    ];

    enumFields.forEach((field) => {
      if (!cleaned[field]) delete cleaned[field];
    });

    if (Array.isArray(cleaned.learningStyle)) {
      cleaned.learningStyle = cleaned.learningStyle.filter(
        (item) => item && item.trim() !== ""
      );
      if (cleaned.learningStyle.length === 0) delete cleaned.learningStyle;
    } else if (!cleaned.learningStyle) {
      delete cleaned.learningStyle;
    }

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

    if (cleaned.currentGPA !== undefined && cleaned.currentGPA !== "") {
      const gpa = parseFloat(cleaned.currentGPA);
      if (isNaN(gpa) || gpa < 0 || gpa > 4.0) {
        delete cleaned.currentGPA;
      } else {
        cleaned.currentGPA = gpa;
      }
    } else {
      delete cleaned.currentGPA;
    }

    Object.keys(cleaned).forEach((key) => {
      if (
        cleaned[key] === "" ||
        cleaned[key] === null ||
        cleaned[key] === undefined
      ) {
        delete cleaned[key];
      }
    });

    return cleaned;
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError("");
      setSuccess("");
      const cleanedData = cleanFormData(formData);
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

  if (loading) {
    return (
      <div className="student-profile-page">
        <Container className="py-5">
          <div className="text-center">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-3 text-muted">Loading your profile...</p>
          </div>
        </Container>
      </div>
    );
  }

  const suggestions = profile
    ? studentProfileService.getCompletionSuggestions(profile)
    : studentProfileService.getCompletionSuggestions(formData);

  // Info Item Component for Display Mode
  const InfoItem = ({ label, value, icon: Icon }) => (
    <div className="info-item">
      <div className="info-label">
        {Icon && <Icon className="me-2" />}
        {label}
      </div>
      <div className="info-value">
        {value || <span className="text-muted">Not specified</span>}
      </div>
    </div>
  );

  // Tags Display Component
  const TagsDisplay = ({ items, variant = "primary" }) => {
    if (!items || items.length === 0) {
      return <span className="text-muted">None specified</span>;
    }
    return (
      <div className="tags-container">
        {items.map((item, index) => (
          <Badge key={index} className={`tag tag-${variant}`}>
            {item}
          </Badge>
        ))}
      </div>
    );
  };

  // Tab content renderer
  const renderTabContent = () => {
    switch (activeTab) {
      case "personal":
        return (
          <div className="tab-content-section">
            {!isEditing ? (
              <div className="info-grid">
                <InfoItem
                  label="Grade/Year"
                  value={formData.grade}
                  icon={FaGraduationCap}
                />
                <InfoItem
                  label="Academic Level"
                  value={formData.academicLevel}
                  icon={FaBook}
                />
                <InfoItem
                  label="School/Institution"
                  value={formData.school}
                  icon={FaGraduationCap}
                />
                <InfoItem
                  label="Current GPA"
                  value={
                    formData.currentGPA ? `${formData.currentGPA}/4.0` : null
                  }
                  icon={FaCheckCircle}
                />
                <InfoItem
                  label="Gender"
                  value={formData.gender}
                  icon={FaUser}
                />
                <div className="info-item full-width">
                  <div className="info-label">
                    <FaHeart className="me-2" />
                    Bio
                  </div>
                  <div className="info-value bio-text">
                    {formData.bio || (
                      <span className="text-muted">No bio provided</span>
                    )}
                  </div>
                </div>
                <div className="info-item full-width">
                  <div className="info-label">
                    <FaHeart className="me-2" />
                    Interests & Hobbies
                  </div>
                  <div className="info-value">
                    <TagsDisplay items={formData.interests} variant="primary" />
                  </div>
                </div>
              </div>
            ) : (
              <div className="form-grid">
                <Form.Group className="form-item">
                  <Form.Label>Grade/Year</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.grade || ""}
                    onChange={(e) => handleInputChange("grade", e.target.value)}
                    placeholder="e.g., 10th Grade, Sophomore"
                  />
                </Form.Group>
                <Form.Group className="form-item">
                  <Form.Label>Academic Level</Form.Label>
                  <Form.Select
                    value={formData.academicLevel || ""}
                    onChange={(e) =>
                      handleInputChange("academicLevel", e.target.value)
                    }
                  >
                    <option value="">Select level</option>
                    {academicLevels.map((level) => (
                      <option key={level} value={level}>
                        {level}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
                <Form.Group className="form-item">
                  <Form.Label>School/Institution</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.school || ""}
                    onChange={(e) =>
                      handleInputChange("school", e.target.value)
                    }
                    placeholder="Your school name"
                  />
                </Form.Group>
                <Form.Group className="form-item">
                  <Form.Label>Current GPA</Form.Label>
                  <Form.Control
                    type="number"
                    step="0.01"
                    min="0"
                    max="4.0"
                    value={formData.currentGPA || ""}
                    onChange={(e) =>
                      handleInputChange("currentGPA", e.target.value)
                    }
                    placeholder="0.00 - 4.00"
                  />
                </Form.Group>
                <Form.Group className="form-item">
                  <Form.Label>Gender</Form.Label>
                  <Form.Select
                    value={formData.gender || ""}
                    onChange={(e) =>
                      handleInputChange("gender", e.target.value)
                    }
                  >
                    <option value="">Select gender</option>
                    {genderOptions.map((gender) => (
                      <option key={gender} value={gender}>
                        {gender}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
                <Form.Group className="form-item full-width">
                  <Form.Label>Bio</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    value={formData.bio || ""}
                    onChange={(e) => handleInputChange("bio", e.target.value)}
                    placeholder="Tell us about yourself..."
                    maxLength={500}
                  />
                  <Form.Text className="text-muted">
                    {formData.bio?.length || 0}/500 characters
                  </Form.Text>
                </Form.Group>
                <Form.Group className="form-item full-width">
                  <Form.Label>Interests & Hobbies</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.interests?.join(", ") || ""}
                    onChange={(e) =>
                      handleArrayInputChange("interests", e.target.value)
                    }
                    placeholder="Reading, Sports, Music (separate with commas)"
                  />
                </Form.Group>
              </div>
            )}
          </div>
        );

      case "academic":
        return (
          <div className="tab-content-section">
            {!isEditing ? (
              <div className="info-grid">
                <div className="info-item full-width">
                  <div className="info-label">
                    <FaBook className="me-2" />
                    Subjects of Interest
                  </div>
                  <div className="info-value">
                    <TagsDisplay items={formData.subjects} variant="subject" />
                  </div>
                </div>
                <div className="info-item full-width">
                  <div className="info-label">
                    <FaCheckCircle className="me-2" />
                    Academic Goals
                  </div>
                  <div className="info-value">
                    {formData.academicGoals?.length > 0 ? (
                      <ul className="goals-list">
                        {formData.academicGoals.map((goal, index) => (
                          <li key={index}>{goal}</li>
                        ))}
                      </ul>
                    ) : (
                      <span className="text-muted">No goals specified</span>
                    )}
                  </div>
                </div>
                <div className="info-item">
                  <div className="info-label">
                    <FaCheckCircle className="me-2" />
                    Strengths
                  </div>
                  <div className="info-value">
                    <TagsDisplay items={formData.strengths} variant="success" />
                  </div>
                </div>
                <div className="info-item">
                  <div className="info-label">
                    <FaLightbulb className="me-2" />
                    Areas to Improve
                  </div>
                  <div className="info-value">
                    <TagsDisplay
                      items={formData.areasForImprovement}
                      variant="warning"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="form-grid">
                <Form.Group className="form-item full-width">
                  <Form.Label>Subjects of Interest</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.subjects?.join(", ") || ""}
                    onChange={(e) =>
                      handleArrayInputChange("subjects", e.target.value)
                    }
                    placeholder="Mathematics, Physics, English (separate with commas)"
                  />
                </Form.Group>
                <Form.Group className="form-item full-width">
                  <Form.Label>Academic Goals</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    value={formData.academicGoals?.join(", ") || ""}
                    onChange={(e) =>
                      handleArrayInputChange("academicGoals", e.target.value)
                    }
                    placeholder="Improve grades, Pass exams (separate with commas)"
                  />
                </Form.Group>
                <Form.Group className="form-item">
                  <Form.Label>Strengths</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.strengths?.join(", ") || ""}
                    onChange={(e) =>
                      handleArrayInputChange("strengths", e.target.value)
                    }
                    placeholder="Quick learner, Creative"
                  />
                </Form.Group>
                <Form.Group className="form-item">
                  <Form.Label>Areas for Improvement</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.areasForImprovement?.join(", ") || ""}
                    onChange={(e) =>
                      handleArrayInputChange(
                        "areasForImprovement",
                        e.target.value
                      )
                    }
                    placeholder="Time management, Writing"
                  />
                </Form.Group>
              </div>
            )}
          </div>
        );

      case "learning":
        return (
          <div className="tab-content-section">
            {!isEditing ? (
              <div className="info-grid">
                <div className="info-item full-width">
                  <div className="info-label">
                    <FaBrain className="me-2" />
                    Learning Style
                  </div>
                  <div className="info-value">
                    <TagsDisplay
                      items={formData.learningStyle}
                      variant="info"
                    />
                  </div>
                </div>
                <InfoItem
                  label="Study Schedule"
                  value={formData.studySchedulePreference}
                  icon={FaClock}
                />
                <InfoItem
                  label="Study Time"
                  value={formData.availableStudyTime}
                  icon={FaClock}
                />
              </div>
            ) : (
              <div className="form-grid">
                <Form.Group className="form-item">
                  <Form.Label>Learning Style</Form.Label>
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
                  >
                    <option value="">Select style</option>
                    {learningStyles.map((style) => (
                      <option key={style} value={style}>
                        {style}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
                <Form.Group className="form-item">
                  <Form.Label>Study Schedule Preference</Form.Label>
                  <Form.Select
                    value={formData.studySchedulePreference || ""}
                    onChange={(e) =>
                      handleInputChange(
                        "studySchedulePreference",
                        e.target.value
                      )
                    }
                  >
                    <option value="">Select preference</option>
                    {schedulePreferences.map((pref) => (
                      <option key={pref} value={pref}>
                        {pref}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
                <Form.Group className="form-item">
                  <Form.Label>Available Study Time</Form.Label>
                  <Form.Select
                    value={formData.availableStudyTime || ""}
                    onChange={(e) =>
                      handleInputChange("availableStudyTime", e.target.value)
                    }
                  >
                    <option value="">Select time</option>
                    {studyTimeOptions.map((time) => (
                      <option key={time} value={time}>
                        {time}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </div>
            )}
          </div>
        );

      case "background":
        return (
          <div className="tab-content-section">
            {!isEditing ? (
              <div className="info-grid">
                <InfoItem
                  label="Parent/Guardian"
                  value={formData.parentName}
                  icon={FaUserFriends}
                />
                <InfoItem
                  label="Parent Contact"
                  value={formData.parentPhone}
                  icon={FaUserFriends}
                />
                <InfoItem
                  label="Parent Involvement"
                  value={formData.parentInvolvement}
                  icon={FaUserFriends}
                />
                <div className="info-item full-width">
                  <div className="info-label">
                    <FaLightbulb className="me-2" />
                    Special Learning Needs
                  </div>
                  <div className="info-value">
                    {formData.specialLearningNeeds || (
                      <span className="text-muted">None specified</span>
                    )}
                  </div>
                </div>
                <div className="info-item full-width">
                  <div className="info-label">
                    <FaMapMarkerAlt className="me-2" />
                    Location
                  </div>
                  <div className="info-value location-info">
                    {formData.location?.city ||
                    formData.location?.state ||
                    formData.location?.country ? (
                      <span>
                        {[
                          formData.location?.city,
                          formData.location?.state,
                          formData.location?.country,
                        ]
                          .filter(Boolean)
                          .join(", ")}
                      </span>
                    ) : (
                      <span className="text-muted">Not specified</span>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="form-grid">
                <Form.Group className="form-item">
                  <Form.Label>Parent/Guardian Name</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.parentName || ""}
                    onChange={(e) =>
                      handleInputChange("parentName", e.target.value)
                    }
                    placeholder="Parent's name"
                  />
                </Form.Group>
                <Form.Group className="form-item">
                  <Form.Label>Parent Contact</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.parentPhone || ""}
                    onChange={(e) =>
                      handleInputChange("parentPhone", e.target.value)
                    }
                    placeholder="Phone number"
                  />
                </Form.Group>
                <Form.Group className="form-item">
                  <Form.Label>Parent Involvement</Form.Label>
                  <Form.Select
                    value={formData.parentInvolvement || ""}
                    onChange={(e) =>
                      handleInputChange("parentInvolvement", e.target.value)
                    }
                  >
                    <option value="">Select level</option>
                    {parentInvolvementLevels.map((level) => (
                      <option key={level} value={level}>
                        {level}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
                <Form.Group className="form-item full-width">
                  <Form.Label>Special Learning Needs</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    value={formData.specialLearningNeeds || ""}
                    onChange={(e) =>
                      handleInputChange("specialLearningNeeds", e.target.value)
                    }
                    placeholder="Any learning differences or accommodations needed..."
                  />
                </Form.Group>
                <Form.Group className="form-item">
                  <Form.Label>City</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.location?.city || ""}
                    onChange={(e) =>
                      handleLocationChange("city", e.target.value)
                    }
                    placeholder="Your city"
                  />
                </Form.Group>
                <Form.Group className="form-item">
                  <Form.Label>State/Province</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.location?.state || ""}
                    onChange={(e) =>
                      handleLocationChange("state", e.target.value)
                    }
                    placeholder="Your state"
                  />
                </Form.Group>
                <Form.Group className="form-item">
                  <Form.Label>Country</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.location?.country || ""}
                    onChange={(e) =>
                      handleLocationChange("country", e.target.value)
                    }
                    placeholder="Your country"
                  />
                </Form.Group>
                <Form.Group className="form-item">
                  <Form.Label>Time Zone</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.location?.timeZone || ""}
                    onChange={(e) =>
                      handleLocationChange("timeZone", e.target.value)
                    }
                    placeholder="e.g., UTC+5:30"
                  />
                </Form.Group>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="student-profile-page">
      <Container className="profile-container">
        {/* Profile Header */}
        <div className="profile-header-card">
          <div className="profile-header-content">
            <div className="profile-avatar-section">
              <div className="avatar-wrapper">
                <img
                  src={formatImageUrl(currentUser?.profileImage)}
                  alt="Profile"
                  className="profile-avatar"
                  onError={(e) => {
                    e.target.src = "/images/default-avatar.png";
                  }}
                />
              </div>
              {isEditing && (
                <div className="mt-3">
                  <ProfileImageUpload
                    onUploadSuccess={(imagePath) => {
                      console.log("Profile image uploaded:", imagePath);
                    }}
                  />
                </div>
              )}
            </div>

            <div className="profile-info-section">
              <h1 className="profile-name">
                {currentUser?.firstName} {currentUser?.lastName}
              </h1>
              <p className="profile-subtitle">
                {formData.academicLevel || "Student"}
                {formData.school && ` at ${formData.school}`}
              </p>
            </div>

            <div className="profile-actions">
              {!isEditing ? (
                <Button
                  className="btn-edit-profile"
                  onClick={() => setIsEditing(true)}
                >
                  <FaEdit className="me-2" />
                  Edit Profile
                </Button>
              ) : (
                <div className="action-buttons">
                  <Button
                    className="btn-save"
                    onClick={handleSave}
                    disabled={saving}
                  >
                    <FaSave className="me-2" />
                    {saving ? "Saving..." : "Save"}
                  </Button>
                  <Button className="btn-cancel" onClick={handleCancel}>
                    <FaTimes className="me-2" />
                    Cancel
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Alerts */}
        {error && (
          <Alert
            variant="danger"
            dismissible
            onClose={() => setError("")}
            className="alert-custom"
          >
            <FaExclamationTriangle className="me-2" />
            {error}
          </Alert>
        )}
        {success && (
          <Alert
            variant="success"
            dismissible
            onClose={() => setSuccess("")}
            className="alert-custom"
          >
            <FaCheckCircle className="me-2" />
            {success}
          </Alert>
        )}

        {/* Profile Suggestions */}
        {suggestions.length > 0 && !isEditing && (
          <div className="suggestions-card">
            <div className="suggestions-icon">
              <FaLightbulb />
            </div>
            <div className="suggestions-content">
              <h6>Complete Your Profile</h6>
              <ul>
                {suggestions.slice(0, 3).map((suggestion, index) => (
                  <li key={index}>{suggestion}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Profile Tabs Card */}
        <Card className="profile-tabs-card">
          <Card.Body className="p-0">
            {/* Tab Navigation */}
            <Nav
              className="profile-nav-tabs"
              activeKey={activeTab}
              onSelect={(k) => setActiveTab(k)}
            >
              <Nav.Item>
                <Nav.Link eventKey="personal" className="profile-tab-link">
                  <FaUser className="tab-icon" />
                  <span>Personal</span>
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="academic" className="profile-tab-link">
                  <FaGraduationCap className="tab-icon" />
                  <span>Academic</span>
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="learning" className="profile-tab-link">
                  <FaBrain className="tab-icon" />
                  <span>Learning</span>
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="background" className="profile-tab-link">
                  <FaMapMarkerAlt className="tab-icon" />
                  <span>Background</span>
                </Nav.Link>
              </Nav.Item>
            </Nav>

            {/* Tab Content */}
            <div className="profile-tab-content">{renderTabContent()}</div>
          </Card.Body>
        </Card>

        {/* Mobile Save Button */}
        {isEditing && (
          <div className="mobile-save-bar">
            <Button className="btn-cancel" onClick={handleCancel}>
              Cancel
            </Button>
            <Button className="btn-save" onClick={handleSave} disabled={saving}>
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        )}
      </Container>
    </div>
  );
};

export default StudentProfile;
