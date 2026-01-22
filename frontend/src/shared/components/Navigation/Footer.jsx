import React, { useState } from "react";
import { Container, Row, Col, Form, Button, Alert } from "react-bootstrap";
import { Link } from "react-router-dom";
import {
  FaFacebookF,
  FaInstagram,
  FaTwitter,
  FaYoutube,
  FaLinkedinIn,
  FaMapMarkerAlt,
  FaEnvelope,
  FaPhoneAlt,
  FaArrowRight,
  FaCheck,
  FaSpinner,
} from "react-icons/fa";
import "./Footer.css";

const Footer = () => {
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [subscribeStatus, setSubscribeStatus] = useState({
    type: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);

    // Real-time validation
    if (value && !validateEmail(value)) {
      setEmailError("Please enter a valid email address");
    } else {
      setEmailError("");
    }

    // Clear any previous status
    if (subscribeStatus.message) {
      setSubscribeStatus({ type: "", message: "" });
    }
  };

  const handleSubscribe = async (e) => {
    e.preventDefault();

    if (!email) {
      setEmailError("Email is required");
      return;
    }

    if (!validateEmail(email)) {
      setEmailError("Please enter a valid email address");
      return;
    }

    setIsSubmitting(true);
    setEmailError("");

    // Simulate API call
    setTimeout(() => {
      setSubscribeStatus({
        type: "success",
        message: "Thank you for subscribing! We'll keep you updated.",
      });
      setEmail("");
      setIsSubmitting(false);

      // Auto-hide success message after 5 seconds
      setTimeout(() => {
        setSubscribeStatus({ type: "", message: "" });
      }, 5000);
    }, 1000);
  };

  return (
    <footer className="site-footer">
      <div className="footer-main">
        <Container>
          <Row className="footer-content">
            <Col lg={4} md={6} sm={12} className="mb-4 mb-lg-0">
              <div className="footer-brand">
                <Link to="/" className="footer-logo">
                  <img src="/logo.svg" alt="StudySphere Logo" />
                  <span>StudySphere</span>
                </Link>
                <p className="footer-description">
                  Connecting passionate engineering tutors with curious school
                  students across India. StudySphere makes learning accessible,
                  personalized, and impactful—featuring 50,000+ students and
                  10,000+ verified tutors.
                </p>
                <div className="social-links mb-4">
                  <a
                    href="https://facebook.com/studysphere"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Facebook"
                  >
                    <FaFacebookF />
                  </a>
                  <a
                    href="https://instagram.com/studysphere"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Instagram"
                  >
                    <FaInstagram />
                  </a>
                  <a
                    href="https://twitter.com/studysphere"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Twitter"
                  >
                    <FaTwitter />
                  </a>
                  <a
                    href="https://youtube.com/studysphere"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="YouTube"
                  >
                    <FaYoutube />
                  </a>
                  <a
                    href="https://linkedin.com/company/studysphere"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="LinkedIn"
                  >
                    <FaLinkedinIn />
                  </a>
                </div>
              </div>
            </Col>
            <Col lg={2} md={6} sm={6} className="mb-4 mb-lg-0">
              <div className="footer-links">
                <h4>Explore</h4>
                <ul>
                  <li>
                    <Link to="/find-tutors">Find Tutors</Link>
                  </li>
                  <li>
                    <Link to="/become-tutor">Become a Tutor</Link>
                  </li>
                  <li>
                    <Link to="/subjects">Subjects</Link>
                  </li>
                  <li>
                    <Link to="/pricing">Pricing</Link>
                  </li>
                  <li>
                    <Link to="/how-it-works">How It Works</Link>
                  </li>
                </ul>
              </div>
            </Col>
            <Col lg={2} md={6} sm={6} className="mb-4 mb-lg-0">
              <div className="footer-links">
                <h4>Company</h4>
                <ul>
                  <li>
                    <Link to="/about">About Us</Link>
                  </li>
                  <li>
                    <Link to="/careers">Careers</Link>
                  </li>
                  <li>
                    <Link to="/blog">Blog</Link>
                  </li>
                  <li>
                    <Link to="/press">Press</Link>
                  </li>
                  <li>
                    <Link to="/contact">Contact</Link>
                  </li>
                </ul>
              </div>
            </Col>
            <Col lg={4} md={6} sm={12}>
              <div className="footer-links">
                <h4>Subscribe</h4>
                <p className="mb-3">
                  Stay updated with our latest news and offers
                </p>

                {subscribeStatus.message && (
                  <Alert
                    variant={subscribeStatus.type}
                    className="py-2 mb-3"
                    style={{ fontSize: "0.9rem" }}
                  >
                    {subscribeStatus.type === "success" && (
                      <FaCheck className="me-2" />
                    )}
                    {subscribeStatus.message}
                  </Alert>
                )}

                <Form
                  onSubmit={handleSubscribe}
                  className="d-flex flex-column mb-3"
                >
                  <div className="d-flex mb-2">
                    <Form.Control
                      type="email"
                      placeholder="Your email address"
                      className={`me-2 ${emailError ? "is-invalid" : email && validateEmail(email) ? "is-valid" : ""}`}
                      style={{
                        borderRadius: "8px",
                        border: emailError
                          ? "1px solid #dc3545"
                          : "1px solid #dde",
                        padding: "10px 15px",
                        boxShadow: "none",
                      }}
                      value={email}
                      onChange={handleEmailChange}
                      disabled={isSubmitting}
                    />
                    <Button
                      variant="primary"
                      type="submit"
                      disabled={isSubmitting || !!emailError}
                      style={{
                        borderRadius: "8px",
                        background:
                          "linear-gradient(135deg, #4a7aff 0%, #2b5be3 100%)",
                        border: "none",
                        padding: "0 15px",
                        minWidth: "50px",
                      }}
                    >
                      {isSubmitting ? (
                        <FaSpinner className="fa-spin" />
                      ) : (
                        <FaArrowRight />
                      )}
                    </Button>
                  </div>
                  {emailError && (
                    <Form.Text
                      className="text-danger"
                      style={{ fontSize: "0.8rem" }}
                    >
                      {emailError}
                    </Form.Text>
                  )}
                </Form>

                <h4 className="mt-4">Contact</h4>
                <ul className="contact-info">
                  <li className="d-flex align-items-center mb-2">
                    <FaMapMarkerAlt
                      style={{ marginRight: "10px", color: "#4a7aff" }}
                    />
                    <span>123 Education Road, Bengaluru, India</span>
                  </li>
                  <li className="d-flex align-items-center mb-2">
                    <FaEnvelope
                      style={{ marginRight: "10px", color: "#4a7aff" }}
                    />
                    <a href="mailto:info@studysphere.com">
                      info@studysphere.com
                    </a>
                  </li>
                  <li className="d-flex align-items-center">
                    <FaPhoneAlt
                      style={{ marginRight: "10px", color: "#4a7aff" }}
                    />
                    <a href="tel:+918005550000">+91 800-555-0000</a>
                  </li>
                </ul>
              </div>
            </Col>
          </Row>
        </Container>
      </div>
      <div className="footer-bottom">
        <Container>
          <Row className="align-items-center">
            <Col md={6} className="text-center text-md-start">
              <p className="mb-md-0">
                &copy; 2025 StudySphere Learning Pvt Ltd. All Rights Reserved
              </p>
            </Col>
            <Col md={6} className="text-center text-md-end">
              <ul className="d-flex justify-content-center justify-content-md-end list-unstyled mb-0">
                <li className="me-3">
                  <Link
                    to="/terms"
                    className="text-decoration-none"
                    style={{ color: "#556" }}
                  >
                    Terms
                  </Link>
                </li>
                <li className="me-3">
                  <Link
                    to="/privacy"
                    className="text-decoration-none"
                    style={{ color: "#556" }}
                  >
                    Privacy
                  </Link>
                </li>
                <li>
                  <Link
                    to="/faq"
                    className="text-decoration-none"
                    style={{ color: "#556" }}
                  >
                    FAQ
                  </Link>
                </li>
              </ul>
            </Col>
          </Row>
        </Container>
      </div>
    </footer>
  );
};

export default Footer;
