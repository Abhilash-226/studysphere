import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import { useParams, useNavigate } from "react-router-dom";
import AdminLayout from "../../layouts/AdminLayout";
import {
  getTutorForVerification,
  approveTutor,
  rejectTutor,
  requestMoreInfo,
} from "../../../shared/services/admin.service";
import "./TutorVerificationDetail.css";

const TutorVerificationDetail = () => {
  const { tutorId } = useParams();
  const navigate = useNavigate();
  const [tutor, setTutor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [showModal, setShowModal] = useState(null); // 'approve', 'reject', 'info'
  const [notes, setNotes] = useState("");
  const [activeImageModal, setActiveImageModal] = useState(null);

  useEffect(() => {
    fetchTutor();
  }, [tutorId]);

  const fetchTutor = async () => {
    try {
      setLoading(true);
      const data = await getTutorForVerification(tutorId);
      // Handle both data.tutor and data.data structures
      setTutor(data.tutor || data.data || data);
    } catch (err) {
      console.error("Error fetching tutor:", err);
      setError(err.message || "Failed to load tutor details");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    try {
      setActionLoading(true);
      await approveTutor(tutorId, notes);
      setShowModal(null);
      setNotes("");
      fetchTutor();
    } catch (err) {
      console.error("Error approving tutor:", err);
      alert("Failed to approve tutor");
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!notes.trim()) {
      alert("Please provide a reason for rejection");
      return;
    }
    try {
      setActionLoading(true);
      await rejectTutor(tutorId, notes);
      setShowModal(null);
      setNotes("");
      fetchTutor();
    } catch (err) {
      console.error("Error rejecting tutor:", err);
      alert("Failed to reject tutor");
    } finally {
      setActionLoading(false);
    }
  };

  const handleRequestInfo = async () => {
    if (!notes.trim()) {
      alert("Please specify what information is needed");
      return;
    }
    try {
      setActionLoading(true);
      await requestMoreInfo(tutorId, notes);
      setShowModal(null);
      setNotes("");
      fetchTutor();
    } catch (err) {
      console.error("Error requesting info:", err);
      alert("Failed to request more information");
    } finally {
      setActionLoading(false);
    }
  };

  const getDocumentUrl = (path) => {
    if (!path) return null;
    // Handle both relative and absolute paths
    if (path.startsWith("http")) return path;
    return `${window.location.origin}${path.startsWith("/") ? "" : "/"}${path}`;
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="detail-loading">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p>Loading tutor details...</p>
        </div>
      </AdminLayout>
    );
  }

  if (error || !tutor) {
    return (
      <AdminLayout>
        <div className="detail-error">
          <i className="bi bi-exclamation-triangle-fill"></i>
          <h3>Error</h3>
          <p>{error || "Tutor not found"}</p>
          <button
            className="btn btn-primary"
            onClick={() => navigate("/admin/verifications")}
          >
            Back to Queue
          </button>
        </div>
      </AdminLayout>
    );
  }

  const documents = [
    { label: "ID Proof", path: tutor.idDocument, icon: "bi-person-badge" },
    {
      label: "Qualification Certificate",
      path: tutor.qualificationDocument,
      icon: "bi-file-earmark-text",
    },
    { label: "Mark Sheet", path: tutor.markSheet, icon: "bi-file-earmark" },
    {
      label: "Experience Certificate",
      path: tutor.experienceCertificate,
      icon: "bi-briefcase",
    },
    {
      label: "Additional Certificates",
      path: tutor.additionalCertificates,
      icon: "bi-award",
    },
  ].filter((doc) => doc.path);

  return (
    <AdminLayout>
      <div className="tutor-verification-detail">
        {/* Header */}
        <div className="detail-header">
          <button
            className="btn btn-link back-btn"
            onClick={() => navigate("/admin/verifications")}
          >
            <i className="bi bi-arrow-left"></i> Back to Queue
          </button>

          <div className="header-content">
            <div className="tutor-profile">
              <div className="profile-avatar">
                {tutor.user?.profileImage ? (
                  <img src={tutor.user.profileImage} alt={tutor.user?.name} />
                ) : (
                  <span>
                    {tutor.user?.name?.charAt(0)?.toUpperCase() || "T"}
                  </span>
                )}
              </div>
              <div className="profile-info">
                <h2>{tutor.user?.name || "Unknown Tutor"}</h2>
                <p className="profile-email">{tutor.user?.email}</p>
                <span
                  className={`status-badge status-${tutor.verificationStatus}`}
                >
                  {tutor.verificationStatus}
                </span>
              </div>
            </div>

            {tutor.verificationStatus === "pending" && (
              <div className="action-buttons">
                <button
                  className="btn btn-success"
                  onClick={() => setShowModal("approve")}
                >
                  <i className="bi bi-check-lg"></i> Approve
                </button>
                <button
                  className="btn btn-warning"
                  onClick={() => setShowModal("info")}
                >
                  <i className="bi bi-question-lg"></i> Request Info
                </button>
                <button
                  className="btn btn-danger"
                  onClick={() => setShowModal("reject")}
                >
                  <i className="bi bi-x-lg"></i> Reject
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="detail-content">
          <div className="content-grid">
            {/* Profile Details */}
            <div className="detail-section">
              <h3>
                <i className="bi bi-person"></i> Profile Information
              </h3>
              <div className="info-list">
                <div className="info-row">
                  <span className="label">Full Name</span>
                  <span className="value">{tutor.user?.name || "N/A"}</span>
                </div>
                <div className="info-row">
                  <span className="label">Email</span>
                  <span className="value">{tutor.user?.email || "N/A"}</span>
                </div>
                <div className="info-row">
                  <span className="label">Phone</span>
                  <span className="value">{tutor.user?.phone || "N/A"}</span>
                </div>
                <div className="info-row">
                  <span className="label">Registered On</span>
                  <span className="value">{formatDate(tutor.createdAt)}</span>
                </div>
              </div>
            </div>

            {/* Qualification Details */}
            <div className="detail-section">
              <h3>
                <i className="bi bi-mortarboard"></i> Qualification Details
              </h3>
              <div className="info-list">
                <div className="info-row">
                  <span className="label">Highest Qualification</span>
                  <span className="value">
                    {tutor.qualification || "Not specified"}
                  </span>
                </div>
                <div className="info-row">
                  <span className="label">Specialization</span>
                  <span className="value">
                    {tutor.specialization || "Not specified"}
                  </span>
                </div>
                <div className="info-row">
                  <span className="label">University/Institution</span>
                  <span className="value">
                    {tutor.universityName || "Not specified"}
                  </span>
                </div>
                <div className="info-row">
                  <span className="label">Graduation Year</span>
                  <span className="value">
                    {tutor.graduationYear || "Not specified"}
                  </span>
                </div>
                <div className="info-row">
                  <span className="label">Experience</span>
                  <span className="value">
                    {tutor.experience || "Not specified"}
                  </span>
                </div>
                <div className="info-row">
                  <span className="label">ID Number</span>
                  <span className="value">{tutor.idNumber || "N/A"}</span>
                </div>
              </div>
            </div>

            {/* Subjects */}
            {tutor.subjects && tutor.subjects.length > 0 && (
              <div className="detail-section">
                <h3>
                  <i className="bi bi-book"></i> Teaching Subjects
                </h3>
                <div className="subjects-list">
                  {tutor.subjects.map((subject, index) => (
                    <span key={index} className="subject-badge">
                      {subject}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Teaching Mode */}
            {tutor.teachingMode && tutor.teachingMode.length > 0 && (
              <div className="detail-section">
                <h3>
                  <i className="bi bi-laptop"></i> Teaching Modes
                </h3>
                <div className="mode-list">
                  {tutor.teachingMode.map((mode, index) => (
                    <span key={index} className="mode-badge">
                      {mode.replace(/_/g, " ")}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Location */}
            {tutor.location && (
              <div className="detail-section">
                <h3>
                  <i className="bi bi-geo-alt"></i> Location
                </h3>
                <div className="info-list">
                  <div className="info-row">
                    <span className="label">City</span>
                    <span className="value">
                      {tutor.location.city || "N/A"}
                    </span>
                  </div>
                  <div className="info-row">
                    <span className="label">State</span>
                    <span className="value">
                      {tutor.location.state || "N/A"}
                    </span>
                  </div>
                  <div className="info-row">
                    <span className="label">Country</span>
                    <span className="value">
                      {tutor.location.country || "N/A"}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Bio */}
            {tutor.bio && (
              <div className="detail-section full-width">
                <h3>
                  <i className="bi bi-file-text"></i> Bio
                </h3>
                <p className="bio-text">{tutor.bio}</p>
              </div>
            )}

            {/* Documents */}
            <div className="detail-section full-width">
              <h3>
                <i className="bi bi-folder2-open"></i> Uploaded Documents
              </h3>
              {documents.length > 0 ? (
                <div className="documents-grid">
                  {documents.map((doc, index) => (
                    <div key={index} className="document-card">
                      <div className="doc-header">
                        <i className={`bi ${doc.icon}`}></i>
                        <span>{doc.label}</span>
                      </div>
                      <div className="doc-preview">
                        {doc.path.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                          <img
                            src={getDocumentUrl(doc.path)}
                            alt={doc.label}
                            onClick={() => setActiveImageModal(doc)}
                          />
                        ) : (
                          <div className="doc-file">
                            <i className="bi bi-file-earmark-pdf"></i>
                            <span>Document</span>
                          </div>
                        )}
                      </div>
                      <div className="doc-actions">
                        <a
                          href={getDocumentUrl(doc.path)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-sm btn-outline-primary"
                        >
                          <i className="bi bi-eye"></i> View
                        </a>
                        <a
                          href={getDocumentUrl(doc.path)}
                          download
                          className="btn btn-sm btn-outline-secondary"
                        >
                          <i className="bi bi-download"></i> Download
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="no-documents">
                  <i className="bi bi-file-earmark-x"></i>
                  <p>No documents uploaded</p>
                </div>
              )}
            </div>

            {/* Verification History */}
            {tutor.verificationHistory &&
              tutor.verificationHistory.length > 0 && (
                <div className="detail-section full-width">
                  <h3>
                    <i className="bi bi-clock-history"></i> Verification History
                  </h3>
                  <div className="history-timeline">
                    {tutor.verificationHistory.map((item, index) => (
                      <div
                        key={index}
                        className={`history-item history-${item.action}`}
                      >
                        <div className="history-marker"></div>
                        <div className="history-content">
                          <div className="history-header">
                            <span className="history-action">
                              {item.action}
                            </span>
                            <span className="history-date">
                              {formatDate(item.timestamp)}
                            </span>
                          </div>
                          {item.notes && (
                            <p className="history-notes">{item.notes}</p>
                          )}
                          {item.performedBy && (
                            <span className="history-by">
                              By: {item.performedBy.name || "System"}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
          </div>
        </div>

        {/* Action Modals - Using Portal to render outside component hierarchy */}
        {showModal &&
          ReactDOM.createPortal(
            <div className="verification-modal-wrapper">
              <div
                className="verification-modal-backdrop"
                onClick={() => setShowModal(null)}
              />
              <div className="verification-modal-container">
                <div className="verification-modal-content">
                  <div className="verification-modal-header">
                    <h4>
                      {showModal === "approve" && "Approve Tutor"}
                      {showModal === "reject" && "Reject Tutor"}
                      {showModal === "info" && "Request More Information"}
                    </h4>
                    <button
                      type="button"
                      className="verification-modal-close"
                      onClick={() => setShowModal(null)}
                    >
                      ×
                    </button>
                  </div>
                  <div className="verification-modal-body">
                    {showModal === "approve" && (
                      <>
                        <p>
                          You are about to approve{" "}
                          <strong>
                            {tutor.user?.name || tutor.user?.firstName}
                          </strong>
                          's tutor application. They will be notified by email.
                        </p>
                        <div className="form-group">
                          <label>Notes (Optional)</label>
                          <textarea
                            className="form-control"
                            rows="3"
                            placeholder="Add any notes..."
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                          />
                        </div>
                      </>
                    )}
                    {showModal === "reject" && (
                      <>
                        <p>
                          Please provide a reason for rejecting{" "}
                          <strong>
                            {tutor.user?.name || tutor.user?.firstName}
                          </strong>
                          's application.
                        </p>
                        <div className="form-group">
                          <label>Rejection Reason *</label>
                          <textarea
                            className="form-control"
                            rows="4"
                            placeholder="Explain why the application is being rejected..."
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            required
                          />
                        </div>
                      </>
                    )}
                    {showModal === "info" && (
                      <>
                        <p>
                          Specify what additional information you need from{" "}
                          <strong>
                            {tutor.user?.name || tutor.user?.firstName}
                          </strong>
                          .
                        </p>
                        <div className="form-group">
                          <label>Information Requested *</label>
                          <textarea
                            className="form-control"
                            rows="4"
                            placeholder="e.g., Please upload a clearer image of your ID..."
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            required
                          />
                        </div>
                      </>
                    )}
                  </div>
                  <div className="verification-modal-footer">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => setShowModal(null)}
                      disabled={actionLoading}
                    >
                      Cancel
                    </button>
                    {showModal === "approve" && (
                      <button
                        type="button"
                        className="btn btn-success"
                        onClick={handleApprove}
                        disabled={actionLoading}
                      >
                        {actionLoading ? "Approving..." : "Approve"}
                      </button>
                    )}
                    {showModal === "reject" && (
                      <button
                        type="button"
                        className="btn btn-danger"
                        onClick={handleReject}
                        disabled={actionLoading}
                      >
                        {actionLoading ? "Rejecting..." : "Reject"}
                      </button>
                    )}
                    {showModal === "info" && (
                      <button
                        type="button"
                        className="btn btn-warning"
                        onClick={handleRequestInfo}
                        disabled={actionLoading}
                      >
                        {actionLoading ? "Sending..." : "Send Request"}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>,
            document.body
          )}

        {/* Image Preview Modal */}
        {activeImageModal && (
          <div
            className="modal-overlay image-modal"
            onClick={() => setActiveImageModal(null)}
          >
            <div
              className="image-modal-content"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                className="close-btn"
                onClick={() => setActiveImageModal(null)}
              >
                <i className="bi bi-x-lg"></i>
              </button>
              <img
                src={getDocumentUrl(activeImageModal.path)}
                alt={activeImageModal.label}
              />
              <p>{activeImageModal.label}</p>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default TutorVerificationDetail;
