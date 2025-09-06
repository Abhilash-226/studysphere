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
  FaMapMarkerAlt,
  FaStar,
  FaPlus,
} from "react-icons/fa";
import PropTypes from "prop-types";
import sessionService from "../../../../../shared/services/sessionService";
import { useAuth } from "../../../../../shared/context/AuthContext";
import SessionCard from "./StudentSessionCard";
import SessionBookingModal from "../../../../../shared/components/Modals/SessionBooking/SessionBookingModal";
import "./StudentSessionManagement.css";

/**
 * StudentSessionManagement - Session dashboard for students
 * @param {Object} props - Component props
 * @param {Function} props.onBookSession - Callback when booking a new session
 * @returns {React.ReactElement} - Rendered component
 */
const StudentSessionManagement = ({ onBookSession }) => {
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
    totalSpent: 0,
  });
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedTutor, setSelectedTutor] = useState(null);

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
        totalSpent: response.statistics.totalAmount || 0,
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
        case "review":
          response = await sessionService.addSessionReview(
            sessionId,
            data.rating,
            data.review
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

  // Handle book new session
  const handleBookNewSession = (tutor = null) => {
    if (tutor) {
      setSelectedTutor(tutor);
    }
    setShowBookingModal(true);
    if (onBookSession) {
      onBookSession(tutor);
    }
  };

  // Handle booking success
  const handleBookingSuccess = () => {
    setShowBookingModal(false);
    fetchSessions();
    fetchStats();
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

  return (
    <div className="student-session-management">
      {/* Header */}
      <div className="session-header mb-4">
        <div className="d-flex justify-content-between align-items-center">
          <h4 className="mb-0">My Learning Sessions</h4>
          <Button
            variant="primary"
            onClick={() => handleBookNewSession()}
            className="d-flex align-items-center"
          >
            <FaPlus className="me-2" />
            Book New Session
          </Button>
        </div>
      </div>

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
              <div className="stats-icon completed">
                <FaUser />
              </div>
              <h3>{stats.completed}</h3>
              <p className="text-muted mb-0">Completed</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} sm={6} className="mb-3">
          <Card className="stats-card border-warning">
            <Card.Body className="text-center">
              <div className="stats-icon spent">
                <FaStar />
              </div>
              <h3>${stats.totalSpent}</h3>
              <p className="text-muted mb-0">Total Spent</p>
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
                  <SessionCard
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
                  ? "You don't have any upcoming sessions. Book a session to get started!"
                  : `You don't have any ${activeTab} sessions yet.`}
              </p>
              {activeTab === "upcoming" && (
                <Button
                  variant="primary"
                  onClick={() => handleBookNewSession()}
                >
                  <FaPlus className="me-2" />
                  Book Your First Session
                </Button>
              )}
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Session Booking Modal */}
      <SessionBookingModal
        show={showBookingModal}
        onHide={() => setShowBookingModal(false)}
        tutor={selectedTutor}
        onSuccess={handleBookingSuccess}
        onError={setError}
      />
    </div>
  );
};

StudentSessionManagement.propTypes = {
  onBookSession: PropTypes.func,
};

export default StudentSessionManagement;
