const nodemailer = require("nodemailer");
require("dotenv").config();

const testEmailConfiguration = async () => {
  console.log("🧪 Testing Email Configuration...\n");

  // Check environment variables
  console.log("📋 Environment Variables:");
  console.log(`  SMTP_HOST: ${process.env.SMTP_HOST}`);
  console.log(`  SMTP_PORT: ${process.env.SMTP_PORT}`);
  console.log(`  SMTP_USER: ${process.env.SMTP_USER}`);
  console.log(
    `  SMTP_PASS: ${process.env.SMTP_PASS ? "***configured***" : "❌ NOT SET"}`
  );
  console.log(`  EMAIL_FROM: ${process.env.EMAIL_FROM}\n`);

  if (
    !process.env.SMTP_PASS ||
    process.env.SMTP_PASS === "your_app_password_here"
  ) {
    console.log("❌ Gmail App Password not configured!");
    console.log("\n🔧 To fix this:");
    console.log("1. Go to https://myaccount.google.com/security");
    console.log("2. Enable 2-Step Verification if not already enabled");
    console.log("3. Go to 'App passwords'");
    console.log("4. Generate a new app password for 'Mail'");
    console.log("5. Copy the 16-character password");
    console.log("6. Update SMTP_PASS in your .env file with this password");
    console.log(
      "\n⚠️ Note: Use the app password, NOT your regular Gmail password!\n"
    );
    return;
  }

  // Test the connection
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    console.log("🔌 Testing SMTP connection...");
    await transporter.verify();
    console.log("✅ SMTP connection successful!");

    // Send test email
    console.log("📧 Sending test email...");
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: process.env.SMTP_USER, // Send to the same email for testing
      subject: "✅ StudySphere Email Test",
      html: `
        <h2>🎉 Email Configuration Successful!</h2>
        <p>Your StudySphere email service is working correctly.</p>
        <p><strong>Configuration:</strong></p>
        <ul>
          <li>Host: ${process.env.SMTP_HOST}</li>
          <li>Port: ${process.env.SMTP_PORT}</li>
          <li>From: ${process.env.EMAIL_FROM}</li>
        </ul>
        <p>Email verification will now work properly! ✨</p>
      `,
    });

    console.log("✅ Test email sent successfully!");
    console.log(`📬 Message ID: ${info.messageId}`);
    console.log("\n🎉 Email configuration is working! Check your inbox.");
  } catch (error) {
    console.error("❌ Email test failed:");
    console.error(error.message);

    if (error.code === "EAUTH") {
      console.log("\n💡 Authentication failed. Make sure you're using:");
      console.log("   - Your Gmail email address as SMTP_USER");
      console.log(
        "   - A Gmail App Password (not your regular password) as SMTP_PASS"
      );
    }
  }
};

testEmailConfiguration();
