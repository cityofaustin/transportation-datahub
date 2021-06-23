import React, { useRef, useEffect, useState } from "react";
import Head from "next/head";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Button from "react-bootstrap/Button";
// custom components
import Nav from "../components/Nav";
import Footer from "../components/Footer";
import GeoTable from "../components/geotable/GeoTable";
import useSocrata from "../utils/socrata.js";

const SOCRATA_ENDPOINT = {
  resourceId: "5zpr-dehc",
  format: "geojson",
  query: "$limit=9999999&$order=location_name asc",
};

const TABLE_HEADERS = [
  { key: "location_name", label: "Location" },
  { key: "operation_state", label: "Status" },
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

const OP_STATES = ["0", "1", "2", "3", "4", "5", "6"];

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
          {OP_STATES.map((operation_state) => {
            return (
              <Col>
                <p>{metricData[operation_state] || "nothing here"}</p>
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
            <h4>About the Signal Request Program</h4>
          </Col>
        </Row>
        <Row className="text-primary">
          <Col>
            <h5 className="text-dts-4">What am I Looking at?</h5>
            <p>
              This webpage reports the status of traffic and pedestrian signal
              requests. Every year we typically receive more than one hundred
              requests for traffic and pedestrian signals, each of which is
              evaluated and ranked for possible installation.
            </p>
            <p>
              This page shows the status of new and existing signal requests, as
              well as those locations that are currently being studied or have
              been studied but not yet constructed.
            </p>
            <p>Click here for more details about the signal request process.</p>
          </Col>
          <Col>
            <h5 className="text-dts-4">Evaluation and Study</h5>
            <p>
              Eligible request are assigned preliminary scores based on crash
              history, travel demand, and community context. The highest scoring
              requests are selected for study by a professional engineer, who
              makes a formal recommendation for signalization.
            </p>
          </Col>
          <Col>
            <h5 className="text-dts-4">Contact Us</h5>
            <p>
              To request a new traffic signal or follow-up on an existing
              request, call 3-1-1. You can also submit a traffic signal service
              request online.
            </p>
            <p>
              If you have questions about this web page or the data that powers
              it, contact transportation.data@austintexas.gov
            </p>
          </Col>
        </Row>
      </Container>
      <Footer />
    </>
  );
}
