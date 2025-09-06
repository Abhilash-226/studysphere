import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  Alert,
  Spinner,
} from "react-bootstrap";
import {
  FaEnvelope,
  FaArrowLeft,
  FaExclamationCircle,
  FaCheckCircle,
  FaClock,
} from "react-icons/fa";
import emailVerificationService from "../../../shared/services/emailVerification.service";

/**
 * ResendVerificationPage - Allows users to request new verification emails
 */
const ResendVerificationPage = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);
  const [cooldownTime, setCooldownTime] = useState(0);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email) {
      setError("Please enter your email address");
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setError("Please enter a valid email address");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      const response = await emailVerificationService.sendVerificationEmail(
        email
      );

      if (response.success) {
        setSuccess({
          message: response.message,
          attemptsLeft: response.attemptsLeft,
        });
        setEmail(""); // Clear the form
      } else {
        setError(response.message);

        // Handle rate limiting
        if (response.retryAfter) {
          setCooldownTime(response.retryAfter);
          startCooldownTimer();
        }
      }
    } catch (err) {
      console.error("Resend verification error:", err);

      if (err.status === 429) {
        setError(err.message);
        if (err.retryAfter) {
          setCooldownTime(err.retryAfter);
          startCooldownTimer();
        }
      } else if (err.status === 404) {
        setError(
          "No account found with this email address. Please check your email or create a new account."
        );
      } else if (
        err.status === 400 &&
        err.message.includes("already verified")
      ) {
        setError(
          "This email address is already verified. You can login to your account."
        );
      } else {
        setError(
          err.message || "Failed to send verification email. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const startCooldownTimer = () => {
    const timer = setInterval(() => {
      setCooldownTime((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);
  };

  const formatCooldownTime = (seconds) => {
    if (seconds < 60) {
      return `${seconds} seconds`;
    }

    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes} minutes`;
  };

  return (
    <div className="resend-verification-page">
      <Container className="py-5">
        <Row className="justify-content-center">
          <Col lg={5} md={7}>
            <Card className="verification-card">
              <Card.Body className="p-4">
                <div className="text-center mb-4">
                  <FaEnvelope
                    className="verification-icon mb-3"
                    style={{ fontSize: "3rem", color: "#4a6cf7" }}
                  />
                  <h2>Resend Verification Email</h2>
                  <p className="text-muted">
                    Enter your email address to receive a new verification link
                  </p>
                </div>

                {error && (
                  <Alert variant="danger" className="mb-4">
                    <FaExclamationCircle className="me-2" />
                    {error}
                  </Alert>
                )}

                {success && (
                  <Alert variant="success" className="mb-4">
                    <FaCheckCircle className="me-2" />
                    <div>
                      <strong>Verification email sent!</strong>
                      <p className="mb-0 mt-1">{success.message}</p>
                      {success.attemptsLeft !== undefined && (
                        <small className="text-muted">
                          Attempts remaining today: {success.attemptsLeft}
                        </small>
                      )}
                    </div>
                  </Alert>
                )}

                {cooldownTime > 0 && (
                  <Alert variant="warning" className="mb-4">
                    <FaClock className="me-2" />
                    <strong>
                      Please wait {formatCooldownTime(cooldownTime)}
                    </strong>{" "}
                    before requesting another email.
                  </Alert>
                )}

                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-3">
                    <Form.Label>Email Address</Form.Label>
                    <Form.Control
                      type="email"
                      placeholder="Enter your email address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={loading || cooldownTime > 0}
                      required
                    />
                    <Form.Text className="text-muted">
                      We'll send a new verification link to this email address.
                    </Form.Text>
                  </Form.Group>

                  <div className="d-grid gap-2 mb-3">
                    <Button
                      type="submit"
                      variant="primary"
                      size="lg"
                      disabled={loading || cooldownTime > 0 || !email.trim()}
                    >
                      {loading ? (
                        <>
                          <Spinner size="sm" className="me-2" />
                          Sending Email...
                        </>
                      ) : cooldownTime > 0 ? (
                        `Wait ${formatCooldownTime(cooldownTime)}`
                      ) : (
                        "Send Verification Email"
                      )}
                    </Button>
                  </div>
                </Form>

                <div className="text-center">
                  <p className="mb-2">
                    <small className="text-muted">
                      Already verified your email?
                    </small>
                  </p>
                  <div className="d-flex gap-2 justify-content-center">
                    <Button
                      as={Link}
                      to="/login-student"
                      variant="outline-primary"
                      size="sm"
                    >
                      Student Login
                    </Button>
                    <Button
                      as={Link}
                      to="/login-tutor"
                      variant="outline-primary"
                      size="sm"
                    >
                      Tutor Login
                    </Button>
                  </div>
                </div>

                <div className="text-center mt-4">
                  <Button as={Link} to="/" variant="link" size="sm">
                    <FaArrowLeft className="me-1" />
                    Back to Homepage
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default ResendVerificationPage;
