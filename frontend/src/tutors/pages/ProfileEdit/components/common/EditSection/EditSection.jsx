import React from "react";
import { Card, Button } from "react-bootstrap";
import "./EditSection.css";

/**
 * EditSection - Base component for profile edit sections
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Form elements to render
 * @param {string} props.title - Section title
 * @param {string} props.icon - Optional icon component
 * @param {Function} props.onSave - Function to call when save button is clicked
 * @param {Function} props.onCancel - Function to call when cancel button is clicked
 * @param {boolean} props.isSubmitting - Whether a submission is in progress
 * @returns {React.ReactElement} - Rendered component
 */
const EditSection = ({
  children,
  title,
  icon,
  onSave,
  onCancel,
  isSubmitting = false,
}) => {
  return (
    <Card className="edit-form-card">
      <Card.Header>
        <div className="d-flex align-items-center">
          {icon && <div className="me-2">{icon}</div>}
          <h3 className="mb-0">{title}</h3>
        </div>
      </Card.Header>
      <Card.Body>
        {children}

        <div className="form-actions">
          <Button
            variant="outline-secondary"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button variant="primary" onClick={onSave} disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </Card.Body>
    </Card>
  );
};

export default EditSection;
