import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Form, Button, Alert, Row, Col } from "react-bootstrap";
import { GoogleLogin } from "@react-oauth/google";
import {
  FaGoogle,
  FaEye,
  FaEyeSlash,
  FaSignInAlt,
  FaUserGraduate,
  FaInfoCircle,
} from "react-icons/fa";
import "./AuthForms.css";
import { useAuth } from "../../context/AuthContext";
import authService from "../../services/auth.service";

const SignupForm = ({ userType = "student" }) => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phoneNumber: "",
    gender: "",
    agreeTerms: false,
  });

  // File uploads moved to profile setup page after login

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  // Handle Google Sign-Up Success
  const handleGoogleSuccess = async (credentialResponse) => {
    setError(null);
    setIsGoogleLoading(true);

    try {
      const response = await authService.googleAuth(
        credentialResponse.credential,
        userType,
      );

      if (response.token && response.user) {
        // Redirect to profile setup for new users or if profile is incomplete
        const needsProfileSetup =
          response.isNewUser ||
          (response.user.role === "tutor" && !response.user.isProfileComplete);

        if (needsProfileSetup) {
          if (userType === "tutor" || response.user.role === "tutor") {
            login(
              response.user,
              response.token,
              response.user.role || userType,
              "/tutor/profile-setup",
            );
          } else {
            login(
              response.user,
              response.token,
              response.user.role || userType,
              "/student/profile",
            );
          }
        } else {
          // Existing user with complete profile - go to dashboard
          login(response.user, response.token, response.user.role);
        }
      }
    } catch (err) {
      setError(err.message || "Google sign-up failed. Please try again.");
    } finally {
      setIsGoogleLoading(false);
    }
  };

  // Handle Google Sign-Up Error
  const handleGoogleError = () => {
    setError("Google sign-up failed. Please try again or use email signup.");
  };

  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const validateStep = (step) => {
    // For student or step 1 of tutor signup
    if (step === 1) {
      // Basic validation for first step
      if (
        !formData.firstName ||
        !formData.lastName ||
        !formData.email ||
        !formData.password
      ) {
        setError("Please fill in all required fields.");
        return false;
      }

      if (formData.password !== formData.confirmPassword) {
        setError("Passwords do not match.");
        return false;
      }

      if (formData.password.length < 8) {
        setError("Password must be at least 8 characters long.");
        return false;
      }

      if (!formData.agreeTerms) {
        setError("You must agree to the terms and conditions.");
        return false;
      }

      return true;
    }

    return false;
  };

  const validateForm = () => {
    return validateStep(1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Validate form for submission
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare registration data
      const userData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        phoneNumber: formData.phoneNumber,
        gender: formData.gender,
        role: userType,
      };

      // Register the user first
      const response = await authService.register(userData);

      // Check if email verification is required
      if (response.emailVerificationRequired) {
        // Redirect to OTP verification page
        navigate("/verify-otp", {
          state: {
            email: formData.email,
            userType: userType,
          },
        });
      } else {
        // Legacy flow for backward compatibility (if OTP not required)
        if (response.user && response.token) {
          login(response.user, response.token, userType);
          // Tutors go to profile setup, students go to dashboard
          navigate(
            userType === "tutor"
              ? "/tutor/profile-setup"
              : "/student/dashboard",
          );
        } else {
          setError("Registration completed, but login failed.");
        }
      }
    } catch (err) {
      setError(
        err.message || "An error occurred during signup. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        {/* Left Sidebar */}
        <div className="auth-sidebar">
          <div className="sidebar-content">
            <div className="sidebar-header">
              <h2>
                {userType === "tutor"
                  ? "Join Our Teaching Team"
                  : "Begin Your Learning Journey"}
              </h2>
              <p>
                {userType === "tutor"
                  ? "Share your expertise and help students achieve their academic goals while earning on your own schedule."
                  : "Get personalized learning experiences tailored to your needs with our expert tutors."}
              </p>
            </div>

            {userType === "tutor" && (
              <Alert variant="info" className="tutor-info-alert">
                <FaInfoCircle className="me-2" />
                <strong>Quick & Easy Signup!</strong>
                <p className="mb-0 mt-1 small">
                  Just create your account now. You'll complete your full tutor
                  profile (qualifications, subjects, availability) after email
                  verification.
                </p>
              </Alert>
            )}

            <div className="auth-image">
              <img
                src={
                  userType === "tutor"
                    ? "/images/tutors/tutor-placeholder.svg"
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
              <h3>Already have an account?</h3>
              <Button
                as={Link}
                to={`/login-${userType}`}
                className="auth-toggle-btn"
              >
                <FaSignInAlt className="me-2" /> Login to your account
              </Button>

              {userType === "student" ? (
                <Button
                  as={Link}
                  to="/signup-tutor"
                  className="auth-toggle-btn"
                >
                  <FaUserGraduate className="me-2" /> Sign up as a tutor
                </Button>
              ) : (
                <Button
                  as={Link}
                  to="/signup-student"
                  className="auth-toggle-btn"
                >
                  <FaUserGraduate className="me-2" /> Sign up as a student
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Right Form Area */}
        <div className="auth-form-container">
          <div className="auth-header">
            <img src="/logo.svg" alt="StudySphere Logo" />
            <h2>
              {userType === "tutor" ? "Become a Tutor" : "Student Signup"}
            </h2>
            <p>
              {userType === "tutor"
                ? "Create your account and start teaching with StudySphere"
                : "Create your account to start learning with our expert tutors"}
            </p>
          </div>

          {error && <Alert variant="danger">{error}</Alert>}

          <Form onSubmit={handleSubmit}>
            {/* Basic Information - For both students and tutors */}
            <>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>First Name</Form.Label>
                    <Form.Control
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      placeholder="Enter your first name"
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Last Name</Form.Label>
                    <Form.Control
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      placeholder="Enter your last name"
                      required
                    />
                  </Form.Group>
                </Col>
              </Row>

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
                <Form.Text className="text-muted">
                  We'll never share your email with anyone else.
                </Form.Text>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Phone Number</Form.Label>
                <Form.Control
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  placeholder="Enter your phone number"
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Gender (Optional)</Form.Label>
                <Form.Select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                >
                  <option value="">Select gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                  <option value="Prefer not to say">Prefer not to say</option>
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Password</Form.Label>
                <div className="password-field">
                  <Form.Control
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Create a password"
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                <Form.Text className="text-muted">
                  Password must be at least 8 characters long.
                </Form.Text>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Confirm Password</Form.Label>
                <div className="password-field">
                  <Form.Control
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Confirm your password"
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </Form.Group>
            </>

            {/* Terms agreement - shown for all users */}
            <Form.Group className="mb-3">
              <Form.Check
                type="checkbox"
                name="agreeTerms"
                id="agreeTerms"
                label={
                  <span>
                    I agree to the{" "}
                    <Link to="/terms" target="_blank">
                      Terms of Service
                    </Link>{" "}
                    and{" "}
                    <Link to="/privacy" target="_blank">
                      Privacy Policy
                    </Link>
                  </span>
                }
                checked={formData.agreeTerms}
                onChange={handleChange}
                required
              />
            </Form.Group>

            {/* Navigation and submission buttons */}
            <div className="d-flex flex-column gap-2 mt-4">
              <Button
                type="submit"
                className="auth-btn"
                disabled={isSubmitting}
              >
                {isSubmitting
                  ? "Creating Account..."
                  : userType === "tutor"
                    ? "Sign up as a Tutor"
                    : "Sign up as a Student"}
              </Button>
            </div>

            {/* Social login options */}
            <div className="auth-divider">
              <span>Or sign up with</span>
            </div>

            <div className="social-login d-flex justify-content-center">
              {isGoogleLoading ? (
                <Button variant="outline-secondary" disabled className="w-100">
                  <span className="spinner-border spinner-border-sm me-2" />
                  Signing up with Google...
                </Button>
              ) : (
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={handleGoogleError}
                  text="signup_with"
                  shape="rectangular"
                  size="large"
                  width={400}
                  theme="outline"
                />
              )}
            </div>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default SignupForm;
