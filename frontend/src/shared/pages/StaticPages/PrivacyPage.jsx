import React from "react";
import { Container, Row, Col } from "react-bootstrap";
import "./StaticPages.css";

const PrivacyPage = () => {
  return (
    <div className="static-page privacy-page">
      {/* Hero Section */}
      <section className="page-hero">
        <Container>
          <Row className="justify-content-center text-center">
            <Col lg={8}>
              <h1>Privacy Policy</h1>
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
                <h2>1. Introduction</h2>
                <p>
                  StudySphere Learning Pvt Ltd ("we", "our", or "us") is
                  committed to protecting your privacy. This Privacy Policy
                  explains how we collect, use, disclose, and safeguard your
                  information when you use our platform.
                </p>

                <h2>2. Information We Collect</h2>

                <h3>Personal Information</h3>
                <p>We may collect the following personal information:</p>
                <ul>
                  <li>Name, email address, and phone number</li>
                  <li>Profile photo and biographical information</li>
                  <li>Educational qualifications and certifications</li>
                  <li>
                    Payment information (processed securely by payment
                    providers)
                  </li>
                  <li>Communication history on our platform</li>
                </ul>

                <h3>Usage Information</h3>
                <p>We automatically collect:</p>
                <ul>
                  <li>Device information (browser type, operating system)</li>
                  <li>IP address and location data</li>
                  <li>Pages visited and time spent on platform</li>
                  <li>Session recordings for quality assurance</li>
                </ul>

                <h2>3. How We Use Your Information</h2>
                <p>We use collected information to:</p>
                <ul>
                  <li>Provide and maintain our services</li>
                  <li>Match students with appropriate tutors</li>
                  <li>Process payments and transactions</li>
                  <li>Send service updates and notifications</li>
                  <li>Improve our platform and user experience</li>
                  <li>Ensure safety and prevent fraud</li>
                  <li>Comply with legal obligations</li>
                </ul>

                <h2>4. Information Sharing</h2>
                <p>We may share your information with:</p>
                <ul>
                  <li>
                    <strong>Other users:</strong> Tutors and students can view
                    each other's profile information necessary for sessions
                  </li>
                  <li>
                    <strong>Service providers:</strong> Payment processors,
                    hosting providers, and analytics services
                  </li>
                  <li>
                    <strong>Legal authorities:</strong> When required by law or
                    to protect our rights
                  </li>
                </ul>
                <p>
                  We do not sell your personal information to third parties.
                </p>

                <h2>5. Data Security</h2>
                <p>
                  We implement industry-standard security measures including:
                </p>
                <ul>
                  <li>SSL/TLS encryption for data transmission</li>
                  <li>Secure password hashing</li>
                  <li>Regular security audits</li>
                  <li>Access controls and authentication</li>
                  <li>Data backup and recovery procedures</li>
                </ul>

                <h2>6. Your Rights</h2>
                <p>You have the right to:</p>
                <ul>
                  <li>Access your personal data</li>
                  <li>Correct inaccurate information</li>
                  <li>Request deletion of your data</li>
                  <li>Opt-out of marketing communications</li>
                  <li>Export your data in a portable format</li>
                  <li>Withdraw consent at any time</li>
                </ul>

                <h2>7. Cookies and Tracking</h2>
                <p>
                  We use cookies and similar technologies to enhance your
                  experience. You can manage cookie preferences through your
                  browser settings. Essential cookies required for platform
                  functionality cannot be disabled.
                </p>

                <h2>8. Children's Privacy</h2>
                <p>
                  Our services are intended for users under 18 only with
                  parental or guardian consent. We do not knowingly collect
                  information from children under 13 without parental consent.
                  Parents may review, delete, or manage their child's
                  information by contacting us.
                </p>

                <h2>9. Data Retention</h2>
                <p>
                  We retain your information for as long as your account is
                  active or as needed to provide services. Upon account
                  deletion, we may retain certain information for legal
                  compliance, dispute resolution, or enforcement of our
                  agreements.
                </p>

                <h2>10. International Data Transfers</h2>
                <p>
                  Your information may be transferred to and processed in
                  countries other than your own. We ensure appropriate
                  safeguards are in place for such transfers.
                </p>

                <h2>11. Third-Party Links</h2>
                <p>
                  Our platform may contain links to third-party websites. We are
                  not responsible for their privacy practices. We encourage you
                  to review their privacy policies.
                </p>

                <h2>12. Changes to This Policy</h2>
                <p>
                  We may update this Privacy Policy from time to time. We will
                  notify you of significant changes via email or platform
                  notification. Continued use after changes constitutes
                  acceptance.
                </p>

                <h2>13. Contact Us</h2>
                <p>
                  For questions or concerns about this Privacy Policy, please
                  contact our Data Protection Officer:
                </p>
                <p>
                  Email: privacy@studysphere.com
                  <br />
                  Address: 123 Education Road, Bengaluru, India 560034
                  <br />
                  Phone: +91 800-555-0000
                </p>
              </div>
            </Col>
          </Row>
        </Container>
      </section>
    </div>
  );
};

export default PrivacyPage;
