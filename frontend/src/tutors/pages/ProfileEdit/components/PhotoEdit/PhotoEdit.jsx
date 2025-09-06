import React, { useState, useEffect } from "react";
import uploadService from "../../../../../shared/services/upload.service";
import tutorService from "../../../../../shared/services/tutor.service";
import { useAuth } from "../../../../../shared/context/AuthContext";
import { FaSpinner, FaTimes, FaCheck } from "react-icons/fa";
import "./PhotoEdit.css";

/**
 * PhotoEdit - Component for editing profile photo
 * @param {Object} props - Component props
 * @param {Function} props.onCancel - Function to call when canceling edit
 * @param {Function} props.onSave - Function to call when saving changes
 * @returns {React.ReactElement} - Rendered component
 */
const PhotoEdit = ({ onCancel, onSave }) => {
  const { user, updateUser } = useAuth();
  const [currentImage, setCurrentImage] = useState("");
  const [imagePreview, setImagePreview] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (user?.profileImage) {
      const imageUrl = uploadService.getImageUrl(user.profileImage);
      setCurrentImage(imageUrl);
      setImagePreview(imageUrl);
    }
  }, [user]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError("Image size must be less than 5MB");
        return;
      }

      // Validate file type
      if (!file.type.startsWith("image/")) {
        setError("Please select a valid image file");
        return;
      }

      setSelectedFile(file);
      setError("");

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    if (!selectedFile) {
      setError("Please select a new image");
      return;
    }

    setIsUploading(true);
    setError("");
    setSuccess("");

    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append("profileImage", selectedFile);

      // Update profile with new image
      const response = await tutorService.updateProfile(formData);

      if (response.success) {
        // Update user context with new profile image
        const updatedUser = {
          ...user,
          profileImage: response.tutor.profileImage,
        };
        updateUser(updatedUser);

        setSuccess("Profile photo updated successfully!");

        // Call parent onSave callback after a short delay
        setTimeout(() => {
          onSave(response.tutor);
        }, 1500);
      } else {
        throw new Error(response.message || "Failed to update profile photo");
      }
    } catch (error) {
      console.error("Error updating profile photo:", error);
      setError(
        error.message || "Failed to update profile photo. Please try again."
      );
    } finally {
      setIsUploading(false);
    }
  };

  const handleCancel = () => {
    setImagePreview(currentImage);
    setSelectedFile(null);
    setError("");
    setSuccess("");
    onCancel();
  };

  return (
    <div className="photo-edit">
      <div className="edit-header">
        <h3>Change Profile Photo</h3>
        <p>Upload a professional photo to help students connect with you.</p>
      </div>

      <div className="photo-edit-content">
        <div className="current-photo">
          <div className="photo-preview">
            {imagePreview ? (
              <img
                src={imagePreview}
                alt="Profile Preview"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "/images/tutors/tutor-placeholder.svg";
                }}
              />
            ) : (
              <div className="no-photo">
                <span>📷</span>
                <p>No photo selected</p>
              </div>
            )}
          </div>
        </div>

        <div className="photo-upload">
          <div className="file-upload">
            <label className="file-upload-label">
              <span className="file-upload-icon">📤</span>
              <span>{selectedFile ? "Change Photo" : "Select New Photo"}</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                disabled={isUploading}
              />
            </label>
          </div>

          {selectedFile && (
            <div className="selected-file">
              <span>Selected: {selectedFile.name}</span>
            </div>
          )}

          <div className="photo-guidelines">
            <h5>Photo Guidelines:</h5>
            <ul>
              <li>Use a clear, professional headshot</li>
              <li>Face should be clearly visible</li>
              <li>Recommended size: 300x300px</li>
              <li>Maximum file size: 5MB</li>
              <li>Supported formats: JPG, PNG, GIF</li>
            </ul>
          </div>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger">
          <FaTimes className="me-2" />
          {error}
        </div>
      )}

      {success && (
        <div className="alert alert-success">
          <FaCheck className="me-2" />
          {success}
        </div>
      )}

      <div className="edit-actions">
        <button
          className="btn btn-secondary"
          onClick={handleCancel}
          disabled={isUploading}
        >
          Cancel
        </button>
        <button
          className="btn btn-primary"
          onClick={handleSave}
          disabled={isUploading || !selectedFile}
        >
          {isUploading ? (
            <>
              <FaSpinner className="spin me-2" />
              Uploading...
            </>
          ) : (
            "Save Photo"
          )}
        </button>
      </div>
    </div>
  );
};

export default PhotoEdit;
