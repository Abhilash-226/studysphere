import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import sessionService from "../../../shared/services/session.service";
import { formatImageUrl } from "../../../shared/utils/imageUtils";
import "./TutorSessionDetails.css";

const TutorSessionDetails = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchSessionDetails();
  }, [sessionId]);

  const fetchSessionDetails = async () => {
    try {
      setLoading(true);
      const response = await sessionService.getSession(sessionId);

      if (response.success) {
        setSession(response.session);
      } else {
        setError(response.message || "Failed to load session details");
      }
    } catch (error) {
      setError("Failed to load session details");
    } finally {
      setLoading(false);
    }
  };

  const handleMarkCompleted = async () => {
    try {
      setActionLoading(true);
      const response = await sessionService.markSessionCompleted(sessionId);

      if (response.success) {
        setSession((prev) => ({ ...prev, status: "completed" }));
        alert("Session marked as completed successfully!");
      } else {
        alert(response.message || "Failed to mark session as completed");
      }
    } catch (error) {
      alert("Failed to mark session as completed");
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelSession = async () => {
    const reason = prompt(
      "Please provide a reason for cancellation (optional):"
    );
    if (reason === null) return; // User cancelled the prompt

    try {
      setActionLoading(true);
      const response = await sessionService.cancelSession(sessionId, reason);

      if (response.success) {
        setSession((prev) => ({ ...prev, status: "cancelled" }));
        alert("Session cancelled successfully!");
      } else {
        alert(response.message || "Failed to cancel session");
      }
    } catch (error) {
      alert("Failed to cancel session");
    } finally {
      setActionLoading(false);
    }
  };

  const formatDateTime = (dateTime) => {
    const date = new Date(dateTime);
    return {
      date: date.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
      time: date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "scheduled":
        return "bg-primary";
      case "completed":
        return "bg-success";
      case "cancelled":
        return "bg-danger";
      case "rescheduled":
        return "bg-warning";
      default:
        return "bg-secondary";
    }
  };

  if (loading) {
    return (
      <div
        className="tutor-session-details-page d-flex justify-content-center align-items-center"
        style={{ minHeight: "60vh" }}
      >
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3 text-muted">Loading session details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="tutor-session-details-page">
        <div className="container py-4">
          <div className="alert alert-danger text-center">
            <i className="fa fa-exclamation-triangle fa-2x mb-3"></i>
            <h4>Error Loading Session</h4>
            <p>{error}</p>
            <button
              className="btn btn-primary"
              onClick={() => navigate("/tutor/sessions")}
            >
              <i className="fa fa-arrow-left me-2"></i>
              Back to Teaching Schedule
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="tutor-session-details-page">
        <div className="container py-4">
          <div className="alert alert-warning text-center">
            <i className="fa fa-question-circle fa-2x mb-3"></i>
            <h4>Session Not Found</h4>
            <p>The requested session could not be found.</p>
            <button
              className="btn btn-primary"
              onClick={() => navigate("/tutor/sessions")}
            >
              <i className="fa fa-arrow-left me-2"></i>
              Back to Teaching Schedule
            </button>
          </div>
        </div>
      </div>
    );
  }

  const startDateTime = formatDateTime(session.startTime);
  const endDateTime = formatDateTime(session.endTime);

  return (
    <div className="tutor-session-details-page">
      <div className="container py-4">
        {/* Header */}
        <div className="row mb-4">
          <div className="col-12">
            <button
              className="btn btn-outline-secondary mb-3"
              onClick={() => navigate("/tutor/sessions")}
            >
              <i className="fa fa-arrow-left me-2"></i>
              Back to Teaching Schedule
            </button>

            <div className="d-flex justify-content-between align-items-start">
              <div>
                <h2 className="mb-2">{session.title}</h2>
                <span
                  className={`badge ${getStatusBadgeClass(
                    session.status
                  )} status-badge`}
                >
                  {session.status}
                </span>
              </div>

              {/* Action Buttons */}
              {session.status === "scheduled" && (
                <div className="d-flex gap-2">
                  {session.mode === "online" && (
                    <button
                      className="btn btn-primary"
                      onClick={() => navigate(`/tutor/classroom/${sessionId}`)}
                      disabled={actionLoading}
                    >
                      <i className="fa fa-video me-2"></i>
                      Start/Join Class
                    </button>
                  )}
                  <button
                    className="btn btn-success"
                    onClick={handleMarkCompleted}
                    disabled={actionLoading}
                  >
                    {actionLoading ? (
                      <>
                        <span
                          className="spinner-border spinner-border-sm me-2"
                          role="status"
                        ></span>
                        Processing...
                      </>
                    ) : (
                      <>
                        <i className="fa fa-check me-2"></i>
                        Mark Completed
                      </>
                    )}
                  </button>

                  <div className="dropdown">
                    <button
                      className="btn btn-outline-secondary dropdown-toggle"
                      type="button"
                      data-bs-toggle="dropdown"
                      disabled={actionLoading}
                    >
                      <i className="fa fa-cog me-2"></i>
                      More Actions
                    </button>
                    <ul className="dropdown-menu">
                      <li>
                        <button
                          className="dropdown-item"
                          onClick={handleCancelSession}
                        >
                          <i className="fa fa-times me-2 text-danger"></i>
                          Cancel Session
                        </button>
                      </li>
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="row">
          {/* Main Session Details */}
          <div className="col-lg-8">
            <div className="card session-detail-card mb-4">
              <div className="card-body">
                <h5 className="card-title mb-4">
                  <i className="fa fa-info-circle me-2 text-primary"></i>
                  Session Details
                </h5>

                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-bold">Subject:</label>
                    <p className="session-subject">{session.subject}</p>
                  </div>

                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-bold">Mode:</label>
                    <p>
                      <span
                        className={`badge ${
                          session.mode === "online" ? "bg-info" : "bg-secondary"
                        }`}
                      >
                        <i
                          className={`fa ${
                            session.mode === "online"
                              ? "fa-video"
                              : "fa-map-marker-alt"
                          } me-1`}
                        ></i>
                        {session.mode === "online" ? "Online" : "In-Person"}
                      </span>
                    </p>
                  </div>

                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-bold">Date:</label>
                    <p>{startDateTime.date}</p>
                  </div>

                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-bold">Time:</label>
                    <p>
                      {startDateTime.time} - {endDateTime.time}
                    </p>
                  </div>

                  {session.location && (
                    <div className="col-md-12 mb-3">
                      <label className="form-label fw-bold">Location:</label>
                      <p>
                        <i className="fa fa-map-marker-alt me-2 text-muted"></i>
                        {session.location}
                      </p>
                    </div>
                  )}

                  <div className="col-12 mb-3">
                    <label className="form-label fw-bold">Description:</label>
                    <p className="session-description">
                      {session.description || "No description provided"}
                    </p>
                  </div>

                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-bold">Price:</label>
                    <p className="text-success fw-bold fs-5">
                      ₹{session.price}
                    </p>
                  </div>

                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-bold">
                      Payment Status:
                    </label>
                    <p>
                      <span
                        className={`badge ${
                          session.paymentStatus === "paid"
                            ? "bg-success"
                            : "bg-warning"
                        }`}
                      >
                        {session.paymentStatus || "pending"}
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Session Review (if completed) */}
            {session.status === "completed" && session.rating && (
              <div className="card session-detail-card">
                <div className="card-body">
                  <h5 className="card-title mb-4">
                    <i className="fa fa-star me-2 text-warning"></i>
                    Student Review
                  </h5>

                  <div className="mb-3">
                    <label className="form-label fw-bold">Rating:</label>
                    <div>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <i
                          key={star}
                          className={`fa fa-star ${
                            star <= session.rating
                              ? "text-warning"
                              : "text-muted"
                          }`}
                        ></i>
                      ))}
                      <span className="ms-2">({session.rating}/5)</span>
                    </div>
                  </div>

                  {session.review && (
                    <div>
                      <label className="form-label fw-bold">Review:</label>
                      <p className="fst-italic">"{session.review}"</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Student Information Sidebar */}
          <div className="col-lg-4">
            <div className="card session-detail-card">
              <div className="card-body">
                <h5 className="card-title mb-4">
                  <i className="fa fa-user me-2 text-primary"></i>
                  Student Information
                </h5>

                <div className="text-center mb-4">
                  <img
                    src={
                      formatImageUrl(session.student?.profileImage) ||
                      "/images/default-avatar.png"
                    }
                    alt={session.student?.name}
                    className="student-avatar-large mb-3"
                    onError={(e) => {
                      e.target.src = "/images/default-avatar.png";
                    }}
                  />
                  <h6 className="mb-2">{session.student?.name}</h6>
                  <p className="text-muted mb-0">{session.student?.email}</p>
                </div>

                <div className="student-info-details">
                  {session.student?.grade && (
                    <div className="mb-3">
                      <label className="form-label fw-bold">Grade:</label>
                      <p className="mb-0">{session.student.grade}</p>
                    </div>
                  )}

                  {session.student?.curriculum && (
                    <div className="mb-3">
                      <label className="form-label fw-bold">Curriculum:</label>
                      <p className="mb-0">{session.student.curriculum}</p>
                    </div>
                  )}
                </div>

                <div className="session-timestamps mt-4 pt-3 border-top">
                  <small className="text-muted d-block">
                    Session created:{" "}
                    {new Date(session.createdAt).toLocaleDateString()}
                  </small>
                  {session.updatedAt !== session.createdAt && (
                    <small className="text-muted d-block">
                      Last updated:{" "}
                      {new Date(session.updatedAt).toLocaleDateString()}
                    </small>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TutorSessionDetails;
