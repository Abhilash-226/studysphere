// Email service for sending notifications

const nodemailer = require("nodemailer");

// Initialize email transport
let transporter;

// Check if Gmail SMTP settings are configured
const hasGmailConfig =
  process.env.SMTP_HOST &&
  process.env.SMTP_USER &&
  process.env.SMTP_PASS &&
  process.env.SMTP_PASS !== "your_app_password_here";

if (hasGmailConfig) {
  // Use Gmail SMTP configuration
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: false, // true for 465, false for other ports like 587
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    tls: {
      rejectUnauthorized: false, // Allow self-signed certificates
    },
  });
  console.log("📧 Email service initialized with Gmail SMTP");
} else if (process.env.NODE_ENV === "production") {
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
  // Development fallback - create test account
  console.log("⚠️ No Gmail SMTP configured, using Ethereal test emails");
  console.log(
    "📧 To receive real emails, set up Gmail App Password in .env file"
  );

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
 * Send email verification email
 * @param {string} email - User email
 * @param {string} name - User's name
 * @param {string} verificationUrl - Verification URL
 */
exports.sendEmailVerification = async (email, name, verificationUrl) => {
  const subject = "Verify Your StudySphere Email Address";
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #4a6cf7; margin: 0;">StudySphere</h1>
        <p style="color: #666; margin: 5px 0;">Your Learning Journey Starts Here</p>
      </div>
      
      <div style="background: #f8f9fa; padding: 30px; border-radius: 10px; margin-bottom: 20px;">
        <h2 style="color: #333; margin-top: 0;">Verify Your Email Address</h2>
        <p style="color: #666; line-height: 1.5;">Hello ${name},</p>
        <p style="color: #666; line-height: 1.5;">
          Thank you for signing up with StudySphere! To complete your registration and ensure the security of your account, 
          please verify your email address by clicking the button below.
        </p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verificationUrl}" 
             style="background: #4a6cf7; color: white; padding: 15px 30px; text-decoration: none; 
                    border-radius: 5px; font-weight: bold; display: inline-block;">
            Verify Email Address
          </a>
        </div>
        
        <p style="color: #666; line-height: 1.5; font-size: 14px;">
          If the button doesn't work, copy and paste this link into your browser:
        </p>
        <p style="color: #4a6cf7; word-break: break-all; font-size: 14px;">
          ${verificationUrl}
        </p>
      </div>
      
      <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
        <p style="color: #856404; margin: 0; font-size: 14px;">
          <strong>⚠️ Important:</strong> This verification link will expire in 24 hours for security reasons.
        </p>
      </div>
      
      <div style="border-top: 1px solid #eee; padding-top: 20px; font-size: 14px; color: #666;">
        <p>If you didn't create an account with StudySphere, you can safely ignore this email.</p>
        <p>Need help? Contact our support team at support@studysphere.com</p>
        <p style="margin-bottom: 0;">
          Best regards,<br>
          The StudySphere Team
        </p>
      </div>
    </div>
  `;

  return await this.sendEmail(email, subject, html);
};

/**
 * Send OTP email for email verification
 * @param {string} email - User email
 * @param {string} name - User's name
 * @param {string} otp - 6-digit OTP code
 */
exports.sendOTPEmail = async (email, name, otp) => {
  const subject = "Your StudySphere Verification Code";
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #4a6cf7; margin: 0;">StudySphere</h1>
        <p style="color: #666; margin: 5px 0;">Your Learning Journey Starts Here</p>
      </div>
      
      <div style="background: #f8f9fa; padding: 30px; border-radius: 10px; margin-bottom: 20px;">
        <h2 style="color: #333; margin-top: 0;">Email Verification Code</h2>
        <p style="color: #666; line-height: 1.5;">Hello ${name},</p>
        <p style="color: #666; line-height: 1.5;">
          Thank you for signing up with StudySphere! Please use the verification code below to complete your registration:
        </p>
        
        <div style="text-align: center; margin: 30px 0;">
          <div style="background: #4a6cf7; color: white; padding: 20px 40px; display: inline-block; border-radius: 10px; font-size: 32px; font-weight: bold; letter-spacing: 8px;">
            ${otp}
          </div>
        </div>
        
        <p style="color: #666; line-height: 1.5; text-align: center; font-size: 14px;">
          Enter this code on the verification page to verify your email address.
        </p>
      </div>
      
      <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
        <p style="color: #856404; margin: 0; font-size: 14px;">
          <strong>⚠️ Important:</strong> This code will expire in 10 minutes for security reasons.
        </p>
      </div>
      
      <div style="background: #f8d7da; border: 1px solid #f5c6cb; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
        <p style="color: #721c24; margin: 0; font-size: 14px;">
          <strong>🔒 Security Tip:</strong> Never share this code with anyone. StudySphere will never ask for your verification code.
        </p>
      </div>
      
      <div style="border-top: 1px solid #eee; padding-top: 20px; font-size: 14px; color: #666;">
        <p>If you didn't create an account with StudySphere, you can safely ignore this email.</p>
        <p>Need help? Contact our support team at support@studysphere.com</p>
        <p style="margin-bottom: 0;">
          Best regards,<br>
          The StudySphere Team
        </p>
      </div>
    </div>
  `;

  return await this.sendEmail(email, subject, html);
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

/**
 * Send verification approval email to tutors
 * @param {string} email - Tutor email
 * @param {string} name - Tutor's name
 */
exports.sendVerificationApprovalEmail = async (email, name) => {
  const subject =
    "🎉 Congratulations! Your StudySphere Tutor Account is Approved";
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #4a6cf7; margin: 0;">StudySphere</h1>
        <p style="color: #666; margin: 5px 0;">Your Teaching Journey Begins!</p>
      </div>
      
      <div style="background: #d4edda; border: 1px solid #c3e6cb; padding: 30px; border-radius: 10px; margin-bottom: 20px;">
        <h2 style="color: #155724; margin-top: 0; text-align: center;">🎉 Verification Approved!</h2>
        <p style="color: #155724; line-height: 1.5;">Hello ${name},</p>
        <p style="color: #155724; line-height: 1.5;">
          Great news! Your tutor account has been verified and approved. You can now start accepting students and conducting sessions on StudySphere.
        </p>
      </div>
      
      <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; margin-bottom: 20px;">
        <h3 style="color: #333; margin-top: 0;">What's Next?</h3>
        <ul style="color: #666; line-height: 1.8;">
          <li>Complete your profile to attract more students</li>
          <li>Set your availability and hourly rate</li>
          <li>Add your teaching subjects and specializations</li>
          <li>Start receiving session requests from students</li>
        </ul>
      </div>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${
          process.env.FRONTEND_URL || "http://localhost:5173"
        }/tutor/dashboard" 
           style="background: #4a6cf7; color: white; padding: 15px 30px; text-decoration: none; 
                  border-radius: 5px; font-weight: bold; display: inline-block;">
          Go to Your Dashboard
        </a>
      </div>
      
      <div style="border-top: 1px solid #eee; padding-top: 20px; font-size: 14px; color: #666;">
        <p>Thank you for joining our community of educators!</p>
        <p style="margin-bottom: 0;">
          Best regards,<br>
          The StudySphere Team
        </p>
      </div>
    </div>
  `;

  return await this.sendEmail(email, subject, html);
};

/**
 * Send verification rejection email to tutors
 * @param {string} email - Tutor email
 * @param {string} name - Tutor's name
 * @param {string} reason - Rejection reason
 */
exports.sendVerificationRejectionEmail = async (email, name, reason) => {
  const subject = "StudySphere Tutor Verification Update";
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #4a6cf7; margin: 0;">StudySphere</h1>
        <p style="color: #666; margin: 5px 0;">Verification Update</p>
      </div>
      
      <div style="background: #f8d7da; border: 1px solid #f5c6cb; padding: 30px; border-radius: 10px; margin-bottom: 20px;">
        <h2 style="color: #721c24; margin-top: 0;">Verification Not Approved</h2>
        <p style="color: #721c24; line-height: 1.5;">Hello ${name},</p>
        <p style="color: #721c24; line-height: 1.5;">
          We regret to inform you that your tutor verification could not be approved at this time.
        </p>
      </div>
      
      <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; margin-bottom: 20px;">
        <h3 style="color: #333; margin-top: 0;">Reason:</h3>
        <p style="color: #666; line-height: 1.5; white-space: pre-wrap;">${
          reason || "No specific reason provided."
        }</p>
      </div>
      
      <div style="background: #e7f3ff; border: 1px solid #b6d4fe; padding: 20px; border-radius: 10px; margin-bottom: 20px;">
        <h3 style="color: #0a58ca; margin-top: 0;">What Can You Do?</h3>
        <p style="color: #0a58ca; line-height: 1.5;">
          If you believe this decision was made in error or you can provide additional documentation, 
          please contact our support team at support@studysphere.com.
        </p>
      </div>
      
      <div style="border-top: 1px solid #eee; padding-top: 20px; font-size: 14px; color: #666;">
        <p>We appreciate your interest in becoming a tutor on StudySphere.</p>
        <p style="margin-bottom: 0;">
          Best regards,<br>
          The StudySphere Team
        </p>
      </div>
    </div>
  `;

  return await this.sendEmail(email, subject, html);
};

/**
 * Send additional info request email to tutors
 * @param {string} email - Tutor email
 * @param {string} name - Tutor's name
 * @param {string} requestedInfo - What additional info is needed
 */
exports.sendVerificationInfoRequestEmail = async (
  email,
  name,
  requestedInfo
) => {
  const subject = "StudySphere: Additional Information Needed for Verification";
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #4a6cf7; margin: 0;">StudySphere</h1>
        <p style="color: #666; margin: 5px 0;">Verification Update</p>
      </div>
      
      <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 30px; border-radius: 10px; margin-bottom: 20px;">
        <h2 style="color: #856404; margin-top: 0;">📋 Additional Information Required</h2>
        <p style="color: #856404; line-height: 1.5;">Hello ${name},</p>
        <p style="color: #856404; line-height: 1.5;">
          We are reviewing your tutor verification request. To complete the verification process, we need some additional information from you.
        </p>
      </div>
      
      <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; margin-bottom: 20px;">
        <h3 style="color: #333; margin-top: 0;">What We Need:</h3>
        <p style="color: #666; line-height: 1.5; white-space: pre-wrap;">${requestedInfo}</p>
      </div>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${
          process.env.FRONTEND_URL || "http://localhost:5173"
        }/tutor/profile-setup" 
           style="background: #4a6cf7; color: white; padding: 15px 30px; text-decoration: none; 
                  border-radius: 5px; font-weight: bold; display: inline-block;">
          Update Your Profile
        </a>
      </div>
      
      <div style="background: #e7f3ff; border: 1px solid #b6d4fe; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
        <p style="color: #0a58ca; margin: 0; font-size: 14px;">
          <strong>💡 Tip:</strong> Please respond within 7 days to avoid delays in your verification process.
        </p>
      </div>
      
      <div style="border-top: 1px solid #eee; padding-top: 20px; font-size: 14px; color: #666;">
        <p>If you have questions, please contact our support team at support@studysphere.com</p>
        <p style="margin-bottom: 0;">
          Best regards,<br>
          The StudySphere Team
        </p>
      </div>
    </div>
  `;

  return await this.sendEmail(email, subject, html);
};
