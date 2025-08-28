import React, { useState, useEffect } from "react";
import { Container, Row, Col, Alert, Spinner, Button } from "react-bootstrap";
import { useNavigate, useLocation } from "react-router-dom";
import tutorService from "../../../shared/services/tutor.service";
import { AboutMeEdit } from "./components";
import { TeachingInfoEdit } from "./components";
import { QualificationsEdit } from "./components";
import { SubjectsEdit } from "./components";
import { DocumentsEdit } from "./components";

// Import styles
import "./styles/profile-edit-styles.css";

/**
 * ProfileEdit - Main component for editing tutor profile sections
 * @returns {React.ReactElement} - Rendered component
 */
const ProfileEdit = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Parse the query params to get the section to edit
  const queryParams = new URLSearchParams(location.search);
  const sectionToEdit = queryParams.get("section") || "bio";

  // Fetch tutor profile data
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const response = await tutorService.getProfile();

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

  // Handle saving the edited data
  const handleSave = async (section, data) => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      // Call the appropriate service method based on the section
      const response = await tutorService.updateProfile({
        ...data,
      });

      if (response.success) {
        setSuccess("Your profile has been successfully updated!");
        // Go back to profile page after a brief delay
        setTimeout(() => {
          navigate("/tutor/profile");
        }, 2000);
      } else {
        setError(response.message || "Failed to update profile");
      }
    } catch (err) {
      console.error("Error updating profile:", err);
      setError(err.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  // Handle cancel action
  const handleCancel = () => {
    navigate("/tutor/profile");
  };

  if (loading && !profile) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" role="status" variant="primary">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
        <p className="mt-3">Loading profile data...</p>
      </Container>
    );
  }

  if (error && !profile) {
    return (
      <Container className="py-5">
        <Alert variant="danger">{error}</Alert>
        <div className="text-center mt-3">
          <Button variant="primary" onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </div>
      </Container>
    );
  }

  // Render the appropriate edit component based on the section
  const renderEditSection = () => {
    if (!profile) return null;

    switch (sectionToEdit) {
      case "bio":
        return (
          <AboutMeEdit
            bio={profile.bio}
            onSave={handleSave}
            onCancel={handleCancel}
          />
        );
      case "teaching":
        return (
          <TeachingInfoEdit
            teachingInfo={{
              hourlyRate: profile.hourlyRate,
              teachingStyle: profile.teachingStyle,
              experience: profile.experience,
            }}
            onSave={handleSave}
            onCancel={handleCancel}
          />
        );
      case "qualifications":
        return (
          <QualificationsEdit
            qualifications={profile.qualifications}
            onSave={handleSave}
            onCancel={handleCancel}
          />
        );
      case "subjects":
        return (
          <SubjectsEdit
            subjects={profile.subjects}
            onSave={handleSave}
            onCancel={handleCancel}
          />
        );
      case "documents":
        return (
          <DocumentsEdit
            documents={profile.documents}
            onSave={handleSave}
            onCancel={handleCancel}
          />
        );
      default:
        return (
          <Alert variant="warning">
            Unknown section to edit.{" "}
            <Button onClick={handleCancel}>Go Back</Button>
          </Alert>
        );
    }
  };

  return (
    <Container className="py-5">
      <Row className="mb-4">
        <Col>
          <h2 className="section-title">Edit Profile</h2>
          <p className="text-muted">
            Make changes to your profile information below.
          </p>
          {error && <Alert variant="danger">{error}</Alert>}
          {success && <Alert variant="success">{success}</Alert>}
        </Col>
      </Row>

      {renderEditSection()}
    </Container>
  );
};

export default ProfileEdit;
