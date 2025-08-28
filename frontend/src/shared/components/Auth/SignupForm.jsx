import React, { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Container,
  Form,
  Button,
  Alert,
  Row,
  Col,
  Badge,
  ProgressBar,
} from "react-bootstrap";
import {
  FaGoogle,
  FaEye,
  FaEyeSlash,
  FaSignInAlt,
  FaUserGraduate,
  FaIdCard,
  FaFileUpload,
  FaInfoCircle,
  FaArrowRight,
  FaArrowLeft,
  FaCheckCircle,
} from "react-icons/fa";
import "./AuthForms.css";
import { useAuth } from "../../context/AuthContext";
import authService from "../../services/auth.service";

const SignupForm = ({ userType = "student" }) => {
  const navigate = useNavigate();
  const { login } = useAuth();

  // Track form step (only relevant for tutors)
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = userType === "tutor" ? 2 : 1;

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phoneNumber: "",
    agreeTerms: false,
    // Additional fields for tutors
    ...(userType === "tutor" && {
      qualification: "",
      experience: "",
      specialization: "",
      idNumber: "",
      universityName: "",
      graduationYear: "",
      acceptVerification: false,
    }),
  });

  // References for file upload elements
  const idFileRef = useRef(null);
  const qualificationFileRef = useRef(null);

  // State for file uploads
  const [uploadedFiles, setUploadedFiles] = useState({
    idDocument: null,
    qualificationDocument: null,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleFileChange = (e, fileType) => {
    const file = e.target.files[0];
    if (file) {
      setUploadedFiles({
        ...uploadedFiles,
        [fileType]: file,
      });
    }
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

    // For step 2 of tutor signup
    if (step === 2) {
      // Additional validation for tutors
      if (
        !formData.qualification ||
        !formData.specialization ||
        !formData.universityName
      ) {
        setError("Please fill in all required fields for tutor registration.");
        return false;
      }

      if (!formData.acceptVerification) {
        setError("You must agree to the verification process.");
        return false;
      }

      // Document uploads are mandatory during signup
      if (!uploadedFiles.idDocument) {
        setError("Please upload a valid ID document.");
        return false;
      }

      if (!uploadedFiles.qualificationDocument) {
        setError("Please upload proof of your qualification.");
        return false;
      }

      return true;
    }

    return false;
  };

  const validateForm = () => {
    // For students, just validate step 1
    if (userType === "student") {
      return validateStep(1);
    }

    // For tutors, validate all steps
    return validateStep(1) && validateStep(2);
  };

  const goToNextStep = () => {
    setError(null);

    // Validate current step before proceeding
    if (validateStep(currentStep)) {
      setCurrentStep(currentStep + 1);
      window.scrollTo(0, 0); // Scroll to top for new step
    }
  };

  const goToPreviousStep = () => {
    setError(null);
    setCurrentStep(currentStep - 1);
    window.scrollTo(0, 0); // Scroll to top for new step
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // For multi-step forms, handle step navigation
    if (userType === "tutor" && currentStep < totalSteps) {
      goToNextStep();
      return;
    }

    // Validate entire form for final submission
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
        role: userType,
        // Add tutor-specific fields if applicable
        ...(userType === "tutor" && {
          qualification: formData.qualification,
          experience: formData.experience,
          specialization: formData.specialization,
          idNumber: formData.idNumber,
          universityName: formData.universityName,
          graduationYear: formData.graduationYear,
        }),
      };

      // Register the user first
      const response = await authService.register(userData);

      // For tutors, upload verification documents
      if (userType === "tutor" && response.user && response.token) {
        // Upload ID document
        if (uploadedFiles.idDocument) {
          await authService.uploadIdDocument(uploadedFiles.idDocument);
        }

        // Upload qualification document
        if (uploadedFiles.qualificationDocument) {
          await authService.uploadQualificationDocument(
            uploadedFiles.qualificationDocument
          );
        }

        // Log in tutors immediately and redirect to profile setup
        login(response.user, response.token, userType);
        navigate("/tutor/profile-setup");
      } else if (response.user && response.token) {
        // For students, log them in automatically
        login(response.user, response.token, userType);
      } else {
        setError("Registration completed, but login failed.");
      }
    } catch (err) {
      setError(
        err.message || "An error occurred during signup. Please try again."
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

              {userType === "tutor" && (
                <div className="step-indicator mb-4">
                  <ProgressBar
                    now={(currentStep / totalSteps) * 100}
                    variant="primary"
                    className="mb-2"
                  />
                  <div className="d-flex justify-content-between">
                    <span
                      className={`step-label ${
                        currentStep >= 1 ? "active" : ""
                      }`}
                    >
                      <small>Basic Info</small>
                    </span>
                    <span
                      className={`step-label ${
                        currentStep >= 2 ? "active" : ""
                      }`}
                    >
                      <small>Verification</small>
                    </span>
                  </div>
                </div>
              )}
            </div>

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
              {userType === "tutor"
                ? currentStep === 1
                  ? "Become a Tutor - Basic Info"
                  : "Tutor Verification"
                : "Student Signup"}
            </h2>
            <p>
              {userType === "tutor"
                ? currentStep === 1
                  ? "First, let's create your basic tutor account"
                  : "Now, let's verify your identity and qualifications"
                : "Create your account to start learning with our expert tutors"}
            </p>
          </div>

          {error && <Alert variant="danger">{error}</Alert>}

          <Form onSubmit={handleSubmit}>
            {/* Step 1: Basic Information - For both students and first step of tutors */}
            {(userType === "student" ||
              (userType === "tutor" && currentStep === 1)) && (
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
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                    >
                      {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                </Form.Group>
              </>
            )}

            {/* Step 2: Verification Information - For tutors only */}
            {userType === "tutor" && currentStep === 2 && (
              <>
                <Alert variant="info" className="mb-4">
                  <FaInfoCircle className="me-2" />
                  <strong>Tutor Verification Required</strong>
                  <p className="mb-0 mt-1">
                    To ensure the safety of our students and maintain
                    high-quality education standards, all tutors must complete a
                    verification process. Your account will be in pending status
                    until verification is complete (typically within 1-2
                    business days).
                  </p>
                </Alert>

                <Alert variant="success" className="mb-4">
                  <FaCheckCircle className="me-2" />
                  <strong>Streamlined Signup Process</strong>
                  <p className="mb-0 mt-1">
                    We've simplified the signup process! You only need to
                    provide basic qualification information now. After signup,
                    you'll be directed to complete your full tutor profile with
                    teaching preferences, availability, and more details.
                  </p>
                </Alert>

                <Form.Group className="mb-3">
                  <Form.Label>
                    Qualification <Badge bg="danger">Required</Badge>
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name="qualification"
                    value={formData.qualification}
                    onChange={handleChange}
                    placeholder="E.g., B.Tech, M.Sc Mathematics"
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>
                    University/Institution <Badge bg="danger">Required</Badge>
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name="universityName"
                    value={formData.universityName}
                    onChange={handleChange}
                    placeholder="E.g., IIT Delhi, Delhi University"
                    required
                  />
                </Form.Group>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Years of Experience</Form.Label>
                      <Form.Control
                        type="text"
                        name="experience"
                        value={formData.experience}
                        onChange={handleChange}
                        placeholder="E.g., 3 years"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Graduation Year</Form.Label>
                      <Form.Control
                        type="text"
                        name="graduationYear"
                        value={formData.graduationYear}
                        onChange={handleChange}
                        placeholder="E.g., 2022"
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-3">
                  <Form.Label>
                    Specialization <Badge bg="danger">Required</Badge>
                  </Form.Label>
                  <Form.Select
                    name="specialization"
                    value={formData.specialization}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select your specialization</option>
                    <option value="mathematics">Mathematics</option>
                    <option value="physics">Physics</option>
                    <option value="chemistry">Chemistry</option>
                    <option value="biology">Biology</option>
                    <option value="computer_science">Computer Science</option>
                    <option value="english">English</option>
                    <option value="history">History</option>
                    <option value="geography">Geography</option>
                    <option value="other">Other</option>
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>
                    ID Number{" "}
                    <small>(Aadhar, PAN, or other government ID)</small>
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name="idNumber"
                    value={formData.idNumber}
                    onChange={handleChange}
                    placeholder="Enter your ID number"
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>
                    Upload ID Proof <Badge bg="danger">Required</Badge>
                  </Form.Label>
                  <div className="custom-file-upload">
                    <input
                      type="file"
                      className="d-none"
                      ref={idFileRef}
                      onChange={(e) => handleFileChange(e, "idDocument")}
                      accept="image/*, application/pdf"
                    />
                    <Button
                      variant="outline-secondary"
                      className="w-100"
                      onClick={() => idFileRef.current.click()}
                    >
                      <FaIdCard className="me-2" />
                      {uploadedFiles.idDocument
                        ? uploadedFiles.idDocument.name
                        : "Choose ID Document"}
                    </Button>
                    <Form.Text className="text-muted">
                      Upload a clear copy of your government-issued ID (Aadhar,
                      PAN, Passport, etc.).
                    </Form.Text>
                  </div>
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label>
                    Upload Qualification Document{" "}
                    <Badge bg="danger">Required</Badge>
                  </Form.Label>
                  <div className="custom-file-upload">
                    <input
                      type="file"
                      className="d-none"
                      ref={qualificationFileRef}
                      onChange={(e) =>
                        handleFileChange(e, "qualificationDocument")
                      }
                      accept="image/*, application/pdf"
                    />
                    <Button
                      variant="outline-secondary"
                      className="w-100"
                      onClick={() => qualificationFileRef.current.click()}
                    >
                      <FaFileUpload className="me-2" />
                      {uploadedFiles.qualificationDocument
                        ? uploadedFiles.qualificationDocument.name
                        : "Choose Qualification Document"}
                    </Button>
                    <Form.Text className="text-muted">
                      Upload your degree certificate, teaching license, or other
                      qualification proof.
                    </Form.Text>
                  </div>
                </Form.Group>
              </>
            )}

            {/* Terms agreement - shown on step 1 for both */}
            {(userType === "student" ||
              (userType === "tutor" && currentStep === 1)) && (
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
            )}

            {/* Verification agreement - shown on step 2 for tutors */}
            {userType === "tutor" && currentStep === 2 && (
              <Form.Group className="mb-4">
                <Form.Check
                  type="checkbox"
                  name="acceptVerification"
                  id="acceptVerification"
                  label={
                    <span>
                      I understand that my account requires verification, and I
                      consent to StudySphere verifying my identity and
                      credentials. I certify that all information provided is
                      accurate and complete.
                    </span>
                  }
                  checked={formData.acceptVerification}
                  onChange={handleChange}
                  required
                />
              </Form.Group>
            )}

            {/* Navigation and submission buttons */}
            <div className="d-flex flex-column gap-2 mt-4">
              {userType === "tutor" && currentStep === 2 && (
                <Button
                  type="button"
                  variant="outline-secondary"
                  onClick={goToPreviousStep}
                  className="mb-2"
                >
                  <FaArrowLeft className="me-2" /> Back to Basic Information
                </Button>
              )}

              <Button
                type="submit"
                className="auth-btn"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  "Creating Account..."
                ) : userType === "tutor" ? (
                  currentStep < totalSteps ? (
                    <>
                      <FaArrowRight className="me-2" /> Continue to Verification
                    </>
                  ) : (
                    "Complete Tutor Signup"
                  )
                ) : (
                  "Sign up as a Student"
                )}
              </Button>
            </div>

            {/* Social login options - only show on first step */}
            {(userType === "student" ||
              (userType === "tutor" && currentStep === 1)) && (
              <>
                <div className="auth-divider">
                  <span>Or sign up with</span>
                </div>

                <div className="social-login">
                  <button
                    type="button"
                    className="social-btn mx-auto d-block w-100"
                  >
                    <FaGoogle className="me-2" /> Google
                  </button>
                </div>
              </>
            )}
          </Form>
        </div>
      </div>
    </div>
  );
};

export default SignupForm;
