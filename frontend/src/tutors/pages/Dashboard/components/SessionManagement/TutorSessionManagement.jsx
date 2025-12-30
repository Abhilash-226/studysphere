import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Tabs,
  Tab,
  Badge,
  Button,
  Alert,
  Spinner,
} from "react-bootstrap";
import {
  FaCalendarAlt,
  FaClock,
  FaUser,
  FaVideo,
  FaRupeeSign,
  FaStar,
  FaCheckCircle,
} from "react-icons/fa";
import PropTypes from "prop-types";
import sessionService from "../../../../../shared/services/sessionService";
import { useAuth } from "../../../../../shared/context/AuthContext";
import TutorSessionCard from "./TutorSessionCard";
import "./TutorSessionManagement.css";

/**
 * TutorSessionManagement - Session dashboard for tutors
 * @param {Object} props - Component props
 * @returns {React.ReactElement} - Rendered component
 */
const TutorSessionManagement = () => {
  const { user } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("upcoming");
  const [stats, setStats] = useState({
    total: 0,
    upcoming: 0,
    completed: 0,
    cancelled: 0,
    totalEarnings: 0,
    averageRating: 0,
  });

  useEffect(() => {
    fetchSessions();
    fetchStats();
  }, []);

  // Fetch sessions
  const fetchSessions = async (status = null) => {
    try {
      setLoading(true);
      const params = status ? { status } : {};
      const response = await sessionService.getSessions(params);
      setSessions(response.sessions || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch statistics
  const fetchStats = async () => {
    try {
      const response = await sessionService.getSessionStatistics();
      setStats({
        total: response.statistics.total,
        upcoming: response.statistics.scheduled,
        completed: response.statistics.completed,
        cancelled: response.statistics.cancelled,
        totalEarnings: response.statistics.totalAmount || 0,
        averageRating: response.statistics.averageRating || 0,
      });
    } catch (err) {
      console.error("Error fetching stats:", err);
    }
  };

  // Handle tab change
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    const statusMap = {
      upcoming: "scheduled",
      completed: "completed",
      cancelled: "cancelled",
    };
    fetchSessions(statusMap[tab]);
  };

  // Handle session action
  const handleSessionAction = async (sessionId, action, data = {}) => {
    try {
      let response;

      switch (action) {
        case "cancel":
          response = await sessionService.cancelSession(sessionId, data.reason);
          break;
        case "complete":
          response = await sessionService.completeSession(
            sessionId,
            data.notes
          );
          break;
        case "reschedule":
          response = await sessionService.rescheduleSession(
            sessionId,
            data.newStartTime,
            data.newEndTime,
            data.reason
          );
          break;
        default:
          throw new Error("Unknown action");
      }

      // Refresh sessions and stats
      fetchSessions();
      fetchStats();
      setError("");
    } catch (err) {
      setError(err.message);
    }
  };

  // Filter sessions based on active tab
  const filteredSessions = sessions.filter((session) => {
    switch (activeTab) {
      case "upcoming":
        return session.status === "scheduled";
      case "completed":
        return session.status === "completed";
      case "cancelled":
        return session.status === "cancelled";
      default:
        return true;
    }
  });

  // Get today's sessions
  const todaysSessions = sessions.filter((session) => {
    const today = new Date();
    const sessionDate = new Date(session.startTime);
    return (
      sessionDate.toDateString() === today.toDateString() &&
      session.status === "scheduled"
    );
  });

  return (
    <div className="tutor-session-management">
      {/* Header */}
      <div className="session-header mb-4">
        <h4 className="mb-0">My Teaching Sessions</h4>
        <p className="text-muted mb-0">
          Manage your tutoring sessions and track your progress
        </p>
      </div>

      {/* Today's Sessions Alert */}
      {todaysSessions.length > 0 && (
        <Alert variant="info" className="mb-4">
          <FaCalendarAlt className="me-2" />
          You have {todaysSessions.length} session
          {todaysSessions.length > 1 ? "s" : ""} scheduled for today!
        </Alert>
      )}

      {/* Statistics Cards */}
      <Row className="mb-4">
        <Col md={3} sm={6} className="mb-3">
          <Card className="stats-card border-primary">
            <Card.Body className="text-center">
              <div className="stats-icon total">
                <FaCalendarAlt />
              </div>
              <h3>{stats.total}</h3>
              <p className="text-muted mb-0">Total Sessions</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} sm={6} className="mb-3">
          <Card className="stats-card border-info">
            <Card.Body className="text-center">
              <div className="stats-icon upcoming">
                <FaClock />
              </div>
              <h3>{stats.upcoming}</h3>
              <p className="text-muted mb-0">Upcoming</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} sm={6} className="mb-3">
          <Card className="stats-card border-success">
            <Card.Body className="text-center">
              <div className="stats-icon earnings">
                <FaRupeeSign />
              </div>
              <h3>₹{stats.totalEarnings}</h3>
              <p className="text-muted mb-0">Total Earnings</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} sm={6} className="mb-3">
          <Card className="stats-card border-warning">
            <Card.Body className="text-center">
              <div className="stats-icon rating">
                <FaStar />
              </div>
              <h3>
                {stats.averageRating > 0 ? stats.averageRating.toFixed(1) : "-"}
              </h3>
              <p className="text-muted mb-0">Average Rating</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Error Alert */}
      {error && (
        <Alert
          variant="danger"
          dismissible
          onClose={() => setError("")}
          className="mb-4"
        >
          {error}
        </Alert>
      )}

      {/* Sessions List */}
      <Card>
        <Card.Header>
          <Tabs
            activeKey={activeTab}
            onSelect={handleTabChange}
            className="border-bottom-0"
          >
            <Tab
              eventKey="upcoming"
              title={
                <span>
                  Upcoming Sessions
                  {stats.upcoming > 0 && (
                    <Badge bg="primary" className="ms-2">
                      {stats.upcoming}
                    </Badge>
                  )}
                </span>
              }
            />
            <Tab
              eventKey="completed"
              title={
                <span>
                  Completed Sessions
                  {stats.completed > 0 && (
                    <Badge bg="success" className="ms-2">
                      {stats.completed}
                    </Badge>
                  )}
                </span>
              }
            />
            <Tab
              eventKey="cancelled"
              title={
                <span>
                  Cancelled Sessions
                  {stats.cancelled > 0 && (
                    <Badge bg="danger" className="ms-2">
                      {stats.cancelled}
                    </Badge>
                  )}
                </span>
              }
            />
          </Tabs>
        </Card.Header>
        <Card.Body>
          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" role="status">
                <span className="visually-hidden">Loading...</span>
              </Spinner>
              <p className="mt-2 text-muted">Loading your sessions...</p>
            </div>
          ) : filteredSessions.length > 0 ? (
            <Row>
              {filteredSessions.map((session) => (
                <Col md={6} lg={4} key={session._id} className="mb-3">
                  <TutorSessionCard
                    session={session}
                    onAction={handleSessionAction}
                  />
                </Col>
              ))}
            </Row>
          ) : (
            <div className="empty-state text-center py-5">
              <FaCalendarAlt size={48} className="text-muted mb-3" />
              <h5>No {activeTab} sessions</h5>
              <p className="text-muted mb-3">
                {activeTab === "upcoming"
                  ? "You don't have any upcoming teaching sessions. Students will book sessions with you."
                  : `You don't have any ${activeTab} sessions yet.`}
              </p>
              {activeTab === "completed" && stats.completed === 0 && (
                <div className="mt-3">
                  <FaCheckCircle size={24} className="text-success mb-2" />
                  <p className="text-muted">
                    Complete your first session to start building your
                    reputation!
                  </p>
                </div>
              )}
            </div>
          )}
        </Card.Body>
      </Card>
    </div>
  );
};

export default TutorSessionManagement;
