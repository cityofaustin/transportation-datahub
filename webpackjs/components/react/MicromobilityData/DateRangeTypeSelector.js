import React from "react";

const DateRangeTypeSelector = ({ onDateRangeTypeSelect, displayDateRange }) => {

  return (
    <div className="form-group">
      <label htmlFor="js-month-select">Date range</label>
      <select
        className="form-control"
        id="js-date-range-type-select"
        onChange={onDateRangeTypeSelect}
      >
        <option>{displayDateRange}</option>
        <option value="month">By month</option>
        <option value="range">By date or date range</option>
        <option value="all time">All time</option>
      </select>
    </div>
  )
};

export default DateRangeTypeSelector;
