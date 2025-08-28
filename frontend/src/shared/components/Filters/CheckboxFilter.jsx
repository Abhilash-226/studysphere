import React from "react";
import "./CheckboxFilter.css";

/**
 * A reusable checkbox filter component
 *
 * @param {Object} props
 * @param {Array} props.options - Array of options to display as checkboxes
 * @param {Array} props.selectedValues - Array of currently selected values
 * @param {Function} props.onChange - Function called when a checkbox is toggled
 * @param {String} props.name - Name attribute for the checkbox group
 * @param {Boolean} props.showCount - Whether to show counts next to options
 */
const CheckboxFilter = ({
  options = [],
  selectedValues = [],
  onChange,
  name = "filter",
  showCount = true,
}) => {
  const handleChange = (value) => {
    const isSelected = selectedValues.includes(value);
    let newValues;

    if (isSelected) {
      // If already selected, remove it
      newValues = selectedValues.filter((val) => val !== value);
    } else {
      // If not selected, add it
      newValues = [...selectedValues, value];
    }

    onChange(newValues);
  };

  return (
    <div className="checkbox-filter">
      {options.map((option) => (
        <div className="checkbox-option" key={option.value}>
          <label className="checkbox-label">
            <input
              type="checkbox"
              name={name}
              value={option.value}
              checked={selectedValues.includes(option.value)}
              onChange={() => handleChange(option.value)}
            />
            <span className="checkbox-text">{option.label}</span>
            {showCount && option.count !== undefined && (
              <span className="checkbox-count">{option.count}</span>
            )}
          </label>
        </div>
      ))}

      {options.length === 0 && (
        <div className="no-options">No options available</div>
      )}
    </div>
  );
};

export default CheckboxFilter;
