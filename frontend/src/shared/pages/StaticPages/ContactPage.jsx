import React, { useState } from "react";
import {
  Container,
  Row,
  Col,
  Form,
  Button,
  Card,
  Alert,
} from "react-bootstrap";
import { FaMapMarkerAlt, FaEnvelope, FaPhone, FaClock } from "react-icons/fa";
import "./StaticPages.css";

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [status, setStatus] = useState({ type: "", message: "" });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Simulate form submission
    setTimeout(() => {
      setStatus({
        type: "success",
        message:
          "Thank you for your message! We'll get back to you within 24 hours.",
      });
      setFormData({ name: "", email: "", subject: "", message: "" });
      setLoading(false);
    }, 1000);
  };

  const contactInfo = [
    {
      icon: <FaMapMarkerAlt />,
      title: "Address",
      content: "123 Education Road, Koramangala, Bengaluru, Karnataka 560034",
    },
    {
      icon: <FaEnvelope />,
      title: "Email",
      content: "info@studysphere.com",
      link: "mailto:info@studysphere.com",
    },
    {
      icon: <FaPhone />,
      title: "Phone",
      content: "+91 800-555-0000",
      link: "tel:+918005550000",
    },
    {
      icon: <FaClock />,
      title: "Hours",
      content: "Mon - Sat: 9:00 AM - 8:00 PM IST",
    },
  ];

  return (
    <div className="static-page contact-page">
      {/* Hero Section */}
      <section className="page-hero">
        <Container>
          <Row className="justify-content-center text-center">
            <Col lg={8}>
              <h1>Contact Us</h1>
              <p className="lead">
                Have questions? We'd love to hear from you. Send us a message
                and we'll respond as soon as possible.
              </p>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Contact Content */}
      <section className="content-section">
        <Container>
          <Row>
            {/* Contact Form */}
            <Col lg={7} className="mb-4 mb-lg-0">
              <Card className="contact-form-card">
                <Card.Body className="p-4">
                  <h3 className="mb-4">Send us a Message</h3>

                  {status.message && (
                    <Alert
                      variant={status.type}
                      onClose={() => setStatus({ type: "", message: "" })}
                      dismissible
                    >
                      {status.message}
                    </Alert>
                  )}

                  <Form onSubmit={handleSubmit}>
                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Your Name</Form.Label>
                          <Form.Control
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="John Doe"
                            required
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Email Address</Form.Label>
                          <Form.Control
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="john@example.com"
                            required
                          />
                        </Form.Group>
                      </Col>
                    </Row>

                    <Form.Group className="mb-3">
                      <Form.Label>Subject</Form.Label>
                      <Form.Control
                        type="text"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        placeholder="How can we help?"
                        required
                      />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Message</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={5}
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        placeholder="Your message..."
                        required
                      />
                    </Form.Group>

                    <Button
                      variant="primary"
                      type="submit"
                      className="w-100"
                      disabled={loading}
                    >
                      {loading ? "Sending..." : "Send Message"}
                    </Button>
                  </Form>
                </Card.Body>
              </Card>
            </Col>

            {/* Contact Info */}
            <Col lg={5}>
              <div className="contact-info-wrapper">
                <h3 className="mb-4">Get in Touch</h3>
                {contactInfo.map((info, index) => (
                  <Card key={index} className="contact-info-card mb-3">
                    <Card.Body className="d-flex align-items-start">
                      <div className="contact-icon me-3">{info.icon}</div>
                      <div>
                        <h5 className="mb-1">{info.title}</h5>
                        {info.link ? (
                          <a href={info.link} className="text-decoration-none">
                            {info.content}
                          </a>
                        ) : (
                          <p className="mb-0 text-muted">{info.content}</p>
                        )}
                      </div>
                    </Card.Body>
                  </Card>
                ))}
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* FAQ CTA */}
      <section className="cta-section bg-light">
        <Container>
          <Row className="justify-content-center text-center">
            <Col lg={8}>
              <h3>Looking for quick answers?</h3>
              <p className="mb-3">
                Check out our FAQ section for answers to commonly asked
                questions.
              </p>
              <Button variant="outline-primary" href="/faq">
                Visit FAQ
              </Button>
            </Col>
          </Row>
        </Container>
      </section>
    </div>
  );
};

export default ContactPage;
