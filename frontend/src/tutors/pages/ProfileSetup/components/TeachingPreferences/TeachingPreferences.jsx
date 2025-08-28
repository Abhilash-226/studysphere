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
        <p className="help-text">Select all that apply</p>
        <div className="checkbox-group">
          <div className="checkbox-item">
            <input
              type="checkbox"
              id="mode-online-individual"
              checked={profileData.teachingMode.includes("online_individual")}
              onChange={() => handleTeachingModeChange("online_individual")}
            />
            <label htmlFor="mode-online-individual">Online (Individual)</label>
          </div>
          <div className="checkbox-item">
            <input
              type="checkbox"
              id="mode-online-group"
              checked={profileData.teachingMode.includes("online_group")}
              onChange={() => handleTeachingModeChange("online_group")}
            />
            <label htmlFor="mode-online-group">Online (Group)</label>
          </div>
          <div className="checkbox-item">
            <input
              type="checkbox"
              id="mode-offline-home"
              checked={profileData.teachingMode.includes("offline_home")}
              onChange={() => handleTeachingModeChange("offline_home")}
            />
            <label htmlFor="mode-offline-home">
              In-Person (Student's Home)
            </label>
          </div>
          <div className="checkbox-item">
            <input
              type="checkbox"
              id="mode-offline-classroom"
              checked={profileData.teachingMode.includes("offline_classroom")}
              onChange={() => handleTeachingModeChange("offline_classroom")}
            />
            <label htmlFor="mode-offline-classroom">
              In-Person (Tutor's Classroom)
            </label>
          </div>
        </div>
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
      {(profileData.teachingMode.includes("offline_home") ||
        profileData.teachingMode.includes("offline_classroom")) && (
        <div className="form-group">
          <label>Location for In-Person Sessions</label>
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
                placeholder="State/Province"
                value={profileData.location.state}
                onChange={(e) => handleLocationChange("state", e.target.value)}
              />
            </div>
          </div>
          <div style={{ marginTop: "10px" }}>
            <input
              type="text"
              placeholder="Country"
              value={profileData.location.country}
              onChange={(e) => handleLocationChange("country", e.target.value)}
            />
          </div>
        </div>
      )}

      {/* Hourly Rate */}
      <div className="form-group">
        <label htmlFor="hourlyRate">Hourly Rate ($)</label>
        <input
          type="number"
          id="hourlyRate"
          min="0"
          step="5"
          value={profileData.hourlyRate}
          onChange={handleHourlyRateChange}
          placeholder="Your hourly rate in USD"
        />
        <p className="help-text">
          Set your hourly rate in USD. You can adjust this later based on your
          experience.
        </p>
      </div>
    </div>
  );
};

export default TeachingPreferences;
