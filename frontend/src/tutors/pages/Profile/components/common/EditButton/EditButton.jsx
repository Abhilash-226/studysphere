import React from "react";
import { FaPencilAlt } from "react-icons/fa";
import "./EditButton.css";

/**
 * EditButton - Reusable edit button component with a pencil icon
 * @param {Object} props - Component props
 * @param {string} props.section - Section identifier for the edit action
 * @param {string} props.title - Tooltip text for the button
 * @param {Function} props.onEdit - Function to call when button is clicked
 * @returns {React.ReactElement} - Rendered component
 */
const EditButton = ({ section, title, onEdit }) => {
  const handleClick = () => {
    if (onEdit) {
      onEdit(section);
    }
  };

  return (
    <button
      className="card-edit-button"
      onClick={handleClick}
      title={title || `Edit ${section}`}
      aria-label={title || `Edit ${section}`}
    >
      <div className="edit-button-content">
        <FaPencilAlt size={16} />
      </div>
    </button>
  );
};

export default EditButton;
