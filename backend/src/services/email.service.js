// Email service for sending notifications

const nodemailer = require("nodemailer");

// Initialize email transport
let transporter;

if (process.env.NODE_ENV === "production") {
  // Production configuration with actual SMTP server
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: process.env.SMTP_PORT === "465", // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
} else {
  // Development configuration - logs to console
  transporter = nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false,
    auth: {
      user: "ethereal_user", // Add your Ethereal email for testing
      pass: "ethereal_pass", // Add your Ethereal password for testing
    },
  });
}

/**
 * Send an email
 * @param {string} to - Recipient email
 * @param {string} subject - Email subject
 * @param {string} html - Email body in HTML format
 * @returns {Promise} Email sending result
 */
exports.sendEmail = async (to, subject, html) => {
  try {
    const mailOptions = {
      from:
        process.env.EMAIL_FROM || '"StudySphere" <no-reply@studysphere.com>',
      to,
      subject,
      html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent:", info.messageId);

    // For development, log preview URL
    if (process.env.NODE_ENV !== "production") {
      console.log("Preview URL:", nodemailer.getTestMessageUrl(info));
    }

    return info;
  } catch (error) {
    console.error("Email sending failed:", error);
    throw error;
  }
};

/**
 * Send a welcome email to new users
 * @param {string} email - User email
 * @param {string} name - User's name
 */
exports.sendWelcomeEmail = async (email, name) => {
  const subject = "Welcome to StudySphere!";
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #4a6cf7;">Welcome to StudySphere!</h1>
      <p>Hello ${name},</p>
      <p>Thank you for joining StudySphere! We're excited to have you on board.</p>
      <p>With StudySphere, you can:</p>
      <ul>
        <li>Find expert tutors for your subjects</li>
        <li>Schedule and attend sessions</li>
        <li>Track your learning progress</li>
      </ul>
      <p>If you have any questions, please don't hesitate to contact our support team.</p>
      <p>Best regards,<br>The StudySphere Team</p>
    </div>
  `;

  return await this.sendEmail(email, subject, html);
};

/**
 * Send verification pending email to tutors
 * @param {string} email - Tutor email
 * @param {string} name - Tutor's name
 */
exports.sendVerificationPendingEmail = async (email, name) => {
  const subject = "StudySphere Tutor Verification Status";
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #4a6cf7;">Verification In Progress</h1>
      <p>Hello ${name},</p>
      <p>Thank you for signing up as a tutor with StudySphere!</p>
      <p>Your account is currently under verification. Our team will review your credentials and identity documents to ensure the safety and quality of our platform.</p>
      <p>Verification typically takes 1-2 business days. You'll receive an email notification once your account has been approved.</p>
      <p>If you have any questions, please contact our support team.</p>
      <p>Best regards,<br>The StudySphere Team</p>
    </div>
  `;

  return await this.sendEmail(email, subject, html);
};
