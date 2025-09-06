import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Tab,
  Tabs,
  Badge,
  Button,
  Alert,
} from "react-bootstrap";
import {
  FaCalendarAlt,
  FaClock,
  FaUser,
  FaVideo,
  FaMapMarkerAlt,
  FaStar,
} from "react-icons/fa";
import PropTypes from "prop-types";
import sessionService from "../../../services/sessionService";
import { useAuth } from "../../../context/AuthContext";
import SessionCard from "./SessionCard";
import "./SessionDashboard.css";

/**
 * SessionDashboard - Dashboard component for managing user sessions
 * @param {Object} props - Component props
 * @param {string} props.userRole - User role (student/tutor)
 * @returns {React.ReactElement} - Rendered component
 */
const SessionDashboard = ({ userRole = "student" }) => {
  const { currentUser } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("upcoming");
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalSessions: 0,
  });

  // Fetch sessions based on status and user role
  const fetchSessions = async (status = "all", page = 1) => {
    try {
      setLoading(true);
      setError("");

      const response = await sessionService.getAllSessions(status, page);

      if (response.success) {
        setSessions(response.sessions || []);
        setPagination(
          response.pagination || {
            currentPage: 1,
            totalPages: 1,
            totalSessions: 0,
          }
        );
      } else {
        throw new Error(response.message || "Failed to fetch sessions");
      }
    } catch (error) {
      console.error("Error fetching sessions:", error);
      setError(error.message || "Failed to load sessions");
      setSessions([]);
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchSessions(activeTab);
  }, [activeTab]);

  // Handle tab change
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    fetchSessions(tab);
  };

  // Handle session action (cancel, complete, etc.)
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
        case "review":
          response = await sessionService.addSessionReview(
            sessionId,
            data.rating,
            data.review
          );
          break;
        default:
          throw new Error("Invalid action");
      }

      if (response.success) {
        // Refresh sessions list
        fetchSessions(activeTab);
      } else {
        throw new Error(response.message || `Failed to ${action} session`);
      }
    } catch (error) {
      console.error(`Error ${action} session:`, error);
      setError(error.message || `Failed to ${action} session`);
    }
  };

  // Filter sessions based on active tab
  const getFilteredSessions = () => {
    const now = new Date();

    switch (activeTab) {
      case "upcoming":
        return sessions.filter(
          (session) =>
            new Date(session.startTime) > now && session.status === "scheduled"
        );
      case "completed":
        return sessions.filter((session) => session.status === "completed");
      case "cancelled":
        return sessions.filter((session) => session.status === "cancelled");
      default:
        return sessions;
    }
  };

  // Get session statistics
  const getSessionStats = () => {
    const stats = {
      total: sessions.length,
      upcoming: sessions.filter(
        (s) => s.status === "scheduled" && new Date(s.startTime) > new Date()
      ).length,
      completed: sessions.filter((s) => s.status === "completed").length,
      cancelled: sessions.filter((s) => s.status === "cancelled").length,
    };
    return stats;
  };

  const filteredSessions = getFilteredSessions();
  const stats = getSessionStats();

  return (
    <Container fluid className="session-dashboard">
      <Row className="mb-4">
        <Col>
          <div className="dashboard-header">
            <h2>
              <FaCalendarAlt className="me-2" />
              {userRole === "tutor"
                ? "My Teaching Sessions"
                : "My Learning Sessions"}
            </h2>
            <p className="text-muted">
              Manage your {userRole === "tutor" ? "teaching" : "learning"}{" "}
              sessions and track your progress
            </p>
          </div>
        </Col>
      </Row>

      {/* Session Statistics */}
      <Row className="mb-4">
        <Col md={3}>
          <Card className="stats-card">
            <Card.Body className="text-center">
              <div className="stats-icon">
                <FaCalendarAlt />
              </div>
              <h3>{stats.total}</h3>
              <p className="text-muted">Total Sessions</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="stats-card">
            <Card.Body className="text-center">
              <div className="stats-icon upcoming">
                <FaClock />
              </div>
              <h3>{stats.upcoming}</h3>
              <p className="text-muted">Upcoming</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="stats-card">
            <Card.Body className="text-center">
              <div className="stats-icon completed">
                <FaStar />
              </div>
              <h3>{stats.completed}</h3>
              <p className="text-muted">Completed</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="stats-card">
            <Card.Body className="text-center">
              <div className="stats-icon cancelled">
                <FaUser />
              </div>
              <h3>{stats.cancelled}</h3>
              <p className="text-muted">Cancelled</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Error Alert */}
      {error && (
        <Row className="mb-3">
          <Col>
            <Alert variant="danger" dismissible onClose={() => setError("")}>
              {error}
            </Alert>
          </Col>
        </Row>
      )}

      {/* Session Tabs */}
      <Row>
        <Col>
          <Card>
            <Card.Body>
              <Tabs
                activeKey={activeTab}
                onSelect={handleTabChange}
                className="session-tabs"
              >
                <Tab
                  eventKey="upcoming"
                  title={
                    <span>
                      <FaClock className="me-1" />
                      Upcoming{" "}
                      {stats.upcoming > 0 && (
                        <Badge bg="primary" className="ms-1">
                          {stats.upcoming}
                        </Badge>
                      )}
                    </span>
                  }
                >
                  <div className="tab-content-area">
                    {loading ? (
                      <div className="text-center py-4">
                        <div className="spinner-border" role="status">
                          <span className="visually-hidden">Loading...</span>
                        </div>
                      </div>
                    ) : filteredSessions.length > 0 ? (
                      <Row>
                        {filteredSessions.map((session) => (
                          <Col md={6} lg={4} key={session.id} className="mb-3">
                            <SessionCard
                              session={session}
                              userRole={userRole}
                              onAction={handleSessionAction}
                            />
                          </Col>
                        ))}
                      </Row>
                    ) : (
                      <div className="empty-state">
                        <FaCalendarAlt size={48} className="text-muted mb-3" />
                        <h5>No upcoming sessions</h5>
                        <p className="text-muted">
                          {userRole === "student"
                            ? "Book your first session to get started!"
                            : "No upcoming teaching sessions scheduled."}
                        </p>
                      </div>
                    )}
                  </div>
                </Tab>

                <Tab
                  eventKey="completed"
                  title={
                    <span>
                      <FaStar className="me-1" />
                      Completed{" "}
                      {stats.completed > 0 && (
                        <Badge bg="success" className="ms-1">
                          {stats.completed}
                        </Badge>
                      )}
                    </span>
                  }
                >
                  <div className="tab-content-area">
                    {loading ? (
                      <div className="text-center py-4">
                        <div className="spinner-border" role="status">
                          <span className="visually-hidden">Loading...</span>
                        </div>
                      </div>
                    ) : filteredSessions.length > 0 ? (
                      <Row>
                        {filteredSessions.map((session) => (
                          <Col md={6} lg={4} key={session.id} className="mb-3">
                            <SessionCard
                              session={session}
                              userRole={userRole}
                              onAction={handleSessionAction}
                            />
                          </Col>
                        ))}
                      </Row>
                    ) : (
                      <div className="empty-state">
                        <FaStar size={48} className="text-muted mb-3" />
                        <h5>No completed sessions</h5>
                        <p className="text-muted">
                          Completed sessions will appear here.
                        </p>
                      </div>
                    )}
                  </div>
                </Tab>

                <Tab
                  eventKey="cancelled"
                  title={
                    <span>
                      <FaUser className="me-1" />
                      Cancelled{" "}
                      {stats.cancelled > 0 && (
                        <Badge bg="secondary" className="ms-1">
                          {stats.cancelled}
                        </Badge>
                      )}
                    </span>
                  }
                >
                  <div className="tab-content-area">
                    {loading ? (
                      <div className="text-center py-4">
                        <div className="spinner-border" role="status">
                          <span className="visually-hidden">Loading...</span>
                        </div>
                      </div>
                    ) : filteredSessions.length > 0 ? (
                      <Row>
                        {filteredSessions.map((session) => (
                          <Col md={6} lg={4} key={session.id} className="mb-3">
                            <SessionCard
                              session={session}
                              userRole={userRole}
                              onAction={handleSessionAction}
                            />
                          </Col>
                        ))}
                      </Row>
                    ) : (
                      <div className="empty-state">
                        <FaUser size={48} className="text-muted mb-3" />
                        <h5>No cancelled sessions</h5>
                        <p className="text-muted">
                          Cancelled sessions will appear here.
                        </p>
                      </div>
                    )}
                  </div>
                </Tab>
              </Tabs>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <Row className="mt-4">
          <Col className="d-flex justify-content-center">
            <Button
              variant="outline-primary"
              disabled={pagination.currentPage === 1}
              onClick={() =>
                fetchSessions(activeTab, pagination.currentPage - 1)
              }
            >
              Previous
            </Button>
            <span className="mx-3 d-flex align-items-center">
              Page {pagination.currentPage} of {pagination.totalPages}
            </span>
            <Button
              variant="outline-primary"
              disabled={pagination.currentPage === pagination.totalPages}
              onClick={() =>
                fetchSessions(activeTab, pagination.currentPage + 1)
              }
            >
              Next
            </Button>
          </Col>
        </Row>
      )}
    </Container>
  );
};

SessionDashboard.propTypes = {
  userRole: PropTypes.oneOf(["student", "tutor"]).isRequired,
};

export default SessionDashboard;
