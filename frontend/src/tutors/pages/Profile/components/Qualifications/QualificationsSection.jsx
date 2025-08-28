import React from "react";
import { Card } from "react-bootstrap";
import { FaUserGraduate } from "react-icons/fa";
import EditButton from "../common/EditButton/EditButton";
import "./QualificationsSection.css";

/**
 * QualificationsSection - Section component for displaying tutor qualifications
 * @param {Object} props - Component props
 * @param {Object} props.qualifications - Tutor qualifications data
 * @param {string} props.qualifications.degree - Academic degree
 * @param {string} props.qualifications.institution - Institution name
 * @param {string} props.qualifications.field - Field of study
 * @param {string} props.qualifications.graduationYear - Year of graduation
 * @param {Function} props.onEdit - Function to handle edit actions
 * @returns {React.ReactElement} - Rendered component
 */
const QualificationsSection = ({ qualifications = {}, onEdit }) => {
  const {
    degree = "Not specified",
    institution = "Not specified",
    field = "Not specified",
    graduationYear = "Not specified",
  } = qualifications;

  return (
    <Card className="mb-4 h-100">
      <Card.Header>
        <div className="card-header-content">
          <div className="title">
            <FaUserGraduate />
            <span>Qualifications</span>
          </div>
          <EditButton
            section="qualifications"
            title="Edit qualifications"
            onEdit={onEdit}
          />
        </div>
      </Card.Header>
      <Card.Body>
        <table className="info-table">
          <tbody>
            <tr>
              <td>Degree</td>
              <td>{degree}</td>
            </tr>
            <tr>
              <td>Institution</td>
              <td>{institution}</td>
            </tr>
            <tr>
              <td>Field of Study</td>
              <td>{field}</td>
            </tr>
            <tr>
              <td>Graduation Year</td>
              <td>{graduationYear}</td>
            </tr>
          </tbody>
        </table>
      </Card.Body>
    </Card>
  );
};

export default QualificationsSection;
