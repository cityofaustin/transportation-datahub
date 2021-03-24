import React, { Component } from "react";
import axios from "axios";
import _ from "lodash";

import MonthSelect from "./MonthSelect";
import DateRangeSelect from "./DateRangeSelect";
import DateRangeTypeSelector from "./DateRangeTypeSelector";
import ModeSelector from "./ModeSelector";
import CardContainer from "./CardContainer";
import Card from "./Card";
import Description from "./Description";

import "./react-calendar.css";

class MicromobilityData extends Component {
  constructor(props) {
    super(props);
    const date = new Date();
    const thisMonth = date.getMonth() + 1;
    const defaultYear = date.getFullYear();
    const lastDay = this.getDaysInMonth(`${thisMonth}`, `${defaultYear}`);
    const monthYear = `'${defaultYear}-${thisMonth}-1' and '${defaultYear}-${thisMonth}-${lastDay}T23:59:59.999'`;

    this.state = {
      dataIsLoaded: false,
      viewDataBy: null,
      viewMode: "all devices",
      monthYear: monthYear,
      displayDateRange: null,
      scooterData: null,
      bicycleData: null,
      allModesData: null,
      deviceCountData: null,
      threeOneOneData: null,
    };

    this.handleQueryChange = this.handleQueryChange.bind(this);
    this.dataViewSelect = this.dataViewSelect.bind(this);
    this.modeSelect = this.modeSelect.bind(this);
  }

  getDaysInMonth(month, year) {
    // Gets the total number of days in a given month to build the default query in state (current month)
    // and subsequent "month" queries
    return new Date(year, month, 0).getDate();
  }

  componentDidMount() {
    // Run the default query in state (current month) once the app has loaded
    this.runQueries(this.state.monthYear, "current");
  }

  runQueries(dateQuery, displayDateRangeType) {
    // Queries the SODA API with the current date range query and stores data in state.
    // "dateRangeType" tells UI how to display date range to user ("current," "month," "range" or "all time")
    const resourceId = `7d8e-dm7r`;
    const resourceId311 = `5h38-fd8d`;
    const tripSelectors = `avg(trip_duration)/60 as avg_duration_minutes, sum(trip_distance) * 0.000621371 as total_miles, avg(trip_distance) * 0.000621371 as avg_miles, count(trip_id) as total_trips`;
    const tripFilters =  `trip_distance * 0.000621371 >= 0.1 AND trip_distance * 0.000621371 < 500 AND trip_duration < 86400`;

    const dataByModeQuery = `SELECT vehicle_type, ${tripSelectors} WHERE start_time between ${dateQuery} AND ${tripFilters} GROUP BY vehicle_type`;
    const allModesQuery = `SELECT ${tripSelectors} WHERE start_time between ${dateQuery} AND ${tripFilters}`;
    const deviceCountScooterQuery = `SELECT DISTINCT device_id WHERE start_time between ${dateQuery} AND vehicle_type = 'scooter' LIMIT 1000000000`;
    const deviceCountBicycleQuery = `SELECT DISTINCT device_id WHERE start_time between ${dateQuery} AND vehicle_type = 'bicycle' LIMIT 1000000000`;
    const threeOneOneQuery = `SELECT count(sr_type_code) as count WHERE sr_created_date between ${dateQuery} AND sr_type_code == "DOCKMOBI"`;

    const dataByModeUrl = `https://data.austintexas.gov/resource/${resourceId}.json?$query=${dataByModeQuery}`;
    const allModesUrl = `https://data.austintexas.gov/resource/${resourceId}.json?$query=${allModesQuery}`;
    const deviceCountScooterUrl = `https://data.austintexas.gov/resource/${resourceId}.json?$query=${deviceCountScooterQuery}`;
    const deviceCountBicycleUrl = `https://data.austintexas.gov/resource/${resourceId}.json?$query=${deviceCountBicycleQuery}`;
    const threeOneOneUrl = `https://data.austintexas.gov/resource/${resourceId311}.json?$query=${threeOneOneQuery}`;

    axios
      .all([
        axios.get(dataByModeUrl),
        axios.get(allModesUrl),
        axios.get(deviceCountScooterUrl),
        axios.get(deviceCountBicycleUrl),
        axios.get(threeOneOneUrl)
      ])
      .then(res => {
        const dataByModeResponse = res[0].data;
        const allDataResponse = res[1].data;
        const deviceScooterDataResponse = res[2].data;
        const deviceBicycleDataResponse = res[3].data;
        const threeOneOneResponse = res[4].data;

        let bicycleData = _.filter(
          dataByModeResponse,
          o => o.vehicle_type === "bicycle"
        )[0];
        let scooterData = _.filter(
          dataByModeResponse,
          o => o.vehicle_type === "scooter"
        )[0];
        let allModesData = allDataResponse[0];
        let threeOneOneData = threeOneOneResponse[0];
        let deviceCountData = {
          scooter: deviceScooterDataResponse.length,
          bicycle: deviceBicycleDataResponse.length
        };

        this.setState({
          bicycleData,
          scooterData,
          allModesData,
          deviceCountData,
          threeOneOneData,
          dataIsLoaded: true,
          viewMode: "all devices",
        });
      });
    this.convertDate(dateQuery, displayDateRangeType);
  }

  getDeviceValue(mode) {
    // Pull device count values from state to display to user
    const { deviceCountData } = this.state;

    // return 0 when the API hasn't responded yet but the HTML needs to render
    if (!deviceCountData || this.state.dataIsLoaded === false) {
      return 0;
    }

    const scooterData = deviceCountData.scooter;
    const bicycleData = deviceCountData.bicycle;

    if (mode === "all") {
      return (scooterData || 0) + (bicycleData || 0);
    } else {
      return deviceCountData[mode]
    }
  }

  getValue(data, metric) {
    // Pull all other values from state to display to user
    const leData = `${data}`;

    // return 0 when the API hasn't responded yet but the HTML needs to render
    if (!this.state[leData] || this.state.dataIsLoaded === false) {
      return 0;
    }

    return Number(this.state[leData][metric]);
  }

  formatDate(dateNumbers) {
    // Helper function for the convertDate UI function - formats date and converts it to string for display
    const dateSplit = dateNumbers.split("-");
    let year = dateSplit[0];
    let month = dateSplit[1];
    let day = dateSplit[2];
    if (month < 10 && day < 10) {
      month = "0" + month;
      day = "0" + day
    } else if (month < 10 && day > 9) {
      month = "0" + month
    } else if (month > 9 && day < 10) {
      day = "0" + day      
    } else {}
    return new Date(year, month - 1, day, 0, 0, 0).toDateString();
  }

  convertDate(dateQuery, displayDateRangeType) {
    // UI function - extracts date from date query and displays it to user in appropriate way
    // based on whether displayDateRangeType is default "current month" query or whether
    // user queried specific month, date range, or all time data
    const date = new Date();
    const splitDate = dateQuery.split(" and ");
    // Convert start date to a string
    const startDateRaw = splitDate[0];
    const startDateCloseQuoteIndex = startDateRaw.lastIndexOf("'");
    const startDateNumbers = startDateRaw.slice(1, startDateCloseQuoteIndex);
    const startDateString = this.formatDate(startDateNumbers);
    // Convert end date to a string
    const endDateRaw = splitDate[1];
    const endDateTIndex = endDateRaw.indexOf("T");
    const endDateNumbers = endDateRaw.slice(1, endDateTIndex);
    const endDateString = this.formatDate(endDateNumbers);
    // Get month names and name of last month in query to display for "month" and "all time"
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const endMonth = endDateNumbers.split("-")[1] - 1;
    const endYear = endDateNumbers.split("-")[0];
    // Set date range to be displayed to user based on displayDateRangeType
    let displayDateRange;
    if (displayDateRangeType === "current") {
      // Display current month by default
      displayDateRange = `${months[date.getMonth()]} ${date.getFullYear()}`
    } else if (displayDateRangeType === "all time") {
      // If "all time" selected, show April 2018 through current month
      displayDateRange = `April 2018 through ${months[endMonth]} ${endYear} (All time)`
    } else if (displayDateRangeType === "range" && startDateString === endDateString) {
      // If start date and end date are the same, display only the start date
      displayDateRange = startDateString;
    } else if (displayDateRangeType === "range") {
      // If range between two different dates, display both dates
      displayDateRange = `${startDateString} to ${endDateString}`
    } else  {
      // If no displayDateRangeType argument, dafult to "month"
      displayDateRange = `${months[endMonth]} ${endYear}`
    }

    this.setState({
      displayDateRange: displayDateRange
    });
  }

  dataViewSelect(event) {
    // Parse and handle user selecting new way to view data from DateRangeTypeSelector
    // (month, date/date range, all time) and set state "viewDataBy" value so that UI will
    // render selected option (if month or date/date range) or run allTimeSelect function
    const viewDataBy = event.target.value;
    this.setState({
      viewDataBy: viewDataBy,
    })
    if (viewDataBy === "all time") {
      this.allTimeSelect();
    }
  }

  handleQueryChange(event, displayDateRangeType) {
    // Handle user selecting new query by parsing query and type of date range to display
    let dateQuery;
    // DateRangeSelect component sends query as simple value, other components send as event
    if (event.target) {
      dateQuery = event.target.value;
    } else {
      dateQuery = event;
    }
    // Set data is loaded to false to render loading screen
    // Set viewDataBy to null to clear month or date range selector
    this.setState({
      dataIsLoaded: false,
      viewDataBy: null,
    });
    this.runQueries(dateQuery, displayDateRangeType);
  }

  allTimeSelect() {
    // Run handleQueryChange if user selects "all time"
    const today = new Date();
    const endMonthIndex = today.getMonth();
    const endYear = today.getFullYear();
    const lastDay = this.getDaysInMonth(`${endMonthIndex + 1}`, `${endYear}`);
    const allTimeRange = `'2018-4-1' and '${endYear}-${endMonthIndex + 1}-${lastDay}T23:59:59.999'`
    this.handleQueryChange(allTimeRange, "all time");
  }

  modeSelect(event) {
    // Render mode cards based on type of mode user has selected
    const viewMode = event.target.value
    this.setState({
      viewMode: viewMode
    })
  }

  render() {
    return (
      <div className="container-fluid">

        {this.state.dataIsLoaded ? (
          <DateRangeTypeSelector
            onDateRangeTypeSelect={this.dataViewSelect}
            dateRangeChosen={this.state.viewDataBy}
            displayDateRange={this.state.displayDateRange}
          />
        ) : (
          <div></div>
        )}

        {this.state.dataIsLoaded && this.state.viewDataBy === "month" ? (
          <MonthSelect
            getDaysInMonth={this.getDaysInMonth}
            onChangeMonth={this.handleQueryChange}
          />
        ) : (
          <div>
          </div>
        )}

        {this.state.dataIsLoaded && this.state.viewDataBy === "range" ? (
          <DateRangeSelect
            onChangeRange={this.handleQueryChange}
          />
        ) : (
          <div>
          </div>
        )}

        {this.state.dataIsLoaded ? (
          <ModeSelector
            mode={this.state.viewMode}
            onModeSelect={this.modeSelect}
          />
        ) : (
          <div>
            <i className="fa fa-spinner fa-pulse fa-3x fa-fw mt-2 mb-4" />
            <span className="sr-only">Loading...</span>
          </div>
        )}

        {this.state.viewMode === "all devices" ? (
          <div>
            <CardContainer>
              <Card
                title="Total Trips"
                value={this.getValue(
                  "allModesData",
                  "total_trips"
                )}
                icon="mobile"
                resourceId={"7d8e-dm7r"}
                updateEvent="micromobility_trips"
                numberFormat="thousands"
              />
              <Card
                title="Total Miles"
                value={this.getValue(
                  "allModesData",
                  "total_miles"
                )}
                icon="tachometer"
                resourceId={"7d8e-dm7r"}
                updateEvent="micromobility_trips"
                numberFormat="thousands"
              />
              <Card
                title="Average Miles"
                value={this.getValue(
                  "allModesData",
                  "avg_miles"
                )}
                icon="tachometer"
                resourceId={"7d8e-dm7r"}
                updateEvent="micromobility_trips"
                numberFormat="decimal"
              />
              <Card
                title="Average Minutes"
                value={this.getValue(
                  "allModesData",
                  "avg_duration_minutes"
                )}
                icon="hourglass"
                resourceId={"7d8e-dm7r"}
                updateEvent="micromobility_trips"
                numberFormat="decimal"
              />
              <Card
                title="Total Devices"
                value={this.getDeviceValue(
                  "all",
                )}
                icon="star"
                resourceId={"7d8e-dm7r"}
                updateEvent="micromobility_trips"
                numberFormat="thousands"
              />
              <Card
                title="311 Service Requests"
                value={this.getValue(
                  "threeOneOneData",
                  "count"
                )}
                icon="phone"
                resourceId={"5h38-fd8d"}
                numberFormat="thousands"
              />
            </CardContainer>
          </div>    
        ) : (
          <div>
          </div>
        )}

        {this.state.viewMode === "scooters" ? (
          <div>
            <CardContainer>
              <Card
                title="Scooter Trips"
                value={this.getValue(
                  "scooterData",
                  "total_trips"
                )}
                icon="bolt"
                resourceId={"7d8e-dm7r"}
                updateEvent="micromobility_trips"
                numberFormat="thousands"
              />
              <Card
                title="Total Miles"
                value={this.getValue(
                  "scooterData",
                  "total_miles"
                )}
                icon="tachometer"
                resourceId={"7d8e-dm7r"}
                updateEvent="micromobility_trips"
                numberFormat="thousands"
              />
              <Card
                title="Average Miles"
                value={this.getValue(
                  "scooterData",
                  "avg_miles"
                )}
                icon="tachometer"
                resourceId={"7d8e-dm7r"}
                updateEvent="micromobility_trips"
                numberFormat="decimal"
              />
              <Card
                title="Average Minutes"
                value={this.getValue(
                  "scooterData",
                  "avg_duration_minutes"
                )}
                icon="hourglass"
                resourceId={"7d8e-dm7r"}
                updateEvent="micromobility_trips"
                numberFormat="decimal"
              />
              <Card
                title="Total Devices"
                value={this.getDeviceValue(
                  "scooter",
                )}
                icon="star"
                resourceId={"7d8e-dm7r"}
                updateEvent="micromobility_trips"
                numberFormat="thousands"
              />
            </CardContainer>
          </div>    
        ) : (
          <div>
          </div>
        )}

        {this.state.viewMode === "bicycles" ? (
          <div>
            <CardContainer>
              <Card
                title="Bicycle Trips"
                value={this.getValue(
                  "bicycleData",
                  "total_trips"
                )}
                icon="bicycle"
                resourceId={"7d8e-dm7r"}
                updateEvent="micromobility_trips"
                numberFormat="thousands"
              />
              <Card
                title="Total Miles"
                value={this.getValue(
                  "bicycleData",
                  "total_miles"
                )}
                icon="tachometer"
                resourceId={"7d8e-dm7r"}
                updateEvent="micromobility_trips"
                numberFormat="thousands"
              />
              <Card
                title="Average Miles"
                value={this.getValue(
                  "bicycleData",
                  "avg_miles"
                )}
                icon="tachometer"
                resourceId={"7d8e-dm7r"}
                updateEvent="micromobility_trips"
                numberFormat="decimal"
              />
              <Card
                title="Average Minutes"
                value={this.getValue(
                  "bicycleData",
                  "avg_duration_minutes"
                )}
                icon="hourglass"
                resourceId={"7d8e-dm7r"}
                updateEvent="micromobility_trips"
                numberFormat="decimal"
              />
              <Card
                title="Total Devices"
                value={this.getDeviceValue(
                  "bicycle",
                )}
                icon="star"
                resourceId={"7d8e-dm7r"}
                updateEvent="micromobility_trips"
                numberFormat="thousands"
              />
            </CardContainer>
          </div>    
        ) : (
          <div>
          </div>
        )}

        <div>
          <h3 className="mt-3">About</h3>
          <Description /> 
        </div>

      </div>
    );
  }
}
export default MicromobilityData;
