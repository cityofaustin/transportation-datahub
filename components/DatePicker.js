import React, { useRef, useEffect, useState } from "react";
import DatePicker from "react-date-picker/dist/entry.nostyle";
import "react-date-picker/dist/DatePicker.css";
import "react-calendar/dist/Calendar.css";

// this exists because we need to import the datepicker styles in the nextjs way
export default function CustomDatePicker({onChange, value, ...props}) {
  return (
      <DatePicker onChange={onChange} value={value} {...props} />
  );
}
