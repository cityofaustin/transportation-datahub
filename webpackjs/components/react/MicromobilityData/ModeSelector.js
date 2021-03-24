import React from "react";

const ModeSelector = ({ mode, onModeSelect }) => (
  <div className="form-group">
    <label htmlFor="js-month-select">Device type</label>
    <select
      className="form-control"
      id="js-mode-select"
      value={mode}
      onChange={onModeSelect}
    >
      <option value="all devices">All devices</option>
      <option value="scooters">Scooters</option>
      <option value="bicycles">Bicycles</option>
    </select>
  </div>
);

export default ModeSelector;
