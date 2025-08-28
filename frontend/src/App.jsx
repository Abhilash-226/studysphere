import { Routes, Route } from "react-router-dom";
import Navbar from "./shared/components/Navigation/Navbar";
import Footer from "./shared/components/Navigation/Footer";
import HomePage from "./shared/components/HomePage/HomePage";
import ErrorBoundary from "./shared/components/ErrorBoundary/ErrorBoundary";
import {
  StudentLogin,
  StudentSignup,
  StudentDashboard,
} from "./students/pages";
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
} from "./tutors/pages";
import TutorChatContainer from "./tutors/components/Chat/TutorChat";
import StudentChatContainer from "./students/components/Chat/StudentChat";
import { AuthProvider } from "./shared/context/AuthContext";
import { ProtectedRoute } from "./shared/components/Route";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";

const App = () => {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <div className="app-container">
          <Navbar />
          <div className="content-container">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<HomePage />} />
              <Route path="/login-student" element={<StudentLogin />} />
              <Route path="/login-tutor" element={<TutorLogin />} />
              <Route path="/signup-student" element={<StudentSignup />} />
              <Route path="/signup-tutor" element={<TutorSignup />} />
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
                <Route
                  path="/student/profile"
                  element={<div>Student Profile (To be implemented)</div>}
                />
                <Route
                  path="/student/sessions"
                  element={<div>Student Sessions (To be implemented)</div>}
                />
                <Route
                  path="/student/chat"
                  element={<StudentChatContainer />}
                />
                <Route
                  path="/student/chat/:conversationId"
                  element={<StudentChatContainer />}
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
                <Route path="/tutor/chat" element={<TutorChatContainer />} />
                <Route
                  path="/tutor/chat/:conversationId"
                  element={<TutorChatContainer />}
                />
              </Route>

              {/* Catch All Route */}
              <Route path="*" element={<div>Page Not Found</div>} />
            </Routes>
          </div>
          <Footer />
        </div>
      </AuthProvider>
    </ErrorBoundary>
  );
};

export default App;
