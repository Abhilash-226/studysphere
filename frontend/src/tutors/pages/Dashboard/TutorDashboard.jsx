import React, { useEffect, useState } from "react";
import { Container, Row, Col } from "react-bootstrap";
import { useAuth } from "../../../shared/context/AuthContext";
import tutorService from "../../../shared/services/tutor.service";
import tutorChatService from "../../../shared/services/tutor-chat.service";

// Import components
import {
  WelcomeHeaderSection,
  StatsCardsSection,
  UpcomingSessionsSection,
  MessageCenterSection,
  VerificationStatusSection,
  SessionRequestsSection,
} from "./components";

// Import styles
import "./styles/dashboard-styles.css";

/**
 * TutorDashboard - Main component for the tutor dashboard page
 * @returns {React.ReactElement} - Rendered component
 */
const TutorDashboard = () => {
  const { currentUser } = useAuth();
  const [upcomingSessions, setUpcomingSessions] = useState([]);
  const [sessionRequests, setSessionRequests] = useState([]);
  const [verificationStatus, setVerificationStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [messageStats, setMessageStats] = useState({
    unreadCount: 0,
    totalConversations: 0,
    responseRate: 0,
    averageResponseTime: 0,
  });

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch data in parallel for better performance
      const [sessions, requests, status, msgStats] = await Promise.all([
        tutorService.getScheduledSessions("upcoming"),
        tutorService.getScheduledSessions("pending"),
        tutorService.getVerificationStatus(),
        tutorChatService.getTutorMessageStats().catch((err) => ({
          success: false,
          stats: {
            unreadCount: 0,
            totalConversations: 0,
            responseRate: 0,
            averageResponseTime: 0,
          },
        })),
      ]);

      setUpcomingSessions(sessions);
      setSessionRequests(requests);
      setVerificationStatus(status);

      if (msgStats && msgStats.success) {
        setMessageStats(msgStats.stats);
      }

      setLoading(false);
    } catch (err) {
      setError("Failed to load dashboard data");
      setLoading(false);
      console.error("Dashboard data error:", err);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return (
    <Container className="py-5">
      {/* Welcome Header with action buttons */}
      <WelcomeHeaderSection user={currentUser} messageStats={messageStats} />

      {/* Stats Cards */}
      <StatsCardsSection
        messageStats={messageStats}
        sessionCount={upcomingSessions.length}
        hoursTaught={24} // Placeholder, replace with actual data
        requestCount={sessionRequests.length}
      />

      <Row>
        {/* Left column - Main content */}
        <Col lg={8} className="mb-4 mb-lg-0">
          {/* Upcoming Sessions */}
          <UpcomingSessionsSection sessions={upcomingSessions} />

          {/* Session Requests */}
          <div className="mt-4">
            <SessionRequestsSection
              sessionRequests={sessionRequests}
              onStatusChange={fetchDashboardData}
            />
          </div>
        </Col>

        {/* Right column - Information and Notifications */}
        <Col lg={4}>
          {/* Verification Status */}
          <VerificationStatusSection verificationStatus={verificationStatus} />

          {/* Message Center */}
          <MessageCenterSection messageStats={messageStats} />
        </Col>
      </Row>
    </Container>
  );
};

export default TutorDashboard;
