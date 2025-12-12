import React from "react";
import { Card } from "react-bootstrap";
import { FaUserGraduate } from "react-icons/fa";
import EditButton from "../common/EditButton/EditButton";
import "./AboutMeSection.css";

/**
 * AboutMeSection - Section component for displaying tutor bio and location information
 * @param {Object} props - Component props
 * @param {string} props.bio - Tutor bio text
 * @param {Object} props.location - Location information
 * @param {string} props.location.city - City
 * @param {string} props.location.state - State/Province
 * @param {string} props.location.country - Country
 * @param {string} props.location.address - Street address
 * @param {Function} props.onEdit - Function to handle edit actions
 * @returns {React.ReactElement} - Rendered component
 */
const AboutMeSection = ({ bio, location, onEdit }) => {
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
            title="Edit bio and location information"
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

        {/* Location Information */}
        {(location?.city ||
          location?.state ||
          location?.country ||
          location?.address) && (
          <div className="location-info mt-3 pt-3 border-top">
            <h6 className="text-primary mb-2">
              <i className="fas fa-map-marker-alt me-2"></i>
              Location
            </h6>
            <div className="location-details">
              {location?.address && (
                <p className="mb-1 text-muted small">
                  <strong>Address:</strong> {location.address}
                </p>
              )}
              {(location?.city || location?.state || location?.country) && (
                <p className="mb-1 text-muted small">
                  <strong>Location:</strong>{" "}
                  {[location?.city, location?.state, location?.country]
                    .filter(Boolean)
                    .join(", ")}
                </p>
              )}
              {location?.postalCode && (
                <p className="mb-1 text-muted small">
                  <strong>Postal Code:</strong> {location.postalCode}
                </p>
              )}
              {location?.timeZone && (
                <p className="mb-0 text-muted small">
                  <strong>Time Zone:</strong> {location.timeZone}
                </p>
              )}
            </div>
          </div>
        )}
      </Card.Body>
    </Card>
  );
};

export default AboutMeSection;
