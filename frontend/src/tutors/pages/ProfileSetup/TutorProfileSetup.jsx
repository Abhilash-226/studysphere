import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../shared/context/AuthContext";
import tutorService from "../../../shared/services/tutor.service";
import {
  BasicInfo,
  TeachingPreferences,
  QualificationDetails,
  AvailabilitySchedule,
} from "./components";
import "./TutorProfileSetup.css";

const TutorProfileSetup = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Profile data state
  const [profileData, setProfileData] = useState({
    // Basic info
    bio: "",
    profileImage: null,

    // Teaching preferences
    teachingMode: [], // online_individual, online_group, offline_home, offline_classroom
    subjects: [], // array of subjects
    preferredClasses: [], // array of class levels
    location: {
      city: "",
      state: "",
      country: "",
    },
    hourlyRate: 0,

    // Qualifications
    qualification: "",
    university: "",
    experience: "",
    graduationYear: "",
    specialization: "",
    certifications: [],
    documents: {
      idDocument: null,
      qualificationDocument: null,
      markSheet: null,
      experienceCertificate: null,
      additionalCertificates: null,
    },

    // Availability
    availability: [
      // Format: { day: 'Monday', startTime: '09:00', endTime: '17:00' }
    ],
  });

  // Fetch tutor profile data when component mounts
  useEffect(() => {
    const fetchTutorData = async () => {
      try {
        const response = await tutorService.getProfile();

        if (response.success && response.tutor) {
          // Pre-populate the form with existing data
          const tutor = response.tutor;
          const user = response.user || {};

          setProfileData((prevData) => ({
            ...prevData,
            bio: tutor.bio || "",
            teachingMode: tutor.teachingMode || [],
            subjects: tutor.subjects || [],
            preferredClasses: tutor.preferredClasses || [],
            location: tutor.location || { city: "", state: "", country: "" },
            hourlyRate: tutor.hourlyRate || 0,
            // Pre-fill qualification data from signup
            qualification: tutor.qualification || "",
            university: tutor.universityName || "",
            experience: tutor.experience || "",
            graduationYear: tutor.graduationYear || "",
            specialization: tutor.specialization || "",
            availability: tutor.availability || [],
          }));
        }
      } catch (err) {
        console.error("Error fetching tutor profile:", err);
        // Not setting error state here as this is just pre-population
      } finally {
        setIsLoading(false);
      }
    };

    fetchTutorData();
  }, []);

  const updateProfileData = (stepData) => {
    setProfileData((prevData) => ({
      ...prevData,
      ...stepData,
    }));
  };

  const nextStep = () => {
    setCurrentStep((prevStep) => prevStep + 1);
    window.scrollTo(0, 0);
  };

  const prevStep = () => {
    setCurrentStep((prevStep) => prevStep - 1);
    window.scrollTo(0, 0);
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Format the data for the API
      const formData = new FormData();

      // Append basic text data
      formData.append("bio", profileData.bio);
      formData.append("teachingMode", JSON.stringify(profileData.teachingMode));
      formData.append("subjects", JSON.stringify(profileData.subjects));
      formData.append(
        "preferredClasses",
        JSON.stringify(profileData.preferredClasses)
      );
      formData.append("location", JSON.stringify(profileData.location));
      formData.append("hourlyRate", profileData.hourlyRate);

      // Only append qualification fields if they've been changed
      // These fields might have been populated from signup
      if (profileData.qualification) {
        formData.append("qualification", profileData.qualification);
      }
      if (profileData.university) {
        formData.append("universityName", profileData.university);
      }
      if (profileData.experience) {
        formData.append("experience", profileData.experience);
      }
      if (profileData.graduationYear) {
        formData.append("graduationYear", profileData.graduationYear);
      }
      if (profileData.specialization) {
        formData.append("specialization", profileData.specialization);
      }

      formData.append(
        "certifications",
        JSON.stringify(profileData.certifications)
      );
      formData.append("availability", JSON.stringify(profileData.availability));

      // Append files if they exist
      if (profileData.profileImage) {
        formData.append("profileImage", profileData.profileImage);
      }

      // Only append documents if new ones were uploaded
      // Don't require document uploads again if they were uploaded during signup
      if (profileData.documents.idDocument) {
        formData.append("idDocument", profileData.documents.idDocument);
      }

      if (profileData.documents.qualificationDocument) {
        formData.append(
          "qualificationDocument",
          profileData.documents.qualificationDocument
        );
      }

      // Append new document types
      if (profileData.documents.markSheet) {
        formData.append("markSheet", profileData.documents.markSheet);
      }

      if (profileData.documents.experienceCertificate) {
        formData.append(
          "experienceCertificate",
          profileData.documents.experienceCertificate
        );
      }

      if (profileData.documents.additionalCertificates) {
        formData.append(
          "additionalCertificates",
          profileData.documents.additionalCertificates
        );
      }

      // Submit to the API
      const response = await tutorService.updateProfile(formData);

      if (response.success) {
        navigate("/tutor/profile");
      } else {
        throw new Error(response.message || "Failed to update profile");
      }
    } catch (err) {
      console.error("Error updating profile:", err);
      setError(err.message || "An error occurred while updating your profile");
    } finally {
      setIsLoading(false);
    }
  };

  // Determine if the current step is valid and can proceed
  const validateCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return profileData.bio.trim().length > 0;
      case 2:
        return (
          profileData.teachingMode.length > 0 &&
          profileData.subjects.length > 0 &&
          (!(
            profileData.teachingMode.includes("offline_home") ||
            profileData.teachingMode.includes("offline_classroom")
          ) ||
            (profileData.location.city && profileData.location.country))
        );
      case 3:
        // Check qualification fields
        const hasQualifications =
          profileData.qualification &&
          profileData.university &&
          profileData.experience &&
          profileData.specialization;

        // Check required documents (ID proof and qualification certificate)
        const hasRequiredDocuments =
          profileData.documents.idDocument &&
          profileData.documents.qualificationDocument;

        // If we're loading data, consider it valid
        // Otherwise, require both qualification fields AND required documents
        return isLoading || (hasQualifications && hasRequiredDocuments);
      case 4:
        return profileData.availability.length > 0;
      default:
        return false;
    }
  };

  // Render the current step
  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <BasicInfo
            profileData={profileData}
            updateProfileData={updateProfileData}
          />
        );
      case 2:
        return (
          <TeachingPreferences
            profileData={profileData}
            updateProfileData={updateProfileData}
          />
        );
      case 3:
        return (
          <QualificationDetails
            profileData={profileData}
            updateProfileData={updateProfileData}
          />
        );
      case 4:
        return (
          <AvailabilitySchedule
            profileData={profileData}
            updateProfileData={updateProfileData}
          />
        );
      default:
        return <div>Unknown step</div>;
    }
  };

  return (
    <div className="tutor-profile-setup">
      <div className="profile-setup-container">
        <header className="profile-setup-header">
          <h1>Complete Your Tutor Profile</h1>
          <p>Set up your profile to start accepting tutoring sessions</p>
        </header>

        <div className="setup-progress">
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${(currentStep / 4) * 100}%` }}
            ></div>
          </div>
          <div className="progress-steps">
            <div
              className={`progress-step ${currentStep >= 1 ? "active" : ""}`}
            >
              <div className="step-number">1</div>
              <span>Basic Info</span>
            </div>
            <div
              className={`progress-step ${currentStep >= 2 ? "active" : ""}`}
            >
              <div className="step-number">2</div>
              <span>Teaching</span>
            </div>
            <div
              className={`progress-step ${currentStep >= 3 ? "active" : ""}`}
            >
              <div className="step-number">3</div>
              <span>Qualifications</span>
            </div>
            <div
              className={`progress-step ${currentStep >= 4 ? "active" : ""}`}
            >
              <div className="step-number">4</div>
              <span>Availability</span>
            </div>
          </div>
        </div>

        <div className="profile-setup-form">
          {renderStep()}

          {error && <div className="error-message">{error}</div>}

          <div className="setup-navigation">
            {currentStep > 1 && (
              <button
                className="btn btn-outline"
                onClick={prevStep}
                disabled={isLoading}
              >
                Previous
              </button>
            )}

            {currentStep < 4 ? (
              <button
                className="btn btn-primary"
                onClick={nextStep}
                disabled={isLoading || !validateCurrentStep()}
              >
                Next
              </button>
            ) : (
              <button
                className="btn btn-primary"
                onClick={handleSubmit}
                disabled={isLoading || !validateCurrentStep()}
              >
                {isLoading ? "Submitting..." : "Submit Profile"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TutorProfileSetup;
