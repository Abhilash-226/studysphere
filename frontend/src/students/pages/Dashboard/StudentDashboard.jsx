import React, { useEffect, useState } from "react";
import { Container, Row, Col, Card, Alert, Button } from "react-bootstrap";
import { useAuth } from "../../../shared/context/AuthContext";
import studentService from "../../../shared/services/student.service";
import chatService from "../../../shared/services/chat.service";
import api from "../../../shared/services/api.service";
import "./StudentDashboard.css";

// Import components
import {
  StatsCards,
  UpcomingSessions,
  RecommendedTutors,
  WelcomeHeader,
  QuickActions,
} from "./components";

const StudentDashboard = () => {
  const { currentUser, logout } = useAuth();
  const [upcomingSessions, setUpcomingSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [roleInfo, setRoleInfo] = useState(null);
  const [messageStats, setMessageStats] = useState({
    unreadCount: 0,
    totalConversations: 0,
  });
  const [recommendedTutors, setRecommendedTutors] = useState([]);

  useEffect(() => {
    const checkUserRole = async () => {
      try {
        const response = await api.get("/users/check-role");
        setRoleInfo(response.data);
      } catch (err) {
        console.error("Error checking user role:", err);
      }
    };

    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        // Check user role first
        await checkUserRole();

        // Fetch data in parallel for better performance
        const [sessions, messages, tutors] = await Promise.all([
          studentService.getBookedSessions("upcoming"),
          chatService
            .getStudentMessageStats()
            .catch(() => ({ unreadCount: 0, totalConversations: 0 })),
          studentService.getRecommendedTutors().catch(() => []),
        ]);

        setUpcomingSessions(sessions);
        setMessageStats(messages);
        setRecommendedTutors(tutors);
        setLoading(false);
      } catch (err) {
        let errorMessage = "Failed to load dashboard data";

        if (err.message === "Access denied") {
          errorMessage =
            "Access denied. Your account may not have student privileges.";
        }

        setError(errorMessage);
        setLoading(false);
        console.error("Dashboard data error:", err);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <Container className="py-5">
      <WelcomeHeader
        userName={currentUser?.firstName || "Student"}
        notificationCount={roleInfo ? 1 : 0}
        unreadMessageCount={messageStats.unreadCount}
      />

      {error && (
        <Alert variant="danger" className="mb-4">
          <Alert.Heading>Error</Alert.Heading>
          <p>{error}</p>
          {error.includes("Access denied") && (
            <>
              <hr />
              <p className="mb-0">
                Your role may be incorrect or your login session has expired.
              </p>
              <Button
                variant="outline-danger"
                onClick={logout}
                className="mt-2"
              >
                Log Out and Try Again
              </Button>
            </>
          )}
        </Alert>
      )}

      <StatsCards
        stats={{
          sessionCount: upcomingSessions?.length || 0,
          tutorCount: recommendedTutors?.length || 30,
          unreadMessages: messageStats?.unreadCount || 0,
          upcomingCount: upcomingSessions?.length || 0,
        }}
        loading={loading}
      />

      <Row>
        <Col lg={8}>
          <UpcomingSessions
            sessions={upcomingSessions}
            loading={loading}
            error={error}
          />

          <RecommendedTutors
            tutors={recommendedTutors}
            loading={loading}
            error={error}
          />
        </Col>

        <Col lg={4}>
          <QuickActions
            messageStats={messageStats}
            unreadMessageCount={messageStats.unreadCount}
          />
        </Col>
      </Row>

      {roleInfo && (
        <div className="mt-4 text-end">
          <small className="text-muted">
            Logged in as {roleInfo.userRole} (ID:{" "}
            {roleInfo.userId.substring(0, 6)}...)
          </small>
        </div>
      )}
    </Container>
  );
};

export default StudentDashboard;
