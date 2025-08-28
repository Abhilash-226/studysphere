import React, { useState } from "react";
import "./QualificationDetails.css";

const YEARS = Array.from(
  { length: 50 },
  (_, i) => new Date().getFullYear() - i
);

/**
 * QualificationDetails - Component for setting up qualification information
 * @param {Object} props - Component props
 * @param {Object} props.profileData - Current profile data
 * @param {Function} props.updateProfileData - Function to update profile data
 * @returns {React.ReactElement} - Rendered component
 */
const QualificationDetails = ({ profileData, updateProfileData }) => {
  const [certificationName, setCertificationName] = useState("");

  const handleQualificationChange = (e) => {
    updateProfileData({ qualification: e.target.value });
  };

  const handleUniversityChange = (e) => {
    updateProfileData({ university: e.target.value });
  };

  const handleYearChange = (e) => {
    updateProfileData({ graduationYear: e.target.value });
  };

  const handleExperienceChange = (e) => {
    updateProfileData({ experience: e.target.value });
  };

  const handleSpecializationChange = (e) => {
    updateProfileData({ specialization: e.target.value });
  };

  const handleAddCertification = () => {
    if (certificationName.trim()) {
      updateProfileData({
        certifications: [...profileData.certifications, certificationName],
      });
      setCertificationName("");
    }
  };

  const handleRemoveCertification = (index) => {
    const updatedCertifications = profileData.certifications.filter(
      (_, i) => i !== index
    );
    updateProfileData({ certifications: updatedCertifications });
  };

  return (
    <div className="qualification-details-step">
      <h2>Your Qualifications</h2>
      <p className="step-description">
        Tell us about your educational background and qualifications.
      </p>

      <div className="form-group">
        <label htmlFor="qualification">Highest Qualification</label>
        <select
          id="qualification"
          value={profileData.qualification}
          onChange={handleQualificationChange}
        >
          <option value="">Select your qualification</option>
          <option value="High School Diploma">High School Diploma</option>
          <option value="Associate's Degree">Associate's Degree</option>
          <option value="Bachelor's Degree">Bachelor's Degree</option>
          <option value="Master's Degree">Master's Degree</option>
          <option value="Ph.D.">Ph.D.</option>
          <option value="Other Professional Degree">
            Other Professional Degree
          </option>
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="university">University/Institution</label>
        <input
          type="text"
          id="university"
          value={profileData.university}
          onChange={handleUniversityChange}
          placeholder="Enter your university or institution"
        />
      </div>

      <div className="form-group">
        <label htmlFor="graduationYear">Graduation Year</label>
        <select
          id="graduationYear"
          value={profileData.graduationYear}
          onChange={handleYearChange}
        >
          <option value="">Select year</option>
          {YEARS.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="experience">Years of Teaching Experience</label>
        <select
          id="experience"
          value={profileData.experience}
          onChange={handleExperienceChange}
        >
          <option value="">Select experience</option>
          <option value="Less than 1 year">Less than 1 year</option>
          <option value="1-2 years">1-2 years</option>
          <option value="3-5 years">3-5 years</option>
          <option value="5-10 years">5-10 years</option>
          <option value="More than 10 years">More than 10 years</option>
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="specialization">Specialization</label>
        <input
          type="text"
          id="specialization"
          value={profileData.specialization}
          onChange={handleSpecializationChange}
          placeholder="E.g., Calculus, Organic Chemistry, etc."
        />
        <p className="help-text">
          Enter your main area of expertise or specialization
        </p>
      </div>

      <div className="form-group">
        <label>Certifications (Optional)</label>
        <div className="certification-input">
          <input
            type="text"
            value={certificationName}
            onChange={(e) => setCertificationName(e.target.value)}
            placeholder="Add a certification or award"
          />
          <button
            type="button"
            className="btn btn-outline"
            onClick={handleAddCertification}
            disabled={!certificationName.trim()}
          >
            Add
          </button>
        </div>

        {profileData.certifications.length > 0 && (
          <div className="certifications-list">
            <h4>Added Certifications:</h4>
            <ul>
              {profileData.certifications.map((cert, index) => (
                <li key={index}>
                  {cert}
                  <button
                    type="button"
                    className="remove-btn"
                    onClick={() => handleRemoveCertification(index)}
                  >
                    ×
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="form-group document-uploads">
        <h3>Additional Supporting Documents</h3>
        <p className="help-text mb-3">
          Upload additional documents to enhance your profile credibility. ID
          and qualification documents were already provided during signup.
        </p>

        <div>
          <label>Mark Sheet / Academic Transcript (Optional)</label>
          <div className="file-upload">
            <label className="file-upload-label">
              <span className="file-upload-icon">📊</span>
              <span>Upload Mark Sheet</span>
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) {
                    updateProfileData({
                      documents: {
                        ...profileData.documents,
                        markSheet: file,
                      },
                    });
                  }
                }}
              />
            </label>
            {profileData.documents?.markSheet && (
              <div className="file-name">
                {profileData.documents.markSheet.name}
              </div>
            )}
          </div>
          <p className="help-text">
            Upload your academic mark sheet or transcripts to showcase your
            academic performance
          </p>
        </div>

        <div>
          <label>Teaching Experience Certificate (Optional)</label>
          <div className="file-upload">
            <label className="file-upload-label">
              <span className="file-upload-icon">📝</span>
              <span>Upload Experience Certificate</span>
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) {
                    updateProfileData({
                      documents: {
                        ...profileData.documents,
                        experienceCertificate: file,
                      },
                    });
                  }
                }}
              />
            </label>
            {profileData.documents?.experienceCertificate && (
              <div className="file-name">
                {profileData.documents.experienceCertificate.name}
              </div>
            )}
          </div>
          <p className="help-text">
            If you have prior teaching experience, upload certificates from
            previous institutions
          </p>
        </div>

        <div>
          <label>Additional Certifications (Optional)</label>
          <div className="file-upload">
            <label className="file-upload-label">
              <span className="file-upload-icon">🏆</span>
              <span>Upload Additional Certificates</span>
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) {
                    updateProfileData({
                      documents: {
                        ...profileData.documents,
                        additionalCertificates: file,
                      },
                    });
                  }
                }}
              />
            </label>
            {profileData.documents?.additionalCertificates && (
              <div className="file-name">
                {profileData.documents.additionalCertificates.name}
              </div>
            )}
          </div>
          <p className="help-text">
            Upload any additional certifications or specialized training
            documents
          </p>
        </div>
      </div>
    </div>
  );
};

export default QualificationDetails;
