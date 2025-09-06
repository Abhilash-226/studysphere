import { useState, useEffect, useCallback } from "react";
import realtimeService from "../services/realtime.service";

/**
 * Custom hook for real-time dashboard data updates
 * @param {string} userRole - User role (student/tutor)
 * @param {Object} initialData - Initial dashboard data
 * @returns {Object} - Dashboard state and update functions
 */
export const useRealtimeDashboard = (userRole, initialData = {}) => {
  const [dashboardData, setDashboardData] = useState({
    upcomingSessions: initialData.upcomingSessions || [],
    messageStats: initialData.messageStats || {},
    sessionRequests: initialData.sessionRequests || [],
    verificationStatus: initialData.verificationStatus || null,
    recommendedTutors: initialData.recommendedTutors || [],
    loading: false,
    lastUpdated: new Date(),
    ...initialData,
  });

  const [connectionStatus, setConnectionStatus] = useState({
    isConnected: false,
    error: null,
  });

  // Handle connection status updates
  const handleConnectionUpdate = useCallback((data) => {
    setConnectionStatus({
      isConnected: data.status === "connected",
      error: data.status === "error" ? data.error : null,
    });
  }, []);

  // Handle dashboard data updates
  const handleDashboardUpdate = useCallback((data) => {
    console.log("Received dashboard update:", data);
    setDashboardData((prev) => ({
      ...prev,
      ...data,
      lastUpdated: new Date(),
    }));
  }, []);

  // Handle session updates
  const handleSessionUpdate = useCallback((data) => {
    console.log("Received session update:", data);
    setDashboardData((prev) => {
      const updatedSessions = [...prev.upcomingSessions];

      if (data.action === "created") {
        updatedSessions.unshift(data.session);
      } else if (data.action === "updated") {
        const index = updatedSessions.findIndex(
          (s) => s._id === data.session._id
        );
        if (index !== -1) {
          updatedSessions[index] = data.session;
        }
      } else if (data.action === "cancelled" || data.action === "completed") {
        const index = updatedSessions.findIndex(
          (s) => s._id === data.sessionId
        );
        if (index !== -1) {
          updatedSessions.splice(index, 1);
        }
      }

      return {
        ...prev,
        upcomingSessions: updatedSessions,
        lastUpdated: new Date(),
      };
    });
  }, []);

  // Handle session request updates
  const handleSessionRequestUpdate = useCallback((data) => {
    console.log("Received session request update:", data);
    setDashboardData((prev) => {
      const updatedRequests = [...(prev.sessionRequests || [])];

      if (data.action === "created") {
        updatedRequests.unshift(data.request);
      } else if (data.action === "updated") {
        const index = updatedRequests.findIndex(
          (r) => r._id === data.request._id
        );
        if (index !== -1) {
          // If the request status is no longer "pending", remove it from the list
          if (data.request.status !== "pending") {
            updatedRequests.splice(index, 1);
          } else {
            updatedRequests[index] = data.request;
          }
        }
      } else if (data.action === "deleted") {
        const index = updatedRequests.findIndex(
          (r) => r._id === data.requestId
        );
        if (index !== -1) {
          updatedRequests.splice(index, 1);
        }
      }

      return {
        ...prev,
        sessionRequests: updatedRequests,
        lastUpdated: new Date(),
      };
    });
  }, []);

  // Handle message stats updates
  const handleMessageStatsUpdate = useCallback((data) => {
    console.log("Received message stats update:", data);
    setDashboardData((prev) => ({
      ...prev,
      messageStats: {
        ...prev.messageStats,
        ...data,
      },
      lastUpdated: new Date(),
    }));
  }, []);

  // Handle verification status updates (tutor only)
  const handleVerificationStatusUpdate = useCallback((data) => {
    console.log("Received verification status update:", data);
    setDashboardData((prev) => ({
      ...prev,
      verificationStatus: data,
      lastUpdated: new Date(),
    }));
  }, []);

  // Request data refresh
  const refreshData = useCallback(
    (dataType = null) => {
      if (dataType) {
        realtimeService.requestDataRefresh(dataType);
      } else {
        // Refresh all data types
        realtimeService.requestDataRefresh("sessions");
        realtimeService.requestDataRefresh("messages");
        if (userRole === "tutor") {
          realtimeService.requestDataRefresh("session_requests");
          realtimeService.requestDataRefresh("verification_status");
        }
        if (userRole === "student") {
          realtimeService.requestDataRefresh("recommended_tutors");
        }
      }
    },
    [userRole]
  );

  // Update dashboard data programmatically
  const updateDashboardData = useCallback((updates) => {
    setDashboardData((prev) => ({
      ...prev,
      ...updates,
      lastUpdated: new Date(),
    }));
  }, []);

  // Initialize real-time connection and event listeners
  useEffect(() => {
    // Connect to WebSocket
    realtimeService.connect();
    realtimeService.subscribeToDashboard(userRole);

    // Set up event listeners
    realtimeService.on("connection", handleConnectionUpdate);
    realtimeService.on("dashboard_update", handleDashboardUpdate);
    realtimeService.on("session_update", handleSessionUpdate);
    realtimeService.on("session_request_update", handleSessionRequestUpdate);
    realtimeService.on("message_stats_update", handleMessageStatsUpdate);
    realtimeService.on(
      "verification_status_update",
      handleVerificationStatusUpdate
    );

    // Cleanup function
    return () => {
      realtimeService.off("connection", handleConnectionUpdate);
      realtimeService.off("dashboard_update", handleDashboardUpdate);
      realtimeService.off("session_update", handleSessionUpdate);
      realtimeService.off("session_request_update", handleSessionRequestUpdate);
      realtimeService.off("message_stats_update", handleMessageStatsUpdate);
      realtimeService.off(
        "verification_status_update",
        handleVerificationStatusUpdate
      );
      realtimeService.unsubscribeFromDashboard();
    };
  }, [
    userRole,
    handleConnectionUpdate,
    handleDashboardUpdate,
    handleSessionUpdate,
    handleSessionRequestUpdate,
    handleMessageStatsUpdate,
    handleVerificationStatusUpdate,
  ]);

  return {
    dashboardData,
    connectionStatus,
    refreshData,
    updateDashboardData,
    isConnected: connectionStatus.isConnected,
  };
};
