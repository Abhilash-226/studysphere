import React, { useState, useEffect } from "react";
import { Alert, Button, Spinner } from "react-bootstrap";
import { FaExclamationTriangle, FaEnvelope, FaTimes } from "react-icons/fa";
import { useAuth } from "../../context/AuthContext";
import emailVerificationService from "../../services/emailVerification.service";

/**
 * EmailVerificationBanner - Shows verification reminder to unverified users
 */
const EmailVerificationBanner = ({
  className = "",
  dismissible = true,
  showResendButton = true,
}) => {
  const { user, updateUser } = useAuth();
  const [dismissed, setDismissed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [cooldownTime, setCooldownTime] = useState(0);

  // Check if banner was previously dismissed
  useEffect(() => {
    const wasDismissed =
      localStorage.getItem("emailVerificationBannerDismissed") === "true";
    if (wasDismissed && dismissible) {
      setDismissed(true);
    }
  }, [dismissible]);

  const handleResendEmail = async () => {
    try {
      setLoading(true);
      setMessage("");

      const response = await emailVerificationService.resendVerificationEmail();

      if (response.success) {
        setMessage("✓ Verification email sent successfully! Check your inbox.");

        // Start cooldown timer
        if (response.retryAfter) {
          setCooldownTime(response.retryAfter);
          startCooldownTimer();
        }
      } else {
        setMessage(`⚠️ ${response.message}`);

        if (response.retryAfter) {
          setCooldownTime(response.retryAfter);
          startCooldownTimer();
        }
      }
    } catch (err) {
      console.error("Resend email error:", err);
      setMessage(`❌ ${err.message || "Failed to send verification email"}`);

      if (err.retryAfter) {
        setCooldownTime(err.retryAfter);
        startCooldownTimer();
      }
    } finally {
      setLoading(false);

      // Clear message after 5 seconds
      setTimeout(() => setMessage(""), 5000);
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
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    return `${minutes}m ${seconds % 60}s`;
  };

  const handleDismiss = () => {
    setDismissed(true);
    // Store dismissal in localStorage to persist across page reloads
    localStorage.setItem("emailVerificationBannerDismissed", "true");
  };

  // Don't show banner if user is verified, not logged in, or dismissed
  if (!user || user.isEmailVerified || dismissed) {
    return null;
  }
  return (
    <Alert
      variant="warning"
      className={`email-verification-banner mb-0 ${className}`}
      dismissible={dismissible}
      onClose={dismissible ? handleDismiss : undefined}
    >
      <div className="d-flex align-items-center justify-content-between">
        <div className="d-flex align-items-center">
          <FaExclamationTriangle className="me-2" />
          <div>
            <strong>Email Verification Required</strong>
            <div className="small">
              Please verify your email address ({user.email}) to access all
              features.
            </div>
            {message && (
              <div
                className="small mt-1"
                style={{
                  color: message.includes("✓")
                    ? "#155724"
                    : message.includes("⚠️")
                    ? "#856404"
                    : "#721c24",
                }}
              >
                {message}
              </div>
            )}
          </div>
        </div>

        {showResendButton && (
          <div className="d-flex gap-2 align-items-center">
            <Button
              variant="outline-warning"
              size="sm"
              onClick={handleResendEmail}
              disabled={loading || cooldownTime > 0}
            >
              {loading ? (
                <>
                  <Spinner size="sm" className="me-1" />
                  Sending...
                </>
              ) : cooldownTime > 0 ? (
                `Wait ${formatCooldownTime(cooldownTime)}`
              ) : (
                <>
                  <FaEnvelope className="me-1" />
                  Resend Email
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    </Alert>
  );
};

export default EmailVerificationBanner;
