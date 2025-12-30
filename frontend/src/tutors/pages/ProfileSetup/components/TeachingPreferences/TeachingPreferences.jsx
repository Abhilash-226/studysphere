import React, { useState } from "react";
import "./TeachingPreferences.css";

const SUBJECTS = [
  "Mathematics",
  "Physics",
  "Chemistry",
  "Biology",
  "Computer Science",
  "Literature",
  "History",
  "Geography",
  "Economics",
  "Business Studies",
  "Political Science",
  "Psychology",
  "Sociology",
  "English",
  "Spanish",
  "French",
  "German",
  "Art",
  "Music",
  "Physical Education",
];

const CLASS_LEVELS = [
  "Elementary (Grades 1-5)",
  "Middle School (Grades 6-8)",
  "High School (Grades 9-12)",
  "College/University",
  "Adult Education",
  "Professional Development",
];

/**
 * TeachingPreferences - Component for setting up teaching preferences
 * @param {Object} props - Component props
 * @param {Object} props.profileData - Current profile data
 * @param {Function} props.updateProfileData - Function to update profile data
 * @returns {React.ReactElement} - Rendered component
 */
const TeachingPreferences = ({ profileData, updateProfileData }) => {
  // Helper function to toggle items in an array
  const toggleArrayItem = (array, item) => {
    if (array.includes(item)) {
      return array.filter((i) => i !== item);
    }
    return [...array, item];
  };

  const handleTeachingModeChange = (mode) => {
    // Allow multiple teaching modes to be selected
    const newTeachingMode = toggleArrayItem(profileData.teachingMode, mode);
    updateProfileData({ teachingMode: newTeachingMode });
  };

  const handleSubjectChange = (subject) => {
    const newSubjects = toggleArrayItem(profileData.subjects, subject);
    updateProfileData({ subjects: newSubjects });
  };

  const handleClassLevelChange = (level) => {
    const newLevels = toggleArrayItem(profileData.preferredClasses, level);
    updateProfileData({ preferredClasses: newLevels });
  };

  const handleLocationChange = (field, value) => {
    updateProfileData({
      location: {
        ...profileData.location,
        [field]: value,
      },
    });
  };

  const handleHourlyRateChange = (e) => {
    const rate = parseFloat(e.target.value);
    updateProfileData({ hourlyRate: rate });
  };

  return (
    <div className="teaching-preferences-step">
      <h2>Your Teaching Preferences</h2>
      <p className="step-description">
        Tell us how and what you prefer to teach.
      </p>

      {/* Teaching Mode */}
      <div className="form-group">
        <label>Teaching Mode</label>
        <p className="help-text">
          Select how you want to teach (you can select both)
        </p>
        <div className="checkbox-group">
          <div className="checkbox-item">
            <input
              type="checkbox"
              id="mode-online"
              checked={profileData.teachingMode.includes("online")}
              onChange={() => handleTeachingModeChange("online")}
            />
            <label htmlFor="mode-online">
              <strong>Online Tutoring</strong>
              <span className="mode-description">
                Conduct live video sessions through our platform. Students book
                and pay online.
              </span>
            </label>
          </div>
          <div className="checkbox-item">
            <input
              type="checkbox"
              id="mode-offline"
              checked={profileData.teachingMode.includes("offline")}
              onChange={() => handleTeachingModeChange("offline")}
            />
            <label htmlFor="mode-offline">
              <strong>In-Person Tutoring</strong>
              <span className="mode-description">
                Students can contact you directly for in-person sessions. You
                handle scheduling and payments.
              </span>
            </label>
          </div>
        </div>
        <p className="info-note">
          <strong>Note:</strong> For group classes/coaching centres, use the{" "}
          <strong>Classrooms</strong> feature to list your institute.
        </p>
      </div>

      {/* Subjects */}
      <div className="form-group">
        <label>Subjects You Teach</label>
        <p className="help-text">
          Select all subjects you're qualified to teach
        </p>
        <div className="tag-selection">
          {SUBJECTS.map((subject) => (
            <div
              key={subject}
              className={`tag ${
                profileData.subjects.includes(subject) ? "selected" : ""
              }`}
              onClick={() => handleSubjectChange(subject)}
            >
              {subject}
            </div>
          ))}
        </div>
      </div>

      {/* Class Levels */}
      <div className="form-group">
        <label>Preferred Class Levels</label>
        <p className="help-text">
          Select all levels you're comfortable teaching
        </p>
        <div className="checkbox-group">
          {CLASS_LEVELS.map((level) => (
            <div className="checkbox-item" key={level}>
              <input
                type="checkbox"
                id={`level-${level}`}
                checked={profileData.preferredClasses.includes(level)}
                onChange={() => handleClassLevelChange(level)}
              />
              <label htmlFor={`level-${level}`}>{level}</label>
            </div>
          ))}
        </div>
      </div>

      {/* Location (for offline teaching) */}
      {profileData.teachingMode.includes("offline") && (
        <div className="form-group">
          <label>Location for In-Person Sessions</label>
          <p className="help-text">
            Where are you available for in-person tutoring?
          </p>
          <div className="location-fields">
            <div>
              <input
                type="text"
                placeholder="City"
                value={profileData.location.city}
                onChange={(e) => handleLocationChange("city", e.target.value)}
              />
            </div>
            <div>
              <input
                type="text"
                placeholder="State"
                value={profileData.location.state}
                onChange={(e) => handleLocationChange("state", e.target.value)}
              />
            </div>
          </div>
          <div style={{ marginTop: "10px" }}>
            <input
              type="text"
              placeholder="Country (e.g., India)"
              value={profileData.location.country}
              onChange={(e) => handleLocationChange("country", e.target.value)}
            />
          </div>
        </div>
      )}

      {/* Hourly Rate - Only shown for online tutoring */}
      {profileData.teachingMode.includes("online") && (
        <div className="form-group">
          <label htmlFor="hourlyRate">Hourly Rate (₹)</label>
          <input
            type="number"
            id="hourlyRate"
            min="0"
            step="50"
            value={profileData.hourlyRate}
            onChange={handleHourlyRateChange}
            placeholder="Your hourly rate in INR (e.g., 500)"
          />
          <p className="help-text">
            Set your hourly rate in Indian Rupees. This will be used for online
            session bookings.
          </p>
        </div>
      )}
    </div>
  );
};

export default TeachingPreferences;
