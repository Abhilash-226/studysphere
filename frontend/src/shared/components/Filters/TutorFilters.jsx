import React from "react";
import FilterGroup from "./FilterGroup";
import CheckboxFilter from "./CheckboxFilter";
import RadioFilter from "./RadioFilter";
import RangeFilter from "./RangeFilter";
import "./TutorFilters.css";

/**
 * A component that combines all filter types for the tutors page
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

      <FilterGroup title="Teaching Mode" initiallyCollapsed={false}>
        <CheckboxFilter
          options={filterOptions.teachingModes || []}
          selectedValues={filters.teachingMode || []}
          onChange={(values) => handleFilterChange("teachingMode", values)}
          name="teachingMode"
          showCount={true}
        />
      </FilterGroup>

      <FilterGroup title="Gender" initiallyCollapsed={false}>
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

      <FilterGroup title="Subjects" initiallyCollapsed={false}>
        <CheckboxFilter
          options={filterOptions.subjects || []}
          selectedValues={filters.subjects || []}
          onChange={(values) => handleFilterChange("subjects", values)}
          name="subjects"
          showCount={true}
        />
      </FilterGroup>

      {Array.isArray(filters.teachingMode) &&
        (filters.teachingMode.includes("offline") ||
          filters.teachingMode.includes("offline_home") ||
          filters.teachingMode.includes("offline_classroom")) && (
          <FilterGroup title="Location" initiallyCollapsed={false}>
            <CheckboxFilter
              options={filterOptions.locations || []}
              selectedValues={filters.locations || []}
              onChange={(values) => handleFilterChange("locations", values)}
              name="locations"
              showCount={true}
            />
          </FilterGroup>
        )}

      <FilterGroup title="Experience (Years)" initiallyCollapsed={false}>
        <RangeFilter
          min={0}
          max={20}
          value={filters.experience || [0, 20]}
          onChange={(value) => handleFilterChange("experience", value)}
          unit=" yrs"
          step={1}
        />
      </FilterGroup>

      <FilterGroup title="Price Range" initiallyCollapsed={false}>
        <RangeFilter
          min={0}
          max={200}
          value={filters.price || [0, 200]}
          onChange={(value) => handleFilterChange("price", value)}
          unit="$"
          step={5}
        />
      </FilterGroup>

      <FilterGroup title="Rating" initiallyCollapsed={false}>
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

      <FilterGroup title="Availability" initiallyCollapsed={false}>
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
