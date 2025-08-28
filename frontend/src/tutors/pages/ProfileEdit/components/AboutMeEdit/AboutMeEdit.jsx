import React, { useState } from "react";
import { Form } from "react-bootstrap";
import { FaUserGraduate } from "react-icons/fa";
import EditSection from "../common/EditSection";
import "./AboutMeEdit.css";

/**
 * AboutMeEdit - Component for editing tutor bio
 * @param {Object} props - Component props
 * @param {string} props.bio - Current bio value
 * @param {Function} props.onSave - Function to call when save button is clicked
 * @param {Function} props.onCancel - Function to call when cancel button is clicked
 * @returns {React.ReactElement} - Rendered component
 */
const AboutMeEdit = ({ bio = "", onSave, onCancel }) => {
  const [bioText, setBioText] = useState(bio);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleBioChange = (e) => {
    setBioText(e.target.value);
  };

  const handleSave = async () => {
    setIsSubmitting(true);
    // Call the onSave function with the section name and the updated data
    await onSave("bio", { bio: bioText });
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
    </EditSection>
  );
};

export default AboutMeEdit;
