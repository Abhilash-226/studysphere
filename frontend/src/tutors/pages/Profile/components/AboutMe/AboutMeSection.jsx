import React from "react";
import { Card } from "react-bootstrap";
import { FaUserGraduate } from "react-icons/fa";
import EditButton from "../common/EditButton/EditButton";
import "./AboutMeSection.css";

/**
 * AboutMeSection - Section component for displaying tutor bio information
 * @param {Object} props - Component props
 * @param {string} props.bio - Tutor bio text
 * @param {Function} props.onEdit - Function to handle edit actions
 * @returns {React.ReactElement} - Rendered component
 */
const AboutMeSection = ({ bio, onEdit }) => {
  return (
    <Card className="mb-4">
      <Card.Header>
        <div className="card-header-content">
          <div className="title">
            <FaUserGraduate />
            <span>About Me</span>
          </div>
          <EditButton
            section="bio"
            title="Edit bio information"
            onEdit={onEdit}
          />
        </div>
      </Card.Header>
      <Card.Body>
        {bio ? (
          <div className="bio-content">{bio}</div>
        ) : (
          <p className="text-muted">No bio information provided yet.</p>
        )}
      </Card.Body>
    </Card>
  );
};

export default AboutMeSection;
