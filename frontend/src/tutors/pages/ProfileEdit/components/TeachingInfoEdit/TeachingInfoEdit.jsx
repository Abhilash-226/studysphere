import React, { useState } from "react";
import { Form, Row, Col, InputGroup } from "react-bootstrap";
import { FaChalkboardTeacher } from "react-icons/fa";
import EditSection from "../common/EditSection";
import "./TeachingInfoEdit.css";

/**
 * TeachingInfoEdit - Component for editing teaching information
 * @param {Object} props - Component props
 * @param {Object} props.teachingInfo - Current teaching information
 * @param {Function} props.onSave - Function to call when save button is clicked
 * @param {Function} props.onCancel - Function to call when cancel button is clicked
 * @returns {React.ReactElement} - Rendered component
 */
const TeachingInfoEdit = ({
  teachingInfo = {
    hourlyRate: 0,
    teachingStyle: "",
    experience: "",
  },
  onSave,
  onCancel,
}) => {
  const [formData, setFormData] = useState({
    hourlyRate: teachingInfo.hourlyRate || 0,
    teachingStyle: teachingInfo.teachingStyle || "",
    experience: teachingInfo.experience || "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === "hourlyRate" ? parseFloat(value) || 0 : value,
    });
  };

  const handleSave = async () => {
    setIsSubmitting(true);
    await onSave("teaching", formData);
    setIsSubmitting(false);
  };

  return (
    <EditSection
      title="Edit Teaching Information"
      icon={<FaChalkboardTeacher />}
      onSave={handleSave}
      onCancel={onCancel}
      isSubmitting={isSubmitting}
    >
      <Row>
        <Col md={6}>
          <Form.Group className="mb-4">
            <Form.Label>Hourly Rate ($)</Form.Label>
            <InputGroup>
              <InputGroup.Text>$</InputGroup.Text>
              <Form.Control
                type="number"
                name="hourlyRate"
                min="0"
                step="0.01"
                value={formData.hourlyRate}
                onChange={handleChange}
              />
            </InputGroup>
            <Form.Text className="text-muted">
              Your hourly rate for tutoring sessions
            </Form.Text>
          </Form.Group>
        </Col>
      </Row>

      <Form.Group className="mb-4">
        <Form.Label>Teaching Experience</Form.Label>
        <Form.Control
          as="textarea"
          rows={3}
          name="experience"
          value={formData.experience}
          onChange={handleChange}
          placeholder="Describe your teaching experience..."
        />
      </Form.Group>

      <Form.Group className="mb-4">
        <Form.Label>Teaching Style</Form.Label>
        <Form.Control
          as="textarea"
          rows={3}
          name="teachingStyle"
          value={formData.teachingStyle}
          onChange={handleChange}
          placeholder="Describe your teaching style and approach..."
        />
      </Form.Group>
    </EditSection>
  );
};

export default TeachingInfoEdit;
