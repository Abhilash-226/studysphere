import React from "react";
import { Card, Button, Alert } from "react-bootstrap";
import { Link } from "react-router-dom";
import {
  FaCheckCircle,
  FaExclamationTriangle,
  FaClock,
  FaFileAlt,
} from "react-icons/fa";
import "./VerificationStatusSection.css";

/**
 * VerificationStatusSection - Section component for displaying tutor verification status
 * @param {Object} props - Component props
 * @param {Object} props.verificationStatus - Verification status data
 * @returns {React.ReactElement} - Rendered component
 */
const VerificationStatusSection = ({ verificationStatus }) => {
  if (!verificationStatus) {
    return null;
  }

  const { status, message, requiredDocuments = [] } = verificationStatus;

  const getStatusIcon = () => {
    switch (status) {
      case "approved":
        return <FaCheckCircle className="text-success" size={24} />;
      case "pending":
        return <FaClock className="text-warning" size={24} />;
      case "rejected":
        return <FaExclamationTriangle className="text-danger" size={24} />;
      default:
        return <FaFileAlt className="text-info" size={24} />;
    }
  };

  const getStatusVariant = () => {
    switch (status) {
      case "approved":
        return "success";
      case "pending":
        return "warning";
      case "rejected":
        return "danger";
      default:
        return "info";
    }
  };

  const getStatusTitle = () => {
    switch (status) {
      case "approved":
        return "Verification Approved";
      case "pending":
        return "Verification Pending";
      case "rejected":
        return "Verification Rejected";
      default:
        return "Not Verified";
    }
  };

  return (
    <Card className="mb-4">
      <Card.Header className="d-flex align-items-center">
        {getStatusIcon()}
        <h5 className="mb-0 ms-2">Verification Status</h5>
      </Card.Header>
      <Card.Body>
        <Alert
          variant={getStatusVariant()}
          className="d-flex align-items-center mb-4"
        >
          <div className="me-3">{getStatusIcon()}</div>
          <div>
            <h6 className="mb-0">{getStatusTitle()}</h6>
            <p className="mb-0">
              {message || "Your verification status has been updated."}
            </p>
          </div>
        </Alert>

        {status !== "approved" && requiredDocuments.length > 0 && (
          <div className="mt-3">
            <h6>Required Documents:</h6>
            <ul className="document-list">
              {requiredDocuments.map((doc, index) => (
                <li key={index} className="mb-2">
                  <span className="me-2">📄</span> {doc}
                </li>
              ))}
            </ul>
          </div>
        )}

        {status !== "approved" && (
          <div className="text-center mt-4">
            <Button as={Link} to="/tutor/documents" variant="primary">
              <FaFileAlt className="me-2" />
              {status === "rejected"
                ? "Resubmit Documents"
                : "Upload Documents"}
            </Button>
          </div>
        )}
      </Card.Body>
    </Card>
  );
};

export default VerificationStatusSection;
