import React from "react";
import { Card, ProgressBar, Badge } from "react-bootstrap";
import { FaPencilAlt } from "react-icons/fa";
import { formatImageUrl } from "../../../../../shared/utils/imageUtils";
import "./ProfileHeaderSection.css";

/**
 * ProfileHeaderSection - Header section of the tutor profile
 * @param {Object} props - Component props
 * @param {Object} props.user - User basic info
 * @param {string} props.user.firstName - User's first name
 * @param {string} props.user.lastName - User's last name
 * @param {string} props.user.email - User's email
 * @param {string} props.user.gender - User's gender
 * @param {string} props.profileImage - URL to profile image
 * @param {number} props.completionPercentage - Profile completion percentage
 * @param {string} props.qualification - Tutor qualification
 * @param {string} props.specialization - Tutor specialization
 * @param {number} props.experience - Years of experience
 * @param {Function} props.onEdit - Function to handle edit actions
 * @returns {React.ReactElement} - Rendered component
 */
const ProfileHeaderSection = ({
  user,
  profileImage,
  completionPercentage = 0,
  qualification,
  specialization,
  experience,
  location,
  onEdit,
}) => {
  return (
    <Card>
      <div className="profile-header">
        <div className="profile-image-container">
          <img
            src={formatImageUrl(profileImage)}
            alt="Profile"
            className="profile-image"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "/images/default-avatar.png";
            }}
          />
          <button
            className="profile-edit-button"
            onClick={() => onEdit("profilePicture")}
            title="Change profile picture"
          >
            <FaPencilAlt size={16} />
          </button>
        </div>
      </div>

      <div className="profile-info">
        <h3 className="mb-1">
          {user?.firstName} {user?.lastName}
        </h3>
        <p className="text-muted mb-3">{user?.email}</p>

        <div className="profile-completion">
          <div className="profile-completion-row">
            <div className="profile-completion-label">Profile Completion</div>
            <div className="profile-completion-value">
              {completionPercentage}%
            </div>
          </div>
          <ProgressBar
            now={completionPercentage}
            variant={completionPercentage < 70 ? "warning" : "success"}
            className="mb-3"
          />
        </div>

        <div className="d-flex justify-content-center mb-3">
          <button
            className="btn btn-outline-primary btn-sm"
            onClick={() => onEdit("personalInfo")}
            title="Edit personal information and location"
          >
            <FaPencilAlt className="me-1" />
            Edit Personal Info
          </button>
        </div>

        <div className="d-flex flex-wrap justify-content-center mt-3 mb-3">
          <Badge bg="primary" className="me-2 mb-2 py-2 px-3">
            {qualification || "No Qualification"}
          </Badge>
          <Badge bg="info" className="me-2 mb-2 py-2 px-3">
            {specialization || "No Specialization"}
          </Badge>
          <Badge bg="secondary" className="me-2 mb-2 py-2 px-3">
            {experience || "null"} Years Experience
          </Badge>
          {user?.gender && (
            <Badge bg="success" className="mb-2 py-2 px-3">
              {user.gender}
            </Badge>
          )}
        </div>
      </div>
    </Card>
  );
};

export default ProfileHeaderSection;
