import React, { useState } from "react";
import { Form, Button, Badge, Row, Col } from "react-bootstrap";
import { FaBook, FaPlus, FaTimes } from "react-icons/fa";
import EditSection from "../common/EditSection";
import "./SubjectsEdit.css";

/**
 * SubjectsEdit - Component for editing subjects
 * @param {Object} props - Component props
 * @param {Array} props.subjects - Current subjects array
 * @param {Function} props.onSave - Function to call when save button is clicked
 * @param {Function} props.onCancel - Function to call when cancel button is clicked
 * @returns {React.ReactElement} - Rendered component
 */
const SubjectsEdit = ({ subjects = [], onSave, onCancel }) => {
  const [subjectsList, setSubjectsList] = useState(subjects);
  const [newSubject, setNewSubject] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddSubject = () => {
    if (!newSubject.trim()) return;

    // Check for duplicates
    if (subjectsList.includes(newSubject.trim())) {
      return;
    }

    setSubjectsList([...subjectsList, newSubject.trim()]);
    setNewSubject("");
  };

  const handleRemoveSubject = (subject) => {
    setSubjectsList(subjectsList.filter((item) => item !== subject));
  };

  const handleSave = async () => {
    setIsSubmitting(true);
    await onSave("subjects", { subjects: subjectsList });
    setIsSubmitting(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddSubject();
    }
  };

  return (
    <EditSection
      title="Edit Subjects"
      icon={<FaBook />}
      onSave={handleSave}
      onCancel={onCancel}
      isSubmitting={isSubmitting}
    >
      <div className="mb-4">
        <h5 className="mb-3">Your Subjects</h5>
        <div className="subjects-container mb-4">
          {subjectsList.length === 0 ? (
            <p className="text-muted">
              No subjects added yet. Add the subjects you can teach below.
            </p>
          ) : (
            <div className="subject-badges">
              {subjectsList.map((subject, index) => (
                <Badge key={index} className="subject-badge" bg="primary">
                  {subject}
                  <Button
                    variant="link"
                    className="remove-subject-btn"
                    onClick={() => handleRemoveSubject(subject)}
                  >
                    <FaTimes size={10} />
                  </Button>
                </Badge>
              ))}
            </div>
          )}
        </div>

        <h5 className="mb-3">Add New Subject</h5>
        <Row>
          <Col md={8}>
            <Form.Group className="mb-3 d-flex">
              <Form.Control
                type="text"
                value={newSubject}
                onChange={(e) => setNewSubject(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="e.g. Mathematics, English Literature, Physics"
              />
              <Button
                variant="outline-primary"
                onClick={handleAddSubject}
                disabled={!newSubject.trim()}
                className="ms-2"
              >
                <FaPlus /> Add
              </Button>
            </Form.Group>
          </Col>
        </Row>
        <Form.Text className="text-muted">
          Enter the subjects you are qualified to teach. Press Enter or click
          Add after each subject.
        </Form.Text>
      </div>
    </EditSection>
  );
};

export default SubjectsEdit;
