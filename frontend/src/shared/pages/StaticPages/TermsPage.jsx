import React from "react";
import { Container, Row, Col } from "react-bootstrap";
import "./StaticPages.css";

const TermsPage = () => {
  return (
    <div className="static-page terms-page">
      {/* Hero Section */}
      <section className="page-hero">
        <Container>
          <Row className="justify-content-center text-center">
            <Col lg={8}>
              <h1>Terms of Service</h1>
              <p className="lead">Last updated: January 2026</p>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Content Section */}
      <section className="content-section">
        <Container>
          <Row className="justify-content-center">
            <Col lg={8}>
              <div className="legal-content">
                <h2>1. Acceptance of Terms</h2>
                <p>
                  By accessing or using StudySphere's services, you agree to be
                  bound by these Terms of Service. If you do not agree to these
                  terms, please do not use our services.
                </p>

                <h2>2. Description of Service</h2>
                <p>
                  StudySphere provides an online platform connecting students
                  with tutors for educational services. We facilitate the
                  connection between tutors and students but do not directly
                  provide tutoring services ourselves.
                </p>

                <h2>3. User Accounts</h2>
                <p>
                  To use certain features of our platform, you must create an
                  account. You are responsible for:
                </p>
                <ul>
                  <li>
                    Maintaining the confidentiality of your account credentials
                  </li>
                  <li>All activities that occur under your account</li>
                  <li>Providing accurate and complete information</li>
                  <li>Notifying us immediately of any unauthorized access</li>
                </ul>

                <h2>4. User Conduct</h2>
                <p>You agree not to:</p>
                <ul>
                  <li>Use the service for any unlawful purpose</li>
                  <li>Harass, abuse, or harm other users</li>
                  <li>Impersonate any person or entity</li>
                  <li>Upload malicious content or viruses</li>
                  <li>Attempt to gain unauthorized access to our systems</li>
                  <li>Share account credentials with others</li>
                </ul>

                <h2>5. Tutor Requirements</h2>
                <p>Tutors on our platform must:</p>
                <ul>
                  <li>Provide accurate information about qualifications</li>
                  <li>Complete our verification process</li>
                  <li>Maintain professional conduct during sessions</li>
                  <li>
                    Honor scheduled sessions or cancel with appropriate notice
                  </li>
                  <li>Comply with all applicable laws and regulations</li>
                </ul>

                <h2>6. Student Requirements</h2>
                <p>Students on our platform must:</p>
                <ul>
                  <li>Provide accurate personal information</li>
                  <li>Have parental/guardian consent if under 18</li>
                  <li>Attend scheduled sessions or cancel with notice</li>
                  <li>Respect tutors and maintain appropriate behavior</li>
                  <li>Complete payments as agreed</li>
                </ul>

                <h2>7. Payment Terms</h2>
                <p>
                  All payments are processed securely through our platform.
                  Students pay for sessions in advance, and tutors receive
                  payment after session completion, minus any applicable
                  platform fees. Refund policies vary based on cancellation
                  timing and session type.
                </p>

                <h2>8. Cancellation Policy</h2>
                <ul>
                  <li>Cancellations 24+ hours before: Full refund</li>
                  <li>Cancellations 12-24 hours before: 50% refund</li>
                  <li>Cancellations less than 12 hours: No refund</li>
                  <li>Tutor no-shows: Full refund plus credit</li>
                </ul>

                <h2>9. Intellectual Property</h2>
                <p>
                  All content on StudySphere, including logos, designs, and
                  software, is our intellectual property. Users retain ownership
                  of content they create but grant us a license to use it for
                  platform operations.
                </p>

                <h2>10. Limitation of Liability</h2>
                <p>
                  StudySphere is not responsible for the quality of tutoring
                  services provided by tutors. We do not guarantee learning
                  outcomes. Our liability is limited to the amount paid for
                  services through our platform.
                </p>

                <h2>11. Dispute Resolution</h2>
                <p>
                  Any disputes shall be resolved through binding arbitration in
                  Bengaluru, Karnataka, India, in accordance with Indian law.
                </p>

                <h2>12. Changes to Terms</h2>
                <p>
                  We may update these terms from time to time. Continued use of
                  the platform after changes constitutes acceptance of the new
                  terms.
                </p>

                <h2>13. Contact Information</h2>
                <p>
                  For questions about these Terms of Service, please contact us
                  at:
                </p>
                <p>
                  Email: legal@studysphere.com
                  <br />
                  Address: 123 Education Road, Bengaluru, India 560034
                </p>
              </div>
            </Col>
          </Row>
        </Container>
      </section>
    </div>
  );
};

export default TermsPage;
