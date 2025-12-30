import React from "react";
import {
  FilterGroup,
  CheckboxFilter,
  RadioFilter,
  RangeFilter,
} from "../../../shared/components/Filters";
import "./TutorFilters.css";

/**
 * A specialized filter component for the tutors page
 *
 * @param {Object} props
 * @param {Object} props.filters - Current filter values
 * @param {Function} props.onFilterChange - Function called when any filter changes
 * @param {Object} props.filterOptions - Available options for each filter type
 * @param {Boolean} props.isMobile - Whether filters are being displayed on mobile
 */
const TutorFilters = ({
  filters,
  onFilterChange,
  filterOptions = {},
  isMobile = false,
}) => {
  const handleFilterChange = (filterName, value) => {
    onFilterChange({
      ...filters,
      [filterName]: value,
    });
  };

  return (
    <div className={`tutor-filters ${isMobile ? "mobile" : ""}`}>
      <div className="filter-header">
        <h2>Filter Tutors</h2>
        <button className="clear-filters" onClick={() => onFilterChange({})}>
          Clear All
        </button>
      </div>

      <FilterGroup title="Teaching Mode">
        <CheckboxFilter
          options={filterOptions.teachingModes || []}
          selectedValues={filters.teachingMode || []}
          onChange={(values) => handleFilterChange("teachingMode", values)}
          name="teachingMode"
          showCount={true}
        />
      </FilterGroup>

      <FilterGroup title="Gender">
        <CheckboxFilter
          options={
            filterOptions.genders || [
              { value: "Male", label: "Male", count: 0 },
              { value: "Female", label: "Female", count: 0 },
              { value: "Other", label: "Other", count: 0 },
              {
                value: "Prefer not to say",
                label: "Prefer not to say",
                count: 0,
              },
            ]
          }
          selectedValues={filters.gender || []}
          onChange={(values) => handleFilterChange("gender", values)}
          name="gender"
          showCount={true}
        />
      </FilterGroup>

      <FilterGroup title="Subjects">
        <CheckboxFilter
          options={filterOptions.subjects || []}
          selectedValues={filters.subjects || []}
          onChange={(values) => handleFilterChange("subjects", values)}
          name="subjects"
          showCount={true}
        />
      </FilterGroup>

      {Array.isArray(filters.teachingMode) &&
        filters.teachingMode.includes("offline") && (
          <FilterGroup title="Location">
            <CheckboxFilter
              options={filterOptions.locations || []}
              selectedValues={filters.locations || []}
              onChange={(values) => handleFilterChange("locations", values)}
              name="locations"
              showCount={true}
            />
          </FilterGroup>
        )}

      <FilterGroup title="Experience (Years)">
        <RangeFilter
          min={0}
          max={20}
          value={filters.experience || [0, 20]}
          onChange={(value) => handleFilterChange("experience", value)}
          unit=" yrs"
          step={1}
        />
      </FilterGroup>

      <FilterGroup title="Price Range (per hour)">
        <RangeFilter
          min={0}
          max={5000}
          value={filters.price || [0, 5000]}
          onChange={(value) => handleFilterChange("price", value)}
          unit="₹"
          step={100}
        />
      </FilterGroup>

      <FilterGroup title="Rating">
        <CheckboxFilter
          options={[
            {
              value: "4",
              label: "4+ Stars",
              count: filterOptions.ratingCounts?.["4"] || 0,
            },
            {
              value: "3",
              label: "3+ Stars",
              count: filterOptions.ratingCounts?.["3"] || 0,
            },
            {
              value: "2",
              label: "2+ Stars",
              count: filterOptions.ratingCounts?.["2"] || 0,
            },
          ]}
          selectedValues={filters.rating || []}
          onChange={(values) => handleFilterChange("rating", values)}
          name="rating"
          showCount={true}
        />
      </FilterGroup>

      <FilterGroup title="Availability">
        <CheckboxFilter
          options={filterOptions.availability || []}
          selectedValues={filters.availability || []}
          onChange={(values) => handleFilterChange("availability", values)}
          name="availability"
          showCount={false}
        />
      </FilterGroup>
    </div>
  );
};

export default TutorFilters;
