import React, { Component } from "react";
import axios from "axios";
import { timeFormat } from "d3-time-format";

class UpdateDate extends Component {
  constructor(props) {
    super(props);
    const { resourceId, updateEvent } = this.props;
    this.state = {
      updateDate: null,
      updateTime: null
    };
    this.isATDScheduledJob = this.props.updateEvent ? true : false;
    this.downloadUrl = `https://data.austintexas.gov/resource/${resourceId}`;

    if (this.isATDScheduledJob) {
      this.updatedAtUrl = `https://api.mobility.austin.gov/jobs?name=eq.${updateEvent}&status=eq.success&order=start_date.desc&limit=1`;
    } else {
      // when there is no update event, use the Socrata Metadata API
      // to look for an update timestamp
      this.updatedAtUrl = `https://data.austintexas.gov/api/views/${resourceId}.json`;
    }
  }

  readableDate(date) {
    const updateDate = timeFormat("%x")(date);
    const today = timeFormat("%x")(new Date());

    if (updateDate === today) {
      return "today";
    } else {
      return updateDate;
    }
  }

  componentDidMount() {
    axios.get(this.updatedAtUrl).then(res => {
      let updateDateTime;
      if (res.data.length === 0) return false;
      if (this.isATDScheduledJob) {
        updateDateTime = new Date(res.data[0].start_date);
      } else {
        updateDateTime = new Date(res.data.rowsUpdatedAt * 1000);
      }
      this.setState({
        updateDate: this.readableDate(updateDateTime),
        updateTime: timeFormat("%I:%M %p")(updateDateTime)
      });
    });
  }

  render() {
    const { updateDate, updateTime } = this.state;
    return (
      <div className="row">
        <div className="col">
          <h6 className="dash-panel-footer-text text-left">
            {updateDate &&
              updateTime && (
                <span>{`Updated ${updateDate} at ${updateTime} | `}</span>
              )}
            <a href={this.downloadUrl} target="_blank">
              Data <i className="fa fa-download" />
            </a>
          </h6>
        </div>
      </div>
    );
  }
}

export default UpdateDate;
