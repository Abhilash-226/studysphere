import React from "react";
import "./AvailabilitySchedule.css";

const DAYS_OF_WEEK = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

// Generate time slots in 30-minute intervals from 9:00 AM to 8:00 PM
const TIME_SLOTS = (() => {
  const slots = [];
  const startHour = 9; // 9 AM
  const endHour = 20; // 8 PM
  
  for (let hour = startHour; hour <= endHour; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      // Skip 8:30 PM since we want to end at 8:00 PM
      if (hour === endHour && minute > 0) break;
      
      const amPm = hour < 12 ? "AM" : "PM";
      const hour12 = hour === 12 ? 12 : hour > 12 ? hour - 12 : hour;
      const timeString = `${hour12.toString().padStart(2, "0")}:${minute
        .toString()
        .padStart(2, "0")} ${amPm}`;
      slots.push(timeString);
    }
  }
  
  return slots;
})();

/**
 * AvailabilitySchedule - Component for setting availability schedule
 * @param {Object} props - Component props
 * @param {Object} props.profileData - Current profile data
 * @param {Function} props.updateProfileData - Function to update profile data
 * @returns {React.ReactElement} - Rendered component
 */
const AvailabilitySchedule = ({ profileData, updateProfileData }) => {
  const handleAddTimeSlot = (day) => {
    const newSlot = {
      day,
      startTime: "09:00 AM",
      endTime: "05:00 PM",
    };

    // Check if the day already exists in availability
    const dayExists = profileData.availability.some((slot) => slot.day === day);

    if (!dayExists) {
      updateProfileData({
        availability: [...profileData.availability, newSlot],
      });
    }
  };

  const handleRemoveTimeSlot = (index) => {
    const newAvailability = [...profileData.availability];
    newAvailability.splice(index, 1);
    updateProfileData({ availability: newAvailability });
  };

  const handleTimeChange = (index, field, value) => {
    const newAvailability = [...profileData.availability];
    newAvailability[index] = {
      ...newAvailability[index],
      [field]: value,
    };
    updateProfileData({ availability: newAvailability });
  };

  const isDayAdded = (day) => {
    return profileData.availability.some((slot) => slot.day === day);
  };

  return (
    <div className="availability-schedule-step">
      <h2>Your Availability</h2>
      <p className="step-description">
        Set your weekly availability schedule. You can update this anytime.
      </p>

      <div className="days-selection">
        <label>Select Days You're Available</label>
        <div className="tag-selection">
          {DAYS_OF_WEEK.map((day) => (
            <div
              key={day}
              className={`tag ${isDayAdded(day) ? "selected" : ""}`}
              onClick={() => {
                if (!isDayAdded(day)) {
                  handleAddTimeSlot(day);
                }
              }}
            >
              {day}
            </div>
          ))}
        </div>
      </div>

      {profileData.availability.length > 0 ? (
        <div className="schedule-container">
          <h3>Your Weekly Schedule</h3>
          {profileData.availability.map((slot, index) => (
            <div className="day-schedule" key={index}>
              <div className="day-header">
                <h4>{slot.day}</h4>
                <button
                  type="button"
                  className="remove-btn"
                  onClick={() => handleRemoveTimeSlot(index)}
                >
                  Remove
                </button>
              </div>
              <div className="time-slots">
                <div className="time-slot">
                  <label>Start Time</label>
                  <select
                    value={slot.startTime}
                    onChange={(e) =>
                      handleTimeChange(index, "startTime", e.target.value)
                    }
                  >
                    {TIME_SLOTS.map((time) => (
                      <option key={time} value={time}>
                        {time}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="time-slot">
                  <label>End Time</label>
                  <select
                    value={slot.endTime}
                    onChange={(e) =>
                      handleTimeChange(index, "endTime", e.target.value)
                    }
                  >
                    {TIME_SLOTS.map((time) => (
                      <option key={time} value={time}>
                        {time}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="no-availability">
          <p>
            No availability set yet. Click on the days above to add your
            schedule.
          </p>
        </div>
      )}

      <div className="availability-tips">
        <h4>Tips for setting availability:</h4>
        <ul>
          <li>Set realistic hours that you can consistently maintain.</li>
          <li>Consider adding some buffer time between sessions.</li>
          <li>
            Remember to account for your timezone - the times you set will be in
            your local time.
          </li>
        </ul>
      </div>
    </div>
  );
};

export default AvailabilitySchedule;
