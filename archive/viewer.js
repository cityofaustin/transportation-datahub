import React, { useRef, useEffect, useState } from "react";
import Head from "next/head";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Map, { easeToFeature } from "../components/Map";
import { MySelect } from "../components/Select";
import { useSocrataGeoJSON } from "../utils/socrata.js";
import styles from "../styles/viewer.module.css";

const SOCRATA_RESOURCE_ID = "p53x-x73x";

const POINT_LAYER_STYLE = {
  id: "points",
  paint: {
    "circle-color": [
      "match",
      ["get", "signal_status"],
      "DESIGN",
      "#7570b3",
      "CONSTRUCTION",
      "#d95f02",
      "TURNED_ON",
      "#1b9e77",
      /* other */ "#ccc",
    ],
  },
};

const FILTERS = [
  {
    key: "design",
    value: "DESIGN",
    featureProp: "signal_status",
    label: "Design",
    checked: true,
  },
  {
    key: "construction",
    value: "CONSTRUCTION",
    featureProp: "signal_status",
    label: "Construction",
    checked: true,
  },
  {
    key: "turned_on",
    value: "TURNED_ON",
    featureProp: "signal_status",
    label: "Turned On",
    checked: false,
  },
];

const useGeojsonOptions = ({ features, labelKey }) => {
  const [options, setOptions] = React.useState([]);

  React.useEffect(() => {
    const currentOptions = features.map((feature) => {
      return {
        value: feature,
        label: feature.properties[labelKey],
      };
    });
    setOptions(currentOptions);
  }, [features, labelKey]);

  return options;
};

const CheckBoxFilters = ({ filters, setFilters }) => {
  const onChange = (filter) => {
    let currentFilters = [...filters];
    currentFilters.some((f) => {
      if (f.key == filter.key) {
        f.checked = !f.checked;
        return true;
      }
    });
    setFilters(currentFilters);
  };

  return (
    <Form>
      {filters.map((f) => (
        <div key={f.key} style={{ cursor: "pointer" }}>
          <Form.Check
            type="switch"
            id={f.key}
            label={f.label}
            checked={f.checked}
            onChange={() => onChange(f)}
          />
        </div>
      ))}
    </Form>
  );
};

const PanelContent = ({ options, onChange, filters, setFilters }) => {
  return (
    <React.Fragment>
      <Row>
        <Col>
          <h1>Signal Projects</h1>
        </Col>
      </Row>
      <Row>
        <Col>
          <MySelect options={options} onChange={onChange} isClearable={true} />
        </Col>
      </Row>
      <Row>
        <Col>
          <CheckBoxFilters filters={filters} setFilters={setFilters} />
        </Col>
      </Row>
    </React.Fragment>
  );
};

export default function Viewer() {
  const { geojson, loading, error } = useSocrataGeoJSON(SOCRATA_RESOURCE_ID);
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const [filteredGeosjon, setFilteredGeojson] = React.useState(null);
  const [selectedFeature, setSelectedFeature] = React.useState(null);
  const [filters, setFilters] = React.useState(FILTERS);

  const options = useGeojsonOptions({
    features: (filteredGeosjon && filteredGeosjon.features) || [],
    labelKey: "location_name",
  });

  React.useEffect(() => {
    let currentGeojson = { ...geojson };
    let currentFilters = filters.filter((f) => f.checked);
    if (currentFilters && currentGeojson?.features) {
      const filteredFeatures = currentGeojson.features.filter((feature) => {
        return currentFilters.some((filter) => {
          return filter.value === feature.properties[filter.featureProp];
        });
      });
      currentGeojson.features = filteredFeatures;
    }
    setFilteredGeojson(currentGeojson);
  }, [geojson, filters]);

  const onChange = (option, eventData) => {
    console.log("TODO: use reducer");
    if (option && option.value && eventData.action === "select-option") {
      easeToFeature(mapRef.current, option.value);
      setSelectedFeature(option.value);
    } else if (eventData.action === "clear") {
      setSelectedFeature(null);
    }
  };

  const onFeatureClick = (eventData) => {
    const clickedFeature = eventData.features[0];
    setSelectedFeature({
      properties: clickedFeature.properties,
      geometry: clickedFeature.geometry,
    });
  };

  return (
    <>
      <div className="wrapper">
        <Map
          geojson={filteredGeosjon}
          layerStyle={POINT_LAYER_STYLE}
          mapContainerRef={mapContainerRef}
          mapRef={mapRef}
          selectedFeature={selectedFeature}
          setSelectedFeature={setSelectedFeature}
          onFeatureClick={onFeatureClick}
        />
        <Col className={styles.panel} xs={12} md={6} lg={4}>
          <Row>
            <Col className={styles["side-pane"]}>
              {!selectedFeature && (
                <PanelContent
                  options={options}
                  onChange={onChange}
                  filters={filters}
                  setFilters={setFilters}
                />
              )}
              {selectedFeature && (
                <Row>
                  <Col>
                    <h6>{selectedFeature.properties.location_name}</h6>
                  </Col>
                </Row>
              )}
            </Col>
          </Row>
        </Col>
      </div>
    </>
  );
}
