import React from "react";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";
import "./FilterGroup.css";

/**
 * A reusable filter group component that renders a titled section with filter options
 *
 * @param {Object} props
 * @param {String} props.title - The title of the filter group
 * @param {React.ReactNode} props.children - The filter controls to render inside the group
 * @param {Boolean} props.collapsible - Whether the filter group can be collapsed
 * @param {Boolean} props.initiallyCollapsed - Whether the filter group should be initially collapsed
 */
const FilterGroup = ({
  title,
  children,
  collapsible = true,
  initiallyCollapsed = true,
}) => {
  const [collapsed, setCollapsed] = React.useState(initiallyCollapsed);

  return (
    <div className="filter-group">
      <div
        className={`filter-group-header ${collapsible ? "collapsible" : ""}`}
        onClick={() => collapsible && setCollapsed(!collapsed)}
      >
        <h3>{title}</h3>
        {collapsible && (
          <span className={`collapse-icon ${collapsed ? "collapsed" : ""}`}>
            {collapsed ? <FaChevronDown /> : <FaChevronUp />}
          </span>
        )}
      </div>
      {!collapsed && <div className="filter-group-content">{children}</div>}
    </div>
  );
};

export default FilterGroup;
