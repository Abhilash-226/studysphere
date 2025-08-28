import React from "react";
import "./RadioFilter.css";

/**
 * A reusable radio button filter component
 *
 * @param {Object} props
 * @param {Array} props.options - Array of options to display as radio buttons
 * @param {String|Number} props.selectedValue - Currently selected value
 * @param {Function} props.onChange - Function called when a radio is selected
 * @param {String} props.name - Name attribute for the radio group
 */
const RadioFilter = ({
  options = [],
  selectedValue = null,
  onChange,
  name = "radio-filter",
}) => {
  return (
    <div className="radio-filter">
      {options.map((option) => (
        <div className="radio-option" key={option.value}>
          <label className="radio-label">
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={selectedValue === option.value}
              onChange={() => onChange(option.value)}
            />
            <span className="radio-text">{option.label}</span>
          </label>
        </div>
      ))}

      {options.length === 0 && (
        <div className="no-options">No options available</div>
      )}
    </div>
  );
};

export default RadioFilter;
