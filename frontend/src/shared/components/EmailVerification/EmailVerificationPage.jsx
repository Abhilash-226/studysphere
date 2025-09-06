import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  Container,
  Row,
  Col,
  Card,
  Alert,
  Button,
  Spinner,
} from "react-bootstrap";
import {
  FaCheckCircle,
  FaTimesCircle,
  FaExclamationTriangle,
  FaHome,
  FaSignInAlt,
} from "react-icons/fa";
import emailVerificationService from "../../../shared/services/emailVerification.service";
import "./EmailVerification.css";

/**
 * EmailVerificationPage - Handles email verification from email links
 */
const EmailVerificationPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (token) {
      verifyEmail();
    } else {
      setError("Invalid verification link");
      setLoading(false);
    }
  }, [token]);

  const verifyEmail = async () => {
    try {
      setLoading(true);
      const response = await emailVerificationService.verifyEmail(token);

      if (response.success) {
        setResult({
          type: "success",
          title: "Email Verified Successfully!",
          message: response.message,
          user: response.user,
        });

        // Auto-redirect after successful verification
        setTimeout(() => {
          if (response.user?.role === "student") {
            navigate("/student/dashboard");
          } else if (response.user?.role === "tutor") {
            navigate("/tutor/profile-setup");
          } else {
            navigate("/");
          }
        }, 3000);
      } else {
        setError(response.message);
      }
    } catch (err) {
      console.error("Email verification error:", err);

      if (err.status === 400) {
        setError(
          "This verification link is invalid or has expired. Please request a new one."
        );
      } else {
        setError("An error occurred during verification. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    try {
      // This would redirect to a page where they can enter their email
      navigate("/resend-verification");
    } catch (err) {
      console.error("Redirect error:", err);
    }
  };

  return (
    <div className="email-verification-page">
      <Container className="py-5">
        <Row className="justify-content-center">
          <Col lg={6} md={8}>
            <Card className="verification-card text-center">
              <Card.Body className="p-5">
                {loading ? (
                  <div className="verification-loading">
                    <Spinner
                      animation="border"
                      variant="primary"
                      size="lg"
                      className="mb-3"
                    />
                    <h3>Verifying Your Email</h3>
                    <p className="text-muted">
                      Please wait while we verify your email address...
                    </p>
                  </div>
                ) : result ? (
                  <div className="verification-success">
                    <FaCheckCircle className="verification-icon success mb-3" />
                    <h2 className="text-success mb-3">{result.title}</h2>
                    <p className="lead mb-4">{result.message}</p>

                    <Alert variant="success" className="mb-4">
                      <strong>Welcome to StudySphere!</strong> Your account is
                      now fully activated. You'll be redirected to your
                      dashboard in a few seconds.
                    </Alert>

                    <div className="d-flex flex-column flex-md-row gap-3 justify-content-center">
                      <Button
                        variant="primary"
                        size="lg"
                        onClick={() => {
                          if (result.user?.role === "student") {
                            navigate("/student/dashboard");
                          } else if (result.user?.role === "tutor") {
                            navigate("/tutor/profile-setup");
                          } else {
                            navigate("/");
                          }
                        }}
                      >
                        Continue to Dashboard
                      </Button>
                      <Button as={Link} to="/" variant="outline-secondary">
                        <FaHome className="me-2" />
                        Go to Homepage
                      </Button>
                    </div>
                  </div>
                ) : error ? (
                  <div className="verification-error">
                    <FaTimesCircle className="verification-icon error mb-3" />
                    <h2 className="text-danger mb-3">Verification Failed</h2>
                    <p className="lead mb-4">{error}</p>

                    <Alert variant="warning" className="mb-4">
                      <FaExclamationTriangle className="me-2" />
                      <strong>Need help?</strong> If you're having trouble with
                      email verification, you can request a new verification
                      email or contact our support team.
                    </Alert>

                    <div className="d-flex flex-column flex-md-row gap-3 justify-content-center">
                      <Button
                        variant="primary"
                        onClick={handleResendVerification}
                      >
                        Request New Verification Email
                      </Button>
                      <Button
                        as={Link}
                        to="/login-student"
                        variant="outline-primary"
                      >
                        <FaSignInAlt className="me-2" />
                        Login to Your Account
                      </Button>
                      <Button as={Link} to="/" variant="outline-secondary">
                        <FaHome className="me-2" />
                        Go to Homepage
                      </Button>
                    </div>
                  </div>
                ) : null}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default EmailVerificationPage;
