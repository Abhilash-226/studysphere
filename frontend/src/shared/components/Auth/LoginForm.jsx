import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Container, Form, Button, Alert } from "react-bootstrap";
import {
  FaGoogle,
  FaEye,
  FaEyeSlash,
  FaSignInAlt,
  FaUserPlus,
} from "react-icons/fa";
import "./AuthForms.css";
import { useAuth } from "../../context/AuthContext";
import authService from "../../services/auth.service";

const LoginForm = ({ userType = "student" }) => {
  const navigate = useNavigate();
  const { login, setError: setAuthError } = useAuth();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value, checked } = e.target;
    setFormData({
      ...formData,
      [name]: name === "rememberMe" ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      // Validate inputs
      if (!formData.email || !formData.password) {
        setError("Please enter both email and password.");
        setIsSubmitting(false);
        return;
      }

      // Call authentication service
      const response = await authService.login(
        formData.email,
        formData.password
      );

      // Check if response has token and user data
      if (response.token && response.user) {
        // Store in context and redirect
        login(response.user, response.token, userType);

        // Redirect is handled by the login function in AuthContext
        console.log(`${userType} logged in successfully`);
      } else {
        setError("Login failed. Please check your credentials.");
      }
    } catch (err) {
      // Check if it's an email verification error
      if (err.message && err.message.includes("verify your email")) {
        setError(
          <div>
            {err.message}
            <br />
            <Link to="/resend-verification" className="text-primary">
              Need to resend verification email?
            </Link>
          </div>
        );
      } else {
        setError(
          err.message || "An error occurred during login. Please try again."
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        {/* Left Sidebar */}
        <div className="auth-sidebar">
          <div className="sidebar-content">
            <div className="sidebar-header">
              <h2>Welcome to StudySphere!</h2>
              <p>
                {userType === "tutor"
                  ? "Join our community of passionate educators and help students excel in their studies."
                  : "Connect with expert tutors and take your learning journey to the next level."}
              </p>
            </div>

            <div className="auth-image">
              <img
                src={
                  userType === "tutor"
                    ? "/images/tutors/tutor-illustration.svg"
                    : "/images/hero-student.svg"
                }
                alt={
                  userType === "tutor"
                    ? "Tutor Illustration"
                    : "Student Illustration"
                }
              />
            </div>

            <div className="auth-options">
              <h3>Options</h3>
              <Button
                as={Link}
                to={`/signup-${userType}`}
                className="auth-toggle-btn"
              >
                <FaUserPlus className="me-2" /> Create new account
              </Button>

              {userType === "student" ? (
                <Button as={Link} to="/login-tutor" className="auth-toggle-btn">
                  <FaSignInAlt className="me-2" /> Login as a tutor
                </Button>
              ) : (
                <Button
                  as={Link}
                  to="/login-student"
                  className="auth-toggle-btn"
                >
                  <FaSignInAlt className="me-2" /> Login as a student
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Right Form Area */}
        <div className="auth-form-container">
          <div className="auth-header">
            <img src="/logo.svg" alt="StudySphere Logo" />
            <h2>{userType === "tutor" ? "Tutor Login" : "Student Login"}</h2>
            <p>
              Welcome back! Log in to{" "}
              {userType === "tutor"
                ? "access your teaching dashboard"
                : "continue your learning journey"}
              .
            </p>
          </div>

          {error && <Alert variant="danger">{error}</Alert>}

          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Email Address</Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Password</Form.Label>
              <div className="password-field">
                <Form.Control
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={togglePasswordVisibility}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </Form.Group>

            <div className="d-flex justify-content-between align-items-center mb-4">
              <Form.Check
                type="checkbox"
                name="rememberMe"
                label="Remember me"
                checked={formData.rememberMe}
                onChange={handleChange}
              />
              <Link
                to={`/forgot-password?role=${userType}`}
                className="text-decoration-none"
              >
                Forgot password?
              </Link>
            </div>

            <Button type="submit" className="auth-btn" disabled={isSubmitting}>
              {isSubmitting ? "Logging in..." : "Login"}
            </Button>

            <div className="auth-divider">
              <span>Or continue with</span>
            </div>

            <div className="social-login">
              <button
                type="button"
                className="social-btn mx-auto d-block w-100"
              >
                <FaGoogle className="me-2" /> Google
              </button>
            </div>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
