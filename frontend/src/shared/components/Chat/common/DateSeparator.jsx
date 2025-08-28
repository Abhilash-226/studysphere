import React from "react";
import PropTypes from "prop-types";
import { formatDate } from "../utils/formatters";
import "./ChatComponents.css";

/**
 * Date separator component for chat messages
 *
 * @component
 * @param {Object} props - Component props
 * @param {string|Date} props.date - Date to display
 */
const DateSeparator = ({ date }) => {
  if (!date) return null;

  return (
    <div className="message-date-separator">
      <span>{formatDate(date)}</span>
    </div>
  );
};

DateSeparator.propTypes = {
  date: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)])
    .isRequired,
};

export default DateSeparator;
