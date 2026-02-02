/**
 * ClassroomPage
 * Main page for online class sessions with video conferencing
 */

import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  Container,
  Button,
  Alert,
  Spinner,
  Card,
  Badge,
  Modal,
} from "react-bootstrap";
import {
  FaVideo,
  FaArrowLeft,
  FaClock,
  FaUser,
  FaPlay,
  FaUserGraduate,
  FaChalkboardTeacher,
} from "react-icons/fa";
import { VideoClassroom } from "../../components";
import classroomService from "../../../shared/services/classroom.service";
import { useAuth } from "../../../shared/context/AuthContext";
import "./ClassroomPage.css";

const ClassroomPage = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [classStatus, setClassStatus] = useState(null);
  const [meetingData, setMeetingData] = useState(null);
  const [inClass, setInClass] = useState(false);
  const [showEndModal, setShowEndModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Fetch class status on mount
  useEffect(() => {
    fetchClassStatus();
    // Poll for status updates every 10 seconds when not in class
    const interval = setInterval(() => {
      if (!inClass) {
        fetchClassStatus();
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [sessionId, inClass]);

  const fetchClassStatus = async () => {
    try {
      setLoading(true);
      const response = await classroomService.getClassStatus(sessionId);
      if (response.success) {
        setClassStatus(response.data);
        setError(null);
      }
    } catch (err) {
      setError(err.message || "Failed to load class details");
    } finally {
      setLoading(false);
    }
  };

  const handleStartClass = async () => {
    try {
      setActionLoading(true);
      const response = await classroomService.startClass(sessionId);
      if (response.success) {
        setMeetingData(response.data);
        setInClass(true);
        setError(null);
      }
    } catch (err) {
      setError(err.message || "Failed to start class");
    } finally {
      setActionLoading(false);
    }
  };

  const handleJoinClass = async () => {
    try {
      setActionLoading(true);
      const response = await classroomService.joinClass(sessionId);
      if (response.success) {
        setMeetingData(response.data);
        setInClass(true);
        setError(null);
      }
    } catch (err) {
      setError(err.message || "Failed to join class");
    } finally {
      setActionLoading(false);
    }
  };

  const handleEndClass = async () => {
    try {
      setActionLoading(true);
      await classroomService.endClass(sessionId);
      setShowEndModal(false);
      setInClass(false);
      setMeetingData(null);
      // Navigate back to session details
      const basePath = user?.role === "tutor" ? "/tutor" : "/student";
      navigate(`${basePath}/sessions/${sessionId}`);
    } catch (err) {
      setError(err.message || "Failed to end class");
    } finally {
      setActionLoading(false);
    }
  };

  const handleLeaveClass = () => {
    setInClass(false);
    setMeetingData(null);
    // Navigate back to session details
    const basePath = user?.role === "tutor" ? "/tutor" : "/student";
    navigate(`${basePath}/sessions/${sessionId}`);
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      }),
      time: date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
  };

  const getTimeUntilClass = () => {
    if (!classStatus?.startTime) return null;
    const now = new Date();
    const start = new Date(classStatus.startTime);
    const diff = start - now;

    if (diff <= 0) return null;

    const hours = Math.floor(diff / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes} minutes`;
  };

  // Render video classroom when in class
  if (inClass && meetingData) {
    return (
      <>
        <VideoClassroom
          roomId={meetingData.roomId}
          roomUrl={meetingData.roomUrl}
          userName={`${user?.firstName} ${user?.lastName}`}
          userEmail={user?.email}
          sessionTitle={meetingData.title}
          subject={meetingData.subject}
          startTime={meetingData.startTime}
          endTime={meetingData.endTime}
          otherParticipant={meetingData.otherParticipant || meetingData.student}
          userRole={classStatus?.isTutor ? "tutor" : "student"}
          onLeave={handleLeaveClass}
          onEnd={() => setShowEndModal(true)}
          // JaaS specific props
          domain={meetingData.domain}
          jaasAppId={meetingData.jaasAppId}
          jwt={meetingData.jwt}
          useJaas={meetingData.useJaas}
        />

        {/* End Class Confirmation Modal */}
        <Modal
          show={showEndModal}
          onHide={() => setShowEndModal(false)}
          centered
        >
          <Modal.Header closeButton>
            <Modal.Title>End Class</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p>Are you sure you want to end this class?</p>
            <p className="text-muted small">
              This will disconnect all participants from the meeting room.
            </p>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowEndModal(false)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleEndClass}
              disabled={actionLoading}
            >
              {actionLoading ? (
                <>
                  <Spinner size="sm" className="me-2" />
                  Ending...
                </>
              ) : (
                "End Class"
              )}
            </Button>
          </Modal.Footer>
        </Modal>
      </>
    );
  }

  // Loading state
  if (loading) {
    return (
      <Container className="classroom-page py-5">
        <div className="text-center">
          <Spinner animation="border" variant="primary" />
          <p className="mt-3">Loading classroom...</p>
        </div>
      </Container>
    );
  }

  // Error state
  if (error && !classStatus) {
    return (
      <Container className="classroom-page py-5">
        <Alert variant="danger">
          <Alert.Heading>Error</Alert.Heading>
          <p>{error}</p>
          <hr />
          <Button variant="outline-danger" onClick={() => navigate(-1)}>
            <FaArrowLeft className="me-2" />
            Go Back
          </Button>
        </Alert>
      </Container>
    );
  }

  const startDateTime = classStatus?.startTime
    ? formatDateTime(classStatus.startTime)
    : {};
  const endDateTime = classStatus?.endTime
    ? formatDateTime(classStatus.endTime)
    : {};
  const timeUntil = getTimeUntilClass();

  return (
    <Container className="classroom-page py-4">
      {/* Back Button */}
      <Button
        variant="link"
        className="back-button mb-3 p-0"
        onClick={() => navigate(-1)}
      >
        <FaArrowLeft className="me-2" />
        Back to Session
      </Button>

      {error && (
        <Alert variant="warning" dismissible onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Card className="classroom-status-card">
        <Card.Body>
          <div className="classroom-info">
            <div className="classroom-header-section">
              <div className="classroom-icon">
                <FaVideo />
              </div>
              <div className="classroom-details">
                <h2>{classStatus?.title}</h2>
                <div className="classroom-meta">
                  <Badge bg="primary" className="me-2">
                    {classStatus?.subject}
                  </Badge>
                  <Badge
                    bg={
                      classStatus?.classStatus === "in-progress"
                        ? "success"
                        : classStatus?.classStatus === "ready"
                          ? "warning"
                          : "secondary"
                    }
                  >
                    {classStatus?.classStatus?.replace("-", " ").toUpperCase()}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="classroom-schedule">
              <div className="schedule-item">
                <FaClock className="schedule-icon" />
                <div className="schedule-text">
                  <span className="schedule-label">Scheduled Time</span>
                  <span className="schedule-value">
                    {startDateTime.date} • {startDateTime.time} -{" "}
                    {endDateTime.time}
                  </span>
                </div>
              </div>

              {timeUntil && (
                <div className="time-until">
                  <span className="time-until-label">Class starts in</span>
                  <span className="time-until-value">{timeUntil}</span>
                </div>
              )}
            </div>

            <div className="participant-section">
              <div className="participant-card">
                {classStatus?.isTutor ? (
                  <>
                    <FaUserGraduate className="participant-type-icon student" />
                    <span className="participant-label">Student</span>
                    <span className="participant-name">Waiting to join...</span>
                  </>
                ) : (
                  <>
                    <FaChalkboardTeacher className="participant-type-icon tutor" />
                    <span className="participant-label">Tutor</span>
                    <span className="participant-name">
                      {classStatus?.classStatus === "in-progress"
                        ? "Class in progress"
                        : "Waiting to start..."}
                    </span>
                  </>
                )}
              </div>
            </div>

            <div className="classroom-actions">
              {classStatus?.isTutor && classStatus?.canStart && (
                <Button
                  variant="success"
                  size="lg"
                  onClick={handleStartClass}
                  disabled={actionLoading}
                  className="start-class-btn"
                >
                  {actionLoading ? (
                    <>
                      <Spinner size="sm" className="me-2" />
                      Starting...
                    </>
                  ) : (
                    <>
                      <FaPlay className="me-2" />
                      Start Class
                    </>
                  )}
                </Button>
              )}

              {classStatus?.canJoin && (
                <Button
                  variant="primary"
                  size="lg"
                  onClick={handleJoinClass}
                  disabled={actionLoading}
                  className="join-class-btn"
                >
                  {actionLoading ? (
                    <>
                      <Spinner size="sm" className="me-2" />
                      Joining...
                    </>
                  ) : (
                    <>
                      <FaVideo className="me-2" />
                      Join Class
                    </>
                  )}
                </Button>
              )}

              {!classStatus?.canStart && !classStatus?.canJoin && (
                <div className="waiting-message">
                  {classStatus?.classStatus === "scheduled" ? (
                    <p>
                      <FaClock className="me-2" />
                      Class will be available 15 minutes before the scheduled
                      time
                    </p>
                  ) : classStatus?.classStatus === "ended" ? (
                    <p>This class session has ended</p>
                  ) : (
                    <p>
                      <Spinner size="sm" className="me-2" />
                      Waiting for tutor to start the class...
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </Card.Body>
      </Card>

      {/* Instructions Card */}
      <Card className="instructions-card mt-4">
        <Card.Header>
          <h5 className="mb-0">Before You Join</h5>
        </Card.Header>
        <Card.Body>
          <ul className="instructions-list">
            <li>Ensure you have a stable internet connection</li>
            <li>Test your camera and microphone before joining</li>
            <li>Find a quiet, well-lit environment</li>
            <li>Close unnecessary applications to improve performance</li>
            <li>You can join the class 15 minutes before the scheduled time</li>
          </ul>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default ClassroomPage;
