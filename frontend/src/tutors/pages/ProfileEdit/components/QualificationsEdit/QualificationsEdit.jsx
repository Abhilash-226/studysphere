import React, { useState } from "react";
import { Form, Button, ListGroup, Row, Col } from "react-bootstrap";
import { FaGraduationCap, FaPlus, FaTrash } from "react-icons/fa";
import EditSection from "../common/EditSection";
import "./QualificationsEdit.css";

/**
 * QualificationsEdit - Component for editing qualifications
 * @param {Object} props - Component props
 * @param {Array} props.qualifications - Current qualifications array
 * @param {Function} props.onSave - Function to call when save button is clicked
 * @param {Function} props.onCancel - Function to call when cancel button is clicked
 * @returns {React.ReactElement} - Rendered component
 */
const QualificationsEdit = ({ qualifications = [], onSave, onCancel }) => {
  const [qualificationsList, setQualificationsList] = useState(qualifications);
  const [newQualification, setNewQualification] = useState({
    degree: "",
    institution: "",
    year: "",
    description: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddQualification = () => {
    // Validate required fields
    if (!newQualification.degree || !newQualification.institution) return;

    setQualificationsList([
      ...qualificationsList,
      { ...newQualification, id: Date.now() },
    ]);
    setNewQualification({
      degree: "",
      institution: "",
      year: "",
      description: "",
    });
  };

  const handleRemoveQualification = (index) => {
    const updatedQualifications = [...qualificationsList];
    updatedQualifications.splice(index, 1);
    setQualificationsList(updatedQualifications);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewQualification({
      ...newQualification,
      [name]: value,
    });
  };

  const handleSave = async () => {
    setIsSubmitting(true);
    await onSave("qualifications", { qualifications: qualificationsList });
    setIsSubmitting(false);
  };

  return (
    <EditSection
      title="Edit Qualifications"
      icon={<FaGraduationCap />}
      onSave={handleSave}
      onCancel={onCancel}
      isSubmitting={isSubmitting}
    >
      <div className="mb-4">
        <h5 className="mb-3">Your Qualifications</h5>
        {qualificationsList.length === 0 ? (
          <p className="text-muted">No qualifications added yet.</p>
        ) : (
          <ListGroup variant="flush" className="qualification-list mb-4">
            {qualificationsList.map((qualification, index) => (
              <ListGroup.Item
                key={qualification.id || index}
                className="d-flex justify-content-between align-items-start"
              >
                <div>
                  <div className="fw-bold">{qualification.degree}</div>
                  <div>{qualification.institution}</div>
                  {qualification.year && (
                    <div className="text-muted small">{qualification.year}</div>
                  )}
                  {qualification.description && (
                    <div className="qualification-description">
                      {qualification.description}
                    </div>
                  )}
                </div>
                <Button
                  variant="outline-danger"
                  size="sm"
                  onClick={() => handleRemoveQualification(index)}
                >
                  <FaTrash /> Remove
                </Button>
              </ListGroup.Item>
            ))}
          </ListGroup>
        )}

        <h5 className="mb-3">Add New Qualification</h5>
        <Row>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Degree/Certificate</Form.Label>
              <Form.Control
                type="text"
                name="degree"
                value={newQualification.degree}
                onChange={handleChange}
                placeholder="e.g. Bachelor of Science, Teaching Certificate"
                required
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Institution</Form.Label>
              <Form.Control
                type="text"
                name="institution"
                value={newQualification.institution}
                onChange={handleChange}
                placeholder="e.g. University of California, Berkeley"
                required
              />
            </Form.Group>
          </Col>
        </Row>

        <Row>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Year (Optional)</Form.Label>
              <Form.Control
                type="text"
                name="year"
                value={newQualification.year}
                onChange={handleChange}
                placeholder="e.g. 2020"
              />
            </Form.Group>
          </Col>
        </Row>

        <Form.Group className="mb-3">
          <Form.Label>Description (Optional)</Form.Label>
          <Form.Control
            as="textarea"
            rows={3}
            name="description"
            value={newQualification.description}
            onChange={handleChange}
            placeholder="Add additional details about your qualification..."
          />
        </Form.Group>

        <div className="d-grid gap-2 d-md-flex justify-content-md-start">
          <Button
            variant="outline-primary"
            onClick={handleAddQualification}
            disabled={!newQualification.degree || !newQualification.institution}
          >
            <FaPlus className="me-2" /> Add Qualification
          </Button>
        </div>
      </div>
    </EditSection>
  );
};

export default QualificationsEdit;
