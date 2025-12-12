import React, { useState } from "react";
import { Form, Row, Col, Badge } from "react-bootstrap";
import { FaUserGraduate } from "react-icons/fa";
import EditSection from "../common/EditSection";
import "./AboutMeEdit.css";

/**
 * AboutMeEdit - Component for editing tutor bio and location
 * @param {Object} props - Component props
 * @param {string} props.bio - Current bio value
 * @param {Object} props.location - Current location data
 * @param {Function} props.onSave - Function to call when save button is clicked
 * @param {Function} props.onCancel - Function to call when cancel button is clicked
 * @returns {React.ReactElement} - Rendered component
 */
const AboutMeEdit = ({ bio = "", location = {}, onSave, onCancel }) => {
  const [bioText, setBioText] = useState(bio);
  const [locationData, setLocationData] = useState({
    city: location?.city || "",
    state: location?.state || "",
    country: location?.country || "",
    address: location?.address || "",
    postalCode: location?.postalCode || "",
    timeZone: location?.timeZone || "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleBioChange = (e) => {
    setBioText(e.target.value);
  };

  const handleLocationChange = (field, value) => {
    setLocationData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = async () => {
    setIsSubmitting(true);
    // Call the onSave function with the section name and the updated data
    await onSave("bio", { bio: bioText, location: locationData });
    setIsSubmitting(false);
  };

  return (
    <EditSection
      title="Edit About Me"
      icon={<FaUserGraduate />}
      onSave={handleSave}
      onCancel={onCancel}
      isSubmitting={isSubmitting}
    >
      <Form.Group className="mb-4">
        <Form.Label>About Me</Form.Label>
        <Form.Control
          as="textarea"
          rows={6}
          value={bioText}
          onChange={handleBioChange}
          placeholder="Share information about yourself, your teaching philosophy, and what makes you a great tutor..."
        />
        <Form.Text className="text-muted">
          This information will be visible to students on your profile.
        </Form.Text>
      </Form.Group>

      <h6 className="mb-3 mt-4 text-primary">Location Information</h6>

      <Row>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>City</Form.Label>
            <Form.Control
              type="text"
              value={locationData.city}
              onChange={(e) => handleLocationChange("city", e.target.value)}
              placeholder="Your city"
            />
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>State/Province</Form.Label>
            <Form.Control
              type="text"
              value={locationData.state}
              onChange={(e) => handleLocationChange("state", e.target.value)}
              placeholder="Your state or province"
            />
          </Form.Group>
        </Col>
      </Row>

      <Row>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>Country</Form.Label>
            <Form.Control
              type="text"
              value={locationData.country}
              onChange={(e) => handleLocationChange("country", e.target.value)}
              placeholder="Your country"
            />
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>Postal Code</Form.Label>
            <Form.Control
              type="text"
              value={locationData.postalCode}
              onChange={(e) =>
                handleLocationChange("postalCode", e.target.value)
              }
              placeholder="Your postal/zip code"
            />
          </Form.Group>
        </Col>
      </Row>

      <Row>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>
              Address <Badge bg="secondary">Optional</Badge>
            </Form.Label>
            <Form.Control
              type="text"
              value={locationData.address}
              onChange={(e) => handleLocationChange("address", e.target.value)}
              placeholder="Your street address"
            />
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>
              Time Zone <Badge bg="secondary">Optional</Badge>
            </Form.Label>
            <Form.Control
              type="text"
              value={locationData.timeZone}
              onChange={(e) => handleLocationChange("timeZone", e.target.value)}
              placeholder="e.g., UTC+5:30, EST, PST"
            />
          </Form.Group>
        </Col>
      </Row>

      <Form.Text className="text-muted">
        Location information helps students find tutors in their area and
        understand your time zone for scheduling.
      </Form.Text>
    </EditSection>
  );
};

export default AboutMeEdit;
