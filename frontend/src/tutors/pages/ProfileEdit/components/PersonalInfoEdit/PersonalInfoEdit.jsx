import React, { useState } from "react";
import { Form, Row, Col, Badge } from "react-bootstrap";
import { FaUser } from "react-icons/fa";
import EditSection from "../common/EditSection";
import "./PersonalInfoEdit.css";

/**
 * PersonalInfoEdit - Component for editing tutor personal information (gender only)
 * @param {Object} props - Component props
 * @param {Object} props.profile - Current profile data
 * @param {Function} props.onSave - Function to call when save button is clicked
 * @param {Function} props.onCancel - Function to call when cancel button is clicked
 * @returns {React.ReactElement} - Rendered component
 */
const PersonalInfoEdit = ({ profile = {}, onSave, onCancel }) => {
  const [personalInfo, setPersonalInfo] = useState({
    gender: profile.gender || "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const genderOptions = ["Male", "Female", "Other", "Prefer not to say"];

  const handleChange = (field, value) => {
    setPersonalInfo((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = async () => {
    setIsSubmitting(true);
    // Call the onSave function with the section name and the updated data
    await onSave("personalInfo", personalInfo);
    setIsSubmitting(false);
  };

  return (
    <EditSection
      title="Edit Personal Information"
      icon={<FaUser />}
      onSave={handleSave}
      onCancel={onCancel}
      isSubmitting={isSubmitting}
    >
      <Row>
        <Col md={6}>
          <Form.Group className="mb-4">
            <Form.Label>
              Gender <Badge bg="secondary">Optional</Badge>
            </Form.Label>
            <Form.Select
              value={personalInfo.gender}
              onChange={(e) => handleChange("gender", e.target.value)}
            >
              <option value="">Select gender</option>
              {genderOptions.map((gender) => (
                <option key={gender} value={gender}>
                  {gender}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>
      </Row>

      <Form.Text className="text-muted">
        Gender information is optional and helps personalize your profile.
      </Form.Text>
    </EditSection>
  );
};

export default PersonalInfoEdit;
