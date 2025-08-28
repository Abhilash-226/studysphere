import React from "react";
import { Card, Badge } from "react-bootstrap";
import { FaBook } from "react-icons/fa";
import EditButton from "../common/EditButton/EditButton";
import "./SubjectsSection.css";

/**
 * SubjectsSection - Section component for displaying tutor subjects
 * @param {Object} props - Component props
 * @param {Array<string>} props.subjects - List of subjects the tutor teaches
 * @param {Function} props.onEdit - Function to handle edit actions
 * @returns {React.ReactElement} - Rendered component
 */
const SubjectsSection = ({ subjects = [], onEdit }) => {
  return (
    <Card className="mb-4 h-100">
      <Card.Header>
        <div className="card-header-content">
          <div className="title">
            <FaBook />
            <span>Subjects</span>
          </div>
          <EditButton
            section="subjects"
            title="Edit subjects"
            onEdit={onEdit}
          />
        </div>
      </Card.Header>
      <Card.Body>
        {subjects && subjects.length > 0 ? (
          <div className="subject-tags">
            {subjects.map((subject, index) => (
              <Badge key={index} bg="primary" className="subject-badge">
                {subject}
              </Badge>
            ))}
          </div>
        ) : (
          <p className="text-muted mb-0">No subjects specified</p>
        )}
      </Card.Body>
    </Card>
  );
};

export default SubjectsSection;
