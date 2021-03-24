import React from "react";
import Calendar from "react-calendar/dist/entry.nostyle";

const DateRangeSelect = ({ onChangeRange }) => {

    const minDate = new Date(2018, 3, 1)
    const maxDate = new Date()

    function convertDate(date) {

        const year = date.getYear() + 1900;
        const month = date.getMonth() + 1;
        const day = date.getDate();
        const dateConverted = `${year}-${month}-${day}`
    
        return dateConverted;
    }

    function getDateRange(date) {

        const startDate = date[0];
        const endDate = date[1];
        const startDateConverted = convertDate(startDate);
        const endDateConverted = convertDate(endDate);
        const dateRange = `'${startDateConverted}' and '${endDateConverted}T23:59:59.999'`;
    
        onChangeRange(dateRange, "range");
    }

    return (

        <div className="d-flex justify-content-center select-by-menu">
            <Calendar
                onChange={getDateRange}
                selectRange={true}
                maxDate={maxDate}
                minDate={minDate}
            />
        </div>
    ) 
}

export default DateRangeSelect;