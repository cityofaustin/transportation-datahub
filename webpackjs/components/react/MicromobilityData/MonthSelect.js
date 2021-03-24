import React from "react";

const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const MonthSelect = ({ monthYear, getDaysInMonth, onChangeMonth }) => {

  function getMonthOptions() {
    // Get the range of months starting when we first have today to this current
    // month as an array of objects. Ex: [{1_2019: 'January 2019'}, ...]
    let monthsArray = [];
    const startMonthIndex = 3; // The first month we have data is from April 2018
    const startYear = 2018;
    const today = new Date();
    const endMonthIndex = today.getMonth();
    const endYear = today.getFullYear();
  
    for (var year = startYear; year <= endYear; year++) {
      months.map((month, index) => {
        let isBeforeStartMonth = startMonthIndex > index && startYear === year;
        let isAfterCurrentMonth = index > endMonthIndex && endYear == year;
        if (isBeforeStartMonth || isAfterCurrentMonth) {
          return false;
        }
        let lastDay = getDaysInMonth(`${index + 1}`, `${year}`);
        const monthRange = `'${year}-${index + 1}-1' and '${year}-${index + 1}-${lastDay}T23:59:59.999'`;
        monthsArray.push({ [`${monthRange}`]: `${month} ${year}` });
      });
    }
  
    return monthsArray;
  }

  return (
    <div className="form-group">
    <label htmlFor="js-month-select">Month</label>
    <select
      className="form-control"
      id="js-month-select"
      value={monthYear}
      onChange={onChangeMonth}
    >
      <option>Select a month</option>
      {getMonthOptions(getDaysInMonth).map(month => (
        <option key={Object.keys(month)[0]} value={Object.keys(month)[0]}>
          {Object.values(month)[0]}
        </option>
      )).reverse()}
    </select>
  </div>
  )
};

export default MonthSelect;
