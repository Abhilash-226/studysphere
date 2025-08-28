import React from "react";
import { Card } from "react-bootstrap";
import { FaChalkboardTeacher, FaMoneyBillWave } from "react-icons/fa";
import EditButton from "../common/EditButton/EditButton";
import "./TeachingInfoSection.css";

/**
 * TeachingInfoSection - Section component for displaying tutor teaching information
 * @param {Object} props - Component props
 * @param {number} props.hourlyRate - Tutor's hourly rate
 * @param {Array<string>} props.teachingMode - List of teaching modes (online, in-person, etc.)
 * @param {Function} props.onEdit - Function to handle edit actions
 * @returns {React.ReactElement} - Rendered component
 */
const TeachingInfoSection = ({ hourlyRate = 0, teachingMode = [], onEdit }) => {
  return (
    <Card className="mt-4">
      <Card.Header>
        <div className="card-header-content">
          <div className="title">
            <FaChalkboardTeacher />
            <span>Teaching Information</span>
          </div>
          <EditButton
            section="teaching"
            title="Edit teaching information"
            onEdit={onEdit}
          />
        </div>
      </Card.Header>
      <Card.Body>
        <div className="d-flex align-items-center mb-3">
          <div className="stat-icon me-3">
            <FaMoneyBillWave size={24} className="text-success" />
          </div>
          <div>
            <div className="text-muted small">Hourly Rate</div>
            <div className="fw-bold fs-5">${hourlyRate}</div>
          </div>
        </div>

        <div className="d-flex align-items-center">
          <div className="stat-icon me-3">
            <FaChalkboardTeacher size={24} className="text-primary" />
          </div>
          <div>
            <div className="text-muted small">Teaching Mode</div>
            <div className="teaching-modes">
              {teachingMode?.map((mode, index) => (
                <span key={index} className="teaching-mode-badge">
                  {mode}
                </span>
              ))}
            </div>
          </div>
        </div>
      </Card.Body>
    </Card>
  );
};

export default TeachingInfoSection;
