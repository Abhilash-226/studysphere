import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button, Alert, Spinner } from "react-bootstrap";
import { FaEnvelope, FaCheckCircle, FaRedo, FaArrowLeft } from "react-icons/fa";
import authService from "../../services/auth.service";
import { useAuth } from "../../context/AuthContext";
import "./AuthForms.css";

const OTPVerification = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  // Get email and userType from navigation state
  const email = location.state?.email || "";
  const userType = location.state?.userType || "student";

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [timer, setTimer] = useState(120); // 2 minutes countdown
  const [canResend, setCanResend] = useState(false);

  // Refs for OTP input fields
  const inputRefs = useRef([]);

  // Timer countdown effect
  useEffect(() => {
    if (timer > 0 && !canResend) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    } else if (timer === 0) {
      setCanResend(true);
    }
  }, [timer, canResend]);

  // Redirect if no email provided
  useEffect(() => {
    if (!email) {
      navigate("/signup-student");
    }
  }, [email, navigate]);

  // Handle OTP input change
  const handleChange = (index, value) => {
    // Only allow numbers
    if (value && !/^\d$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Handle paste event
  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").trim();

    // Check if pasted data is 6 digits
    if (/^\d{6}$/.test(pastedData)) {
      const digits = pastedData.split("");
      setOtp(digits);
      inputRefs.current[5]?.focus();
    }
  };

  // Handle backspace
  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // Verify OTP
  const handleVerify = async () => {
    const otpValue = otp.join("");

    if (otpValue.length !== 6) {
      setError("Please enter the complete 6-digit code.");
      return;
    }

    setIsVerifying(true);
    setError(null);

    try {
      const response = await authService.verifyOTP(email, otpValue);

      if (response.verified && response.token && response.user) {
        setSuccess("Email verified successfully! Logging you in...");

        setTimeout(() => {
          // Redirect to profile setup to complete their profile
          if (response.user.role === "tutor") {
            login(
              response.user,
              response.token,
              response.user.role,
              "/tutor/profile-setup"
            );
          } else {
            // For students, redirect to profile page to complete their profile
            login(
              response.user,
              response.token,
              response.user.role,
              "/student/profile"
            );
          }
        }, 1500);
      }
    } catch (err) {
      setError(err.message || "Verification failed. Please try again.");
      // Clear OTP on error
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } finally {
      setIsVerifying(false);
    }
  };

  // Resend OTP
  const handleResend = async () => {
    setIsResending(true);
    setError(null);

    try {
      await authService.resendOTP(email);
      setSuccess("A new verification code has been sent to your email.");
      setTimer(120);
      setCanResend(false);
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();

      // Clear success message after 5 seconds
      setTimeout(() => setSuccess(null), 5000);
    } catch (err) {
      setError(err.message || "Failed to resend code. Please try again.");
    } finally {
      setIsResending(false);
    }
  };

  // Format timer display
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div
      className="auth-page"
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #f5f7fa 0%, #e4e8f0 100%)",
      }}
    >
      <div
        className="otp-verification-card"
        style={{
          background: "white",
          borderRadius: "24px",
          boxShadow: "0 20px 60px rgba(0, 0, 0, 0.1)",
          padding: "48px 40px",
          maxWidth: "440px",
          width: "100%",
          margin: "20px",
        }}
      >
        {/* Header Icon */}
        <div className="text-center mb-4">
          <div
            style={{
              width: "90px",
              height: "90px",
              borderRadius: "50%",
              background: "linear-gradient(135deg, #4a6cf7 0%, #6366f1 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto",
              boxShadow: "0 10px 30px rgba(74, 108, 247, 0.3)",
            }}
          >
            <FaEnvelope size={40} color="white" />
          </div>
        </div>

        {/* Title */}
        <div className="text-center mb-4">
          <h2
            style={{
              fontSize: "28px",
              fontWeight: "700",
              color: "#1a1a2e",
              marginBottom: "12px",
            }}
          >
            Verify Your Email
          </h2>
          <p
            style={{ color: "#6b7280", fontSize: "15px", marginBottom: "8px" }}
          >
            We've sent a 6-digit verification code to
          </p>
          <p style={{ color: "#4a6cf7", fontWeight: "600", fontSize: "16px" }}>
            {email}
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert
            variant="danger"
            className="mb-4"
            style={{ borderRadius: "12px", fontSize: "14px" }}
          >
            {error}
          </Alert>
        )}

        {/* Success Alert */}
        {success && (
          <Alert
            variant="success"
            className="mb-4"
            style={{ borderRadius: "12px", fontSize: "14px" }}
          >
            <FaCheckCircle className="me-2" />
            {success}
          </Alert>
        )}

        {/* OTP Input Fields */}
        <div
          className="otp-input-container d-flex justify-content-center mb-4"
          style={{ gap: "12px" }}
        >
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={(el) => (inputRefs.current[index] = el)}
              type="text"
              inputMode="numeric"
              maxLength="1"
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onPaste={handlePaste}
              className="otp-input"
              style={{
                width: "52px",
                height: "62px",
                textAlign: "center",
                fontSize: "26px",
                fontWeight: "700",
                color: "#1a1a2e",
                border: digit ? "2px solid #4a6cf7" : "2px solid #e5e7eb",
                borderRadius: "14px",
                outline: "none",
                transition: "all 0.2s ease",
                background: digit ? "#f0f4ff" : "#fafafa",
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "#4a6cf7";
                e.target.style.boxShadow = "0 0 0 4px rgba(74, 108, 247, 0.15)";
                e.target.style.background = "#fff";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = digit ? "#4a6cf7" : "#e5e7eb";
                e.target.style.boxShadow = "none";
                e.target.style.background = digit ? "#f0f4ff" : "#fafafa";
              }}
              disabled={isVerifying}
            />
          ))}
        </div>

        {/* Timer */}
        <div className="text-center mb-4">
          {!canResend ? (
            <p
              style={{ color: "#6b7280", fontSize: "14px", marginBottom: "0" }}
            >
              Code expires in{" "}
              <span
                style={{
                  color: timer <= 30 ? "#ef4444" : "#4a6cf7",
                  fontWeight: "700",
                  fontSize: "16px",
                }}
              >
                {formatTime(timer)}
              </span>
            </p>
          ) : (
            <p
              style={{
                color: "#f59e0b",
                fontSize: "14px",
                marginBottom: "0",
                fontWeight: "500",
              }}
            >
              ⚠️ Code has expired. Please request a new one.
            </p>
          )}
        </div>

        {/* Verify Button */}
        <Button
          size="lg"
          className="w-100 mb-3"
          onClick={handleVerify}
          disabled={isVerifying || otp.join("").length !== 6}
          style={{
            background:
              otp.join("").length === 6
                ? "linear-gradient(135deg, #4a6cf7 0%, #6366f1 100%)"
                : "#e5e7eb",
            border: "none",
            borderRadius: "14px",
            padding: "14px",
            fontSize: "16px",
            fontWeight: "600",
            color: otp.join("").length === 6 ? "white" : "#9ca3af",
            boxShadow:
              otp.join("").length === 6
                ? "0 8px 20px rgba(74, 108, 247, 0.3)"
                : "none",
            transition: "all 0.3s ease",
          }}
        >
          {isVerifying ? (
            <>
              <Spinner animation="border" size="sm" className="me-2" />
              Verifying...
            </>
          ) : (
            <>
              <FaCheckCircle className="me-2" />
              Verify Email
            </>
          )}
        </Button>

        {/* Resend Section */}
        <div className="text-center" style={{ marginTop: "24px" }}>
          <p
            style={{ color: "#6b7280", fontSize: "14px", marginBottom: "8px" }}
          >
            Didn't receive the code?
          </p>
          <Button
            variant="link"
            onClick={handleResend}
            disabled={!canResend || isResending}
            style={{
              color: canResend ? "#4a6cf7" : "#9ca3af",
              fontWeight: "600",
              fontSize: "15px",
              textDecoration: "none",
              padding: "8px 16px",
              borderRadius: "8px",
              transition: "all 0.2s",
            }}
            onMouseOver={(e) => {
              if (canResend) e.target.style.background = "#f0f4ff";
            }}
            onMouseOut={(e) => {
              e.target.style.background = "transparent";
            }}
          >
            {isResending ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Sending...
              </>
            ) : (
              <>
                <FaRedo className="me-2" />
                Resend Code
              </>
            )}
          </Button>
        </div>

        {/* Divider */}
        <div
          style={{
            height: "1px",
            background: "#e5e7eb",
            margin: "24px 0",
          }}
        />

        {/* Back to Signup */}
        <div className="text-center">
          <Button
            variant="link"
            onClick={() => navigate(`/signup-${userType}`)}
            style={{
              color: "#6b7280",
              fontSize: "14px",
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <FaArrowLeft size={12} />
            Back to Sign Up
          </Button>
        </div>
      </div>
    </div>
  );
};

export default OTPVerification;
