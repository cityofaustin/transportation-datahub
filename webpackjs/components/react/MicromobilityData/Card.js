import React from "react";
import AnimatedNumber from "react-animated-number";
import { format } from "d3-format";
import axios from "axios";

import UpdateDate from "./UpdateDate";

const Card = ({
  title,
  value,
  icon,
  resourceId,
  updateEvent,
  numberFormat // "decimal" or "thousands"
}) => (
  <div className="col-sm-6 col-md-4 col-lg-3 dash-panel-container p-2">
    <div
      className="col dash-panel h-100 p-2"
      id="micromobility-trips-total-count"
      data-container="body"
      data-trigger="hover"
      data-toggle="popover"
      data-placement="top"
      data-content="# of total Micromobility trips taken."
      data-original-title=""
      title=""
    >
      <div className="row dash-panel-header">
        <div className="col-1 dash-panel-icon">
          <h4>
            <i className={`fa fa-${icon}`} />
          </h4>
        </div>
        <div className="col dash-panel-title">
          <h4>{title}</h4>
        </div>
      </div>
      <div className="row">
        <div className="col">
          <span className="info-metric-small">
            {typeof value === "string" ? (
              <span>{value}</span>
            ) : (
              <AnimatedNumber
                value={value}
                style={{
                  transition: "0.8s ease-out",
                  transitionProperty: "color, opacity"
                }}
                frameStyle={perc => (perc === 100 ? {} : { color: "#E5E5E5" })}
                duration={300}
                formatValue={n => {
                  if (numberFormat === "thousands") {
                    return format(",d")(n);
                  } else if (numberFormat === "decimal") {
                    return parseFloat(Math.round(n * 100) / 100).toFixed(2);
                  }
                }}
              />
            )}
          </span>
        </div>
      </div>
      <UpdateDate updateEvent={updateEvent} resourceId={resourceId} />
    </div>
  </div>
);

export default Card;
