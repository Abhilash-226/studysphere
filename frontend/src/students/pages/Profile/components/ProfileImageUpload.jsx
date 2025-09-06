import React, { useState } from "react";
import { Button, Alert, Spinner } from "react-bootstrap";
import { FaCamera, FaUpload } from "react-icons/fa";
import uploadService from "../../../../shared/services/upload.service";
import { useAuth } from "../../../../shared/context/AuthContext";
import "./ProfileImageUpload.css";

const ProfileImageUpload = ({ onUploadSuccess, className = "" }) => {
  const { currentUser, setCurrentUser } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [dragOver, setDragOver] = useState(false);

  const handleFileSelect = async (file) => {
    if (!file) return;

    // Validate file
    const validation = uploadService.validateImageFile(file);
    if (!validation.isValid) {
      setError(validation.error);
      return;
    }

    setError("");
    setUploading(true);

    try {
      const response = await uploadService.uploadProfileImage(file);

      if (response.success) {
        // Update user context with new profile image
        const updatedUser = {
          ...currentUser,
          profileImage: response.data.profileImage,
        };
        setCurrentUser(updatedUser);

        // Update localStorage
        localStorage.setItem("user", JSON.stringify(updatedUser));

        // Call success callback
        if (onUploadSuccess) {
          onUploadSuccess(response.data.profileImage);
        }
      } else {
        setError(response.message || "Failed to upload image");
      }
    } catch (error) {
      console.error("Upload error:", error);
      setError(error.response?.data?.message || "Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  const handleFileInputChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  return (
    <div className={`profile-image-upload ${className}`}>
      {error && (
        <Alert
          variant="danger"
          className="mb-3"
          dismissible
          onClose={() => setError("")}
        >
          {error}
        </Alert>
      )}

      <div
        className={`upload-area ${dragOver ? "drag-over" : ""}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          type="file"
          id="profile-image-input"
          accept="image/jpeg,image/jpg,image/png,image/gif"
          onChange={handleFileInputChange}
          style={{ display: "none" }}
          disabled={uploading}
        />

        <label
          htmlFor="profile-image-input"
          className="upload-label"
          style={{ cursor: uploading ? "not-allowed" : "pointer" }}
        >
          <div className="upload-content">
            {uploading ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Uploading...
              </>
            ) : (
              <>
                <FaCamera className="upload-icon me-2" />
                Click or drag to upload
              </>
            )}
          </div>
        </label>

        <div className="upload-hint">
          <small className="text-muted">
            Supports: JPEG, PNG, GIF (max 5MB)
          </small>
        </div>
      </div>

      <Button
        variant="outline-primary"
        size="sm"
        className="mt-2"
        onClick={() => document.getElementById("profile-image-input").click()}
        disabled={uploading}
      >
        <FaUpload className="me-1" />
        {uploading ? "Uploading..." : "Change Photo"}
      </Button>
    </div>
  );
};

export default ProfileImageUpload;
