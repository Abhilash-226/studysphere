import React, { useState } from "react";
import "./BasicInfo.css";

/**
 * BasicInfo - Component for setting up basic profile information
 * @param {Object} props - Component props
 * @param {Object} props.profileData - Current profile data
 * @param {Function} props.updateProfileData - Function to update profile data
 * @returns {React.ReactElement} - Rendered component
 */
const BasicInfo = ({ profileData, updateProfileData }) => {
  const [imagePreview, setImagePreview] = useState(null);

  const handleBioChange = (e) => {
    updateProfileData({ bio: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      updateProfileData({ profileImage: file });

      // Create a preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="basic-info-step">
      <h2>Tell us about yourself</h2>
      <p className="step-description">
        Start by adding your profile picture and telling students a bit about
        yourself.
      </p>

      <div className="form-group profile-image-upload">
        <label>Profile Picture</label>
        <div className="avatar-preview">
          {imagePreview ? (
            <img src={imagePreview} alt="Profile Preview" />
          ) : (
            <span className="upload-icon">📷</span>
          )}
        </div>
        <div className="file-upload">
          <label className="file-upload-label">
            <span className="file-upload-icon">📤</span>
            <span>Click to upload profile picture</span>
            <input type="file" accept="image/*" onChange={handleImageChange} />
          </label>
        </div>
        <p className="help-text">
          A professional photo helps students connect with you. Recommended
          size: 300x300px.
        </p>
      </div>

      <div className="form-group">
        <label htmlFor="bio">Bio</label>
        <textarea
          id="bio"
          rows="5"
          value={profileData.bio}
          onChange={handleBioChange}
          placeholder="Tell students about your teaching style, experience, and what makes you a great tutor..."
        ></textarea>
        <p className="help-text">
          A great bio helps students understand who you are and how you can help
          them succeed.
        </p>
      </div>
    </div>
  );
};

export default BasicInfo;
