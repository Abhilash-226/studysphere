import React, { useState, useEffect } from "react";
import "./RangeFilter.css";

/**
 * A reusable range slider filter component
 *
 * @param {Object} props
 * @param {Number} props.min - Minimum value of the range
 * @param {Number} props.max - Maximum value of the range
 * @param {Array} props.value - Current [min, max] values
 * @param {Function} props.onChange - Function called when range is changed
 * @param {String} props.unit - Optional unit to display next to values
 * @param {Number} props.step - Step size for the sliders
 */
const RangeFilter = ({
  min = 0,
  max = 100,
  value = [min, max],
  onChange,
  unit = "",
  step = 1,
}) => {
  const [range, setRange] = useState({ min: value[0], max: value[1] });

  useEffect(() => {
    setRange({ min: value[0], max: value[1] });
  }, [value]);

  const handleChange = (type) => (e) => {
    const newValue = parseInt(e.target.value, 10);

    let newRange;
    if (type === "min") {
      // Ensure min doesn't exceed max
      newRange = { ...range, min: Math.min(newValue, range.max) };
    } else {
      // Ensure max doesn't go below min
      newRange = { ...range, max: Math.max(newValue, range.min) };
    }

    setRange(newRange);
  };

  const handleBlur = () => {
    // Only update parent component when user is done adjusting
    onChange([range.min, range.max]);
  };

  // Calculate slider fill percentages
  const minFillPercent = ((range.min - min) / (max - min)) * 100;
  const maxFillPercent = ((range.max - min) / (max - min)) * 100;

  return (
    <div className="range-filter">
      <div className="range-controls">
        <div className="range-slider-container">
          <div
            className="range-slider-fill"
            style={{
              left: `${minFillPercent}%`,
              right: `${100 - maxFillPercent}%`,
            }}
          ></div>
          <input
            type="range"
            className="range-slider min-slider"
            value={range.min}
            min={min}
            max={max}
            step={step}
            onChange={handleChange("min")}
            onMouseUp={handleBlur}
            onTouchEnd={handleBlur}
          />
          <input
            type="range"
            className="range-slider max-slider"
            value={range.max}
            min={min}
            max={max}
            step={step}
            onChange={handleChange("max")}
            onMouseUp={handleBlur}
            onTouchEnd={handleBlur}
          />
        </div>
      </div>

      <div className="range-values">
        <div className="range-value">
          <span>Min:</span>
          <strong>
            {range.min}
            {unit}
          </strong>
        </div>
        <div className="range-value">
          <span>Max:</span>
          <strong>
            {range.max}
            {unit}
          </strong>
        </div>
      </div>
    </div>
  );
};

export default RangeFilter;
