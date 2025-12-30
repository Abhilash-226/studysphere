import React, { useEffect, useState } from "react";
import { Container, Row, Col, Badge, Button } from "react-bootstrap";
import { useAuth } from "../../../shared/context/AuthContext";
import { useRealtimeDashboard } from "../../../shared/hooks/useRealtimeDashboard";
import tutorService from "../../../shared/services/tutor.service";
import tutorChatService from "../../../shared/services/tutor-chat.service";
import sessionRequestService from "../../../shared/services/sessionRequestService";

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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize real-time dashboard data
  const {
    dashboardData,
    connectionStatus,
    refreshData,
    updateDashboardData,
    isConnected,
  } = useRealtimeDashboard("tutor", {
    upcomingSessions: [],
    verificationStatus: null,
    messageStats: {
      unreadCount: 0,
      totalConversations: 0,
      responseRate: 0,
      averageResponseTime: 0,
    },
    sessionRequests: [],
    dashboardStats: {
      totalSessions: 0,
      totalHours: 0,
      totalStudents: 0,
      completedSessions: 0,
      upcomingSessions: 0,
      pendingRequests: 0,
      averageRating: 0,
    },
    pendingRequestsCount: 0,
  });

  const {
    upcomingSessions,
    verificationStatus,
    messageStats,
    sessionRequests,
    dashboardStats,
    pendingRequestsCount,
    lastUpdated,
  } = dashboardData;

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch data in parallel for better performance
      const [
        sessionsResponse,
        status,
        msgStats,
        requests,
        dashboardStats,
        pendingRequestsCount,
      ] = await Promise.all([
        tutorService.getScheduledSessions("upcoming"),
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
        sessionRequestService.getRequestsForTutor().catch(() => []),
        tutorService.getDashboardStats(),
        tutorService.getPendingRequestsCount(),
      ]);

      // Extract data from API responses
      const statsData = dashboardStats?.success
        ? dashboardStats.data
        : dashboardStats;
      const requestsCount =
        pendingRequestsCount?.count ?? pendingRequestsCount ?? 0;

      // Update real-time dashboard data
      updateDashboardData({
        upcomingSessions: sessionsResponse || [],
        verificationStatus: status,
        messageStats: msgStats?.success
          ? {
              unreadCount: msgStats.unreadCount || 0,
              totalConversations: msgStats.totalConversations || 0,
              responseRate: 0,
              averageResponseTime: 0,
            }
          : {
              unreadCount: 0,
              totalConversations: 0,
              responseRate: 0,
              averageResponseTime: 0,
            },
        sessionRequests: requests || [],
        dashboardStats: statsData || {
          totalSessions: 0,
          totalHours: 0,
          totalStudents: 0,
          completedSessions: 0,
          upcomingSessions: 0,
          pendingRequests: 0,
          averageRating: 0,
        },
        pendingRequestsCount: requestsCount,
      });

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
        sessionCount={
          upcomingSessions?.length || dashboardStats?.upcomingSessions || 0
        }
        requestCount={
          pendingRequestsCount ||
          sessionRequests?.filter((r) => r.status === "pending")?.length ||
          0
        }
        totalStudents={dashboardStats?.totalStudents || 0}
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
              onRefresh={(requests) =>
                updateDashboardData({ sessionRequests: requests })
              }
              loading={loading}
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
