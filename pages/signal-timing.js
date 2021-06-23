import React, { useRef, useEffect, useState } from "react";
import Head from "next/head";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";
import Form from "react-bootstrap/Form";
import { ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
// custom components
import Nav from "../components/Nav";
import Footer from "../components/Footer";
import GeoTable from "../components/geotable/GeoTable";
import useSocrata from "../utils/socrata.js";


const SOCRATA_ENDPOINT_CORRIDORS = {
  resourceId: "efct-8fs9",
  format: "geojson",
  query:
    "$limit=9999999&$select=system_id,system_name,signal_id,location_name,location",
};

const SOCRATA_ENDPOINT_RETIMING = {
  resourceId: "g8w2-8uap",
  format: "json",
  query: "$limit=9999999&",
};

const TABLE_HEADERS = [{ key: "system_name", label: "Corridor Name" }];

const POINT_LAYER_STYLE = {
  id: "points",
};

const FILTERS = {
  search: {
    key: "search",
    value: "",
    featureProp: "system_name",
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

const constructCorridorFeature = ({ system_id, system_name }) => {
  return {
    type: "Feature",
    properties: { system_id, system_name },
    geometry: { type: "MultiPoint", coordinates: [] },
  };
};

const useMultiPointCorridors = (features) => {
  const [signalCorridors, setSignalCorridors] = React.useState({
    type: "FeatureCollection",
    features: [],
  });
  React.useEffect(() => {
    if (!features) return;
    let corridorIndex = {};
    let mutableCorridors = { ...signalCorridors };
    features.forEach((feature) => {
      let system_id = feature.properties.system_id;
      let system_name = feature.properties.system_name;

      if (!(system_id in corridorIndex)) {
        // create a new json feature to hold all signals in this corridor
        corridorIndex[system_id] = constructCorridorFeature({
          system_id,
          system_name,
        });
      }
      let coordinates = feature.geometry.coordinates;
      coordinates &&
        corridorIndex[system_id].geometry.coordinates.push(coordinates);
    });
    mutableCorridors.features = Object.keys(corridorIndex).map(
      (key) => corridorIndex[key]
    );
    setSignalCorridors(mutableCorridors);
  }, [features]);
  return signalCorridors;
};

const useYears = (data) => {
  const [years, setYears] = React.useState([]);
  const [selectedYear, setSelectedYear] = React.useState(null);

  React.useEffect(() => {
    if (!data) return;
    let allYears = data.map((row) => {
      return row.scheduled_fy;
    });
    // set the current selected year to the most recent, or if no years, 2016...why not? hopefully does not happen
    setSelectedYear(allYears[allYears.length - 1] || "2016");
    setYears([...new Set(allYears)]);
  }, data);

  return { years, selectedYear, setSelectedYear };
};

const useRetimingDataYear = (data, selectedYear) => {
  const [retimingDataYear, setRetimingDataYear] = React.useState([]);
  React.useEffect(() => {
    if (!data) return;
    let thisYearData = data.filter((row) => {
      return row.scheduled_fy === selectedYear;
    });
    setRetimingDataYear(thisYearData);
  }, [data, selectedYear]);
  return retimingDataYear;
};

const useCorridorYear = (signalCorridors, retimingDataFiltered) => {
  const [signalCorridorsYear, setSignalCorridorsYear] = React.useState([]);
  React.useEffect(() => {
    if (
      !signalCorridors ||
      signalCorridors.length === 0 ||
      !retimingDataFiltered ||
      retimingDataFiltered.length === 0
    )
      return;
    let corridorIdsCurrent = [
      ...new Set(retimingDataFiltered.map((corridor) => corridor.system_id)),
    ];
    let mutableCorridors = { ...signalCorridors };

    mutableCorridors.features = mutableCorridors.features.filter((corridor) => {
      return corridorIdsCurrent.indexOf(corridor.properties.system_id) >= 0;
    });
    setSignalCorridorsYear(mutableCorridors);
  }, [signalCorridors, retimingDataFiltered]);

  return signalCorridorsYear;
};

const useSummaryStats = (retimingDataYear) => {
  let completedSignalCount = 0;
  let totalSignalCount = 0;
  retimingDataYear.forEach((corridor) => {
    const signalCount = parseInt(corridor.signal_count || 0);
    completedSignalCount =
      corridor.retime_status === "COMPLETED"
        ? signalCount + completedSignalCount++
        : completedSignalCount;
    totalSignalCount += signalCount;
  });
  return { complete: completedSignalCount, total: totalSignalCount };
};

export default function Viewer() {
  const signalCorridorsRaw = useSocrata(SOCRATA_ENDPOINT_CORRIDORS);
  const signalCorridors = useMultiPointCorridors(
    signalCorridorsRaw?.data?.features
  );
  const retimingDataRaw = useSocrata(SOCRATA_ENDPOINT_RETIMING);
  const { years, selectedYear, setSelectedYear } = useYears(
    retimingDataRaw.data
  );
  const retimingDataYear = useRetimingDataYear(
    retimingDataRaw?.data,
    selectedYear
  );
  const signalCorridorsYear = useCorridorYear(
    signalCorridors,
    retimingDataYear
  );

  const summaryStats = useSummaryStats(retimingDataYear);
  const pieData = [
    {
      name: "Group A",
      value: summaryStats.total - summaryStats.complete,
    },
    {
      name: "Group B",
      value: summaryStats.total,
    },
  ];
  const COLORS = ["#82ca9d", "#fcba03"];
  console.log(
    "you have to remove dupe signals from overlapping corridors, which truly sucks. at some point you need to merge the retiming data into the features so that it's rendered in the table"
  );
  return (
    <> 
      <Nav />
      <Container fluid>
        <Row>
          <Col>
            <h2 className="text-primary">Signal Re-Timing</h2>
          </Col>
        </Row>
        <Row>
          <Col xs={12} md={3}>
            <Form.Select
              aria-label="Year selector"
              onChange={(e) => setSelectedYear(e.target.value)}
              value={selectedYear || ""}
            >
              {years.map((year) => {
                return (
                  <option key={year} value={year}>
                    {year}
                  </option>
                );
              })}
            </Form.Select>
          </Col>
          <Col className="pb-2">
            <ResponsiveContainer height={200}>
              <PieChart width={"100%"} height={"100%"}>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={"60%"}
                  outerRadius={"100%"}
                  startAngle={90}
                  endAngle={550}
                  label
                >
                  <Cell fill="gray" />
                  <Cell fill="green" />
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </Col>
        </Row>
        <GeoTable
          geojson={signalCorridorsYear}
          headers={TABLE_HEADERS}
          filterDefs={FILTERS}
          layerStyle={POINT_LAYER_STYLE}
        />
      </Container>
      <Footer />
    </>
  );
}
