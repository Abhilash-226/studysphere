import React, { useState, useEffect } from "react";
import { Container, Row, Col, Alert, Spinner } from "react-bootstrap";
import { Link } from "react-router-dom";
import tutorService from "../../../shared/services/tutor.service";
import {
  ProfileHeaderSection,
  AboutMeSection,
  TeachingInfoSection,
  QualificationsSection,
  SubjectsSection,
  DocumentsSection,
} from "./components";

// Import styles
import "./styles/variables.css";
import "./styles/profile-styles.css";
import "./styles/card-header-styles.css";

/**
 * TutorProfile - Main component for the tutor profile page
 * @returns {React.ReactElement} - Rendered component
 */
const TutorProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch tutor profile data
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const response = await tutorService.getProfile();
        console.log("Profile response:", response);

        if (response.success) {
          setProfile(response.tutor);
        } else {
          setError(response.message || "Failed to load profile");
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
        let errorMessage = "Failed to load profile. Please try again later.";
        if (err.message) {
          errorMessage = err.message;
        }
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  // Handle edit functions for different sections
  const handleSectionEdit = (section) => {
    // Redirect to the profile edit page with a section parameter
    console.log(`Editing section: ${section}`);

    // Using React Router navigation
    window.location.href = `/tutor/profile-edit?section=${section}`;
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
      </Container>
    );
  }

  if (!profile) {
    return (
      <Container className="py-5">
        <Alert variant="info">
          Your profile is not set up yet.
          <Link to="/tutor/profile-setup" className="ms-2">
            Set up your profile now
          </Link>
        </Alert>
      </Container>
    );
  }

  // Extract necessary data from profile
  const {
    user,
    bio,
    qualification,
    universityName,
    specialization,
    experience,
    hourlyRate,
    teachingMode,
    subjects,
    profileImage,
    graduationYear,
    documents = {},
  } = profile;

  // Calculate profile completion percentage
  const requiredFields = [
    bio,
    qualification,
    specialization,
    hourlyRate,
    teachingMode,
    subjects,
    profileImage,
  ];

  const completionPercentage = Math.round(
    (requiredFields.filter(Boolean).length / requiredFields.length) * 100
  );

  return (
    <div className="tutor-profile-container py-4">
      <h1 className="mb-4">My Profile</h1>

      <Row className="mb-4">
        <Col lg={4} className="mb-4 mb-lg-0">
          {/* Profile Header with basic info */}
          <ProfileHeaderSection
            user={user}
            profileImage={profileImage}
            completionPercentage={completionPercentage}
            qualification={qualification}
            specialization={specialization}
            experience={experience}
            onEdit={handleSectionEdit}
          />

          {/* Teaching Information */}
          <TeachingInfoSection
            hourlyRate={hourlyRate}
            teachingMode={teachingMode}
            onEdit={handleSectionEdit}
          />
        </Col>

        <Col lg={8}>
          {/* About Me Section */}
          <AboutMeSection bio={bio} onEdit={handleSectionEdit} />

          {/* Qualifications and Subjects in a two-column layout */}
          <Row className="mb-4">
            <Col md={6} className="mb-4 mb-md-0">
              <QualificationsSection
                qualifications={{
                  degree: qualification,
                  institution: universityName,
                  field: specialization,
                  graduationYear: graduationYear,
                }}
                onEdit={handleSectionEdit}
              />
            </Col>
            <Col md={6}>
              <SubjectsSection subjects={subjects} onEdit={handleSectionEdit} />
            </Col>
          </Row>

          {/* Documents Section */}
          <DocumentsSection documents={documents} onEdit={handleSectionEdit} />
        </Col>
      </Row>
    </div>
  );
};

export default TutorProfile;
