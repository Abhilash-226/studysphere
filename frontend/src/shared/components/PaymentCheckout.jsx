import React, { useState, useEffect } from "react";
import { Card, Button, Badge, Spinner, Alert } from "react-bootstrap";
import {
  FaCreditCard,
  FaCheckCircle,
  FaShieldAlt,
  FaRupeeSign,
} from "react-icons/fa";
import paymentService from "../services/payment.service";

/**
 * PaymentCheckout Component
 * Handles payment display and processing
 *
 * In development mode: Shows payment UI but auto-succeeds
 * In test/live mode: Opens Razorpay checkout
 */
const PaymentCheckout = ({
  sessionId,
  amount,
  description,
  userInfo,
  onSuccess,
  onError,
  onCancel,
}) => {
  const [paymentMode, setPaymentMode] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPaymentMode();
  }, []);

  const fetchPaymentMode = async () => {
    try {
      const result = await paymentService.getPaymentMode();
      setPaymentMode(result);
    } catch (err) {
      setError("Failed to load payment information");
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    setProcessing(true);
    setError(null);

    try {
      const result = await paymentService.processPayment(sessionId, userInfo);

      if (result.success) {
        onSuccess(result);
      } else {
        throw new Error(result.message || "Payment failed");
      }
    } catch (err) {
      setError(err.message || "Payment failed. Please try again.");
      if (onError) {
        onError(err);
      }
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <Card className="payment-checkout-card">
        <Card.Body className="text-center py-4">
          <Spinner animation="border" variant="primary" />
          <p className="mt-2 mb-0">Loading payment information...</p>
        </Card.Body>
      </Card>
    );
  }

  return (
    <Card className="payment-checkout-card">
      <Card.Header className="bg-primary text-white">
        <h5 className="mb-0">
          <FaCreditCard className="me-2" />
          Payment
        </h5>
      </Card.Header>
      <Card.Body>
        {error && (
          <Alert variant="danger" dismissible onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Development Mode Banner */}
        {paymentMode?.isDevelopment && (
          <Alert variant="info" className="mb-3">
            <FaShieldAlt className="me-2" />
            <strong>Development Mode:</strong> Payment will be simulated. No
            real charges.
          </Alert>
        )}

        {/* Amount Display */}
        <div className="payment-amount text-center py-3 mb-3 bg-light rounded">
          <small className="text-muted d-block">Amount to Pay</small>
          <h2 className="mb-0 text-primary">
            <FaRupeeSign className="me-1" />
            {paymentService.formatAmount(amount, "INR").replace("₹", "")}
          </h2>
        </div>

        {/* Description */}
        {description && (
          <p className="text-muted text-center mb-3">{description}</p>
        )}

        {/* Payment Info */}
        <div className="payment-info mb-3">
          <div className="d-flex justify-content-between mb-2">
            <span className="text-muted">Payment Mode:</span>
            <Badge
              bg={
                paymentMode?.isDevelopment
                  ? "info"
                  : paymentMode?.isTest
                  ? "warning"
                  : "success"
              }
            >
              {paymentMode?.mode?.toUpperCase() || "LOADING"}
            </Badge>
          </div>
          <div className="d-flex justify-content-between mb-2">
            <span className="text-muted">Payment Status:</span>
            <Badge bg="secondary">Pending</Badge>
          </div>
        </div>

        {/* Secure Payment Notice */}
        <div className="secure-notice d-flex align-items-center justify-content-center text-muted mb-3">
          <FaShieldAlt className="me-2 text-success" />
          <small>Your payment is secure and encrypted</small>
        </div>

        {/* Action Buttons */}
        <div className="d-grid gap-2">
          <Button
            variant="success"
            size="lg"
            onClick={handlePayment}
            disabled={processing}
          >
            {processing ? (
              <>
                <Spinner size="sm" animation="border" className="me-2" />
                Processing...
              </>
            ) : (
              <>
                <FaCheckCircle className="me-2" />
                {paymentMode?.isDevelopment
                  ? "Confirm Booking (Dev Mode)"
                  : `Pay ₹${amount}`}
              </>
            )}
          </Button>

          {onCancel && (
            <Button variant="outline-secondary" onClick={onCancel}>
              Cancel
            </Button>
          )}
        </div>

        {/* Payment Methods (for non-dev mode) */}
        {!paymentMode?.isDevelopment && (
          <div className="payment-methods mt-3 text-center">
            <small className="text-muted">Accepted payment methods:</small>
            <div className="mt-2">
              <Badge bg="light" text="dark" className="me-2">
                UPI
              </Badge>
              <Badge bg="light" text="dark" className="me-2">
                Cards
              </Badge>
              <Badge bg="light" text="dark" className="me-2">
                Net Banking
              </Badge>
              <Badge bg="light" text="dark">
                Wallets
              </Badge>
            </div>
          </div>
        )}
      </Card.Body>
    </Card>
  );
};

export default PaymentCheckout;
