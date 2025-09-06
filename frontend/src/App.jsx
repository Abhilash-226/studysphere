import { Routes, Route, useLocation } from "react-router-dom";
import React, { useEffect } from "react";
import Navbar from "./shared/components/Navigation/Navbar";
import Footer from "./shared/components/Navigation/Footer";
import HomePage from "./shared/components/HomePage/HomePage";
import ErrorBoundary from "./shared/components/ErrorBoundary/ErrorBoundary";
import AppLayout from "./shared/components/Layout/AppLayout";
import {
  EmailVerificationPage,
  ResendVerificationPage,
} from "./shared/components/EmailVerification";
import {
  StudentLogin,
  StudentSignup,
  StudentDashboard,
  StudentProfile,
} from "./students/pages";
import BookSessionPage from "./students/pages/BookSession/BookSessionPage";
import {
  TutorLogin,
  TutorSignup,
  TutorVerificationPending,
  TutorDashboard,
  TutorsPage,
  TutorProfileSetup,
  BecomeTutor,
  TutorProfile,
  TutorProfileEdit,
  TutorDetailsPage,
  TutorMessagesPage,
  StudentProfileViewer,
} from "./tutors/pages";
import ChatPage from "./shared/components/Chat/pages/ChatPage";
import { AuthProvider } from "./shared/context/AuthContext";
import { ProtectedRoute } from "./shared/components/Route";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";

// Component to handle scroll restoration on route changes
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Don't scroll to top for chat-related routes or when navigating within the same page type
    const chatRoutes = ["/student/chat", "/tutor/chat"];
    const isChatRoute = chatRoutes.some((route) => pathname.startsWith(route));

    if (!isChatRoute) {
      // Use requestAnimationFrame to ensure this happens after React renders
      requestAnimationFrame(() => {
        window.scrollTo({ top: 0, left: 0, behavior: "auto" });
      });
    }
  }, [pathname]);

  return null;
};

const App = () => {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <div className="app-container">
          <ScrollToTop />
          <Navbar />
          <AppLayout>
            <div className="content-container">
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<HomePage />} />
                <Route path="/login-student" element={<StudentLogin />} />
                <Route path="/login-tutor" element={<TutorLogin />} />
                <Route path="/signup-student" element={<StudentSignup />} />
                <Route path="/signup-tutor" element={<TutorSignup />} />

                {/* Email Verification Routes */}
                <Route
                  path="/verify-email/:token"
                  element={<EmailVerificationPage />}
                />
                <Route
                  path="/resend-verification"
                  element={<ResendVerificationPage />}
                />

                <Route path="/tutors" element={<TutorsPage />} />
                <Route
                  path="/online-tuition"
                  element={<TutorsPage teachingMode="online" />}
                />
                <Route
                  path="/offline-tuition"
                  element={<TutorsPage teachingMode="offline" />}
                />
                <Route path="/tutors/:id" element={<TutorDetailsPage />} />
                <Route path="/become-tutor" element={<BecomeTutor />} />
                <Route
                  path="/tutor-verification-pending"
                  element={<TutorVerificationPending />}
                />

                {/* Protected Student Routes */}
                <Route
                  element={
                    <ProtectedRoute
                      redirectPath="/login-student"
                      requiredRole="student"
                    />
                  }
                >
                  <Route
                    path="/student/dashboard"
                    element={<StudentDashboard />}
                  />
                  <Route path="/student/profile" element={<StudentProfile />} />
                  <Route
                    path="/student/sessions"
                    element={<div>Student Sessions (To be implemented)</div>}
                  />
                  <Route path="/book/:tutorId" element={<BookSessionPage />} />
                  <Route path="/student/chat" element={<ChatPage />} />
                  <Route
                    path="/student/chat/:conversationId"
                    element={<ChatPage />}
                  />
                </Route>

                {/* Protected Tutor Routes */}
                <Route
                  element={
                    <ProtectedRoute
                      redirectPath="/login-tutor"
                      requiredRole="tutor"
                    />
                  }
                >
                  <Route path="/tutor/dashboard" element={<TutorDashboard />} />
                  <Route
                    path="/tutor/student/:studentId"
                    element={<StudentProfileViewer />}
                  />
                  <Route
                    path="/tutor/profile-setup"
                    element={<TutorProfileSetup />}
                  />
                  <Route path="/tutor/profile" element={<TutorProfile />} />
                  <Route
                    path="/tutor/profile-edit"
                    element={<TutorProfileEdit />}
                  />
                  <Route
                    path="/tutor/sessions"
                    element={<div>Tutor Sessions (To be implemented)</div>}
                  />
                  <Route path="/tutor/chat" element={<ChatPage />} />
                  <Route
                    path="/tutor/chat/:conversationId"
                    element={<ChatPage />}
                  />
                </Route>

                {/* Catch All Route */}
                <Route path="*" element={<div>Page Not Found</div>} />
              </Routes>
            </div>
          </AppLayout>
          <Footer />
        </div>
      </AuthProvider>
    </ErrorBoundary>
  );
};

export default App;
