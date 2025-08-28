import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

/**
 * Protected route component that redirects unauthenticated users
 * and can restrict access based on user roles
 */
const ProtectedRoute = ({ redirectPath = "/", requiredRole = null }) => {
  const { isAuthenticated, getUserRole, loading } = useAuth();

  // If auth is still loading, show nothing (or could show a spinner)
  if (loading) {
    return null;
  }

  // Check authentication
  if (!isAuthenticated()) {
    return <Navigate to={redirectPath} replace />;
  }

  // If role requirement specified, check if user has required role
  if (requiredRole && getUserRole() !== requiredRole) {
    // Redirect to appropriate dashboard based on actual role
    const actualRole = getUserRole();
    if (actualRole === "student") {
      return <Navigate to="/student/dashboard" replace />;
    } else if (actualRole === "tutor") {
      return <Navigate to="/tutor/dashboard" replace />;
    } else {
      return <Navigate to="/" replace />;
    }
  }

  // If authenticated and has required role (or no role required), render the child routes
  return <Outlet />;
};

export default ProtectedRoute;
