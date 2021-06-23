import React, { useRef, useEffect, useState } from "react";
import Head from "next/head";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";
// custom components
import Nav from "../components/Nav";
import Footer from "../components/Footer";
import GeoTable from "../components/geotable/GeoTable";
import useSocrata from "../utils/socrata.js";

const SOCRATA_ENDPOINT = {
  resourceId: "5zpr-dehc",
  format: "geojson",
  query:
    "$limit=9999999&$order=location_name asc&$where=operation_state in ('1','2','3')",
};

const OP_STATES = [
  { key: "2", label: "Unscheduled Flash", color: "red" },
  { key: "1", label: "Scheduled Flash", color: "blue" },
  { key: "3", label: "Comm Outage", color: "green" },
];

const renderOperationState = (feature) => {
  const val = feature.properties["operation_state"];
  const thisOpState = OP_STATES.filter((opState) => {
    if (opState.key === val) return true;
  });
  return <span className="status-badge">{thisOpState[0]?.label || ""}</span>;
};

const TABLE_HEADERS = [
  { key: "location_name", label: "Location" },
  { key: "operation_state", label: "Status", renderFunc: renderOperationState },
];

const POINT_LAYER_STYLE = {
  id: "points",
  paint: {
    "circle-color": [
      "match",
      ["get", "operation_state"],
      "1",
      "#7570b3",
      "2",
      "#d95f02",
      "3",
      "#1b9e77",
      /* other */ "#ccc",
    ],
  },
};

const FILTERS = {
  checkbox: [
    {
      key: "scheduled_flash",
      value: "1",
      featureProp: "operation_state",
      label: "Scheduled Flash",
      checked: true,
    },
    {
      key: "flash",
      value: "2",
      featureProp: "operation_state",
      label: "Unscheduled Flash",
      checked: true,
    },
    {
      key: "comm_outage",
      value: "3",
      featureProp: "operation_state",
      label: "Communications Outage",
      checked: true,
    },
  ],
  search: {
    key: "search",
    value: "",
    featureProp: "location_name",
    label: "Search",
    placeholder: "Search by location...",
  },
};

export function CardItem({ title, value }) {
  return (
    <Card className="h-100 shadow-sm pb-2 text-center">
      <Card.Body>
        <h5 className="text-dts-4">{title}</h5>
        <h3 className="text-dts-6">{value}</h3>
      </Card.Body>
    </Card>
  );
}

const useMetricData = (data) => {
  const [metricData, setMetricData] = React.useState({});

  React.useEffect(() => {
    if (!data) return;
    let currentData = {};
    data.features.forEach((feature) => {
      let operationState = feature.properties.operation_state;
      if (!(operationState in currentData)) currentData[operationState] = 0;
      currentData[operationState]++;
    });
    setMetricData(currentData);
  }, [data]);
  return metricData;
};

export default function Viewer() {
  const { data, loading, error } = useSocrata(SOCRATA_ENDPOINT);
  const metricData = useMetricData(data);
  return (
    <>
      <Nav />
      <Container fluid>
        <Row>
          <Col>
            <h2 className="text-primary">Traffic Signal Monitor</h2>
          </Col>
        </Row>
        <Row>
          {OP_STATES.map((operationStateDef) => {
            return (
              <Col className="pb-2">
                <CardItem
                  title={operationStateDef.label}
                  value={metricData[operationStateDef.key] || 0}
                />
              </Col>
            );
          })}
        </Row>
        <GeoTable
          geojson={data}
          headers={TABLE_HEADERS}
          filterDefs={FILTERS}
          layerStyle={POINT_LAYER_STYLE}
        />
        <Row className="mt-4 mb-2 text-primary">
          <Col>
            <h4>About the Traffic Signal Monitor</h4>
          </Col>
        </Row>
        <Row className="text-primary">
          <Col>
            <h5 className="text-dts-4">What am I Looking at?</h5>
            <p>
              This dashboard reports the operation status of traffic signals in
              Austin, TX. Traffic signals enter flash mode when something is
              preventing the signal from operating normally. This is typically
              the result of a power surge, power outage, or damage to signal
              equipment. A signal may also be intentionally placed into flash
              mode for maintenance purposes or be scheduled to flash overnight.
            </p>
          </Col>
          <Col>
            <h5 className="text-dts-4">Advanced Transportation Management</h5>
            <p>
              All of the City’s signals communicate with our Advanced
              Transportation Management System. When these signals go on flash,
              they will be reported on this dashboard. It also occasionally
              happens that the event that disables a traffic signal also
              disables network communication to the signal, in which case the
              signal outage will not be reported here.
            </p>
          </Col>
          <Col>
            <h5 className="text-dts-4">Report an Issue</h5>
            <p>
              To report an issue or request a new traffic signal, call 3-1-1.
              You can also{" "}
              <a href="https://austin-csrprodcwi.motorolasolutions.com/ServiceRequest.mvc/SRIntakeStep2/TRASIGNE?guid=59340171d27247fa93fe951cdaf37dcc">
                submit a traffic signal service request online
              </a>
              .
            </p>
          </Col>
        </Row>
      </Container>
      <Footer />
    </>
  );
}
