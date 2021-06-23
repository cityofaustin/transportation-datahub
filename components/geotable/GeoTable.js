import React, { useRef, useEffect, useState } from "react";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import InputGroup from "react-bootstrap/InputGroup";
import Modal from "react-bootstrap/Modal";
import { BsSearch } from "react-icons/bs";
import { FaCaretDown, FaCaretUp, FaMapMarkerAlt } from "react-icons/fa";
import { useMediaQuery } from "react-responsive";
import Map, { easeToFeature } from "./Map";
import Table from "./Table";
import styles from "../../styles/Map.module.css";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";

/*
  GeoTable is an interactive map-table component that can be configured to display a geojson FeatureCollection
  of point features. You feed it geojson data and a few configuration objects, and it presents a side-by-side
  table and map with shared states. 

  The component is responsive. The map will be hidden at Bootstrap's xs, sm, and md breakpoints and
  rendered in a full-screen modal when a table row is clicked or the "Show map" button is toggled.

  Things that can be customized:
  - map layer styles
  - the map "overlay" that displays information about a clicked table row or map feature
  - the appearance and formatting of values styled within the table
  - the table's keyword search and optional checkbox filters

  Constraints:
  - Only one layer can be rendered over the basemap
  - Only `Point` or `Multipoint` feature types can be rendered
  - The UX will not be great if you opt to render more than two or three table columns. Use the map overlay
    to display additional data.
*/

// https://getbootstrap.com/docs/5.0/layout/breakpoints/
// X-Small None  <576px
// Small sm  ≥576px
// Medium  md  ≥768px
// Large lg  ≥992px
// Extra large xl  ≥1200px
// Extra extra large xxl ≥1400p

const CheckBoxFilters = ({ filters, setFilters }) => {
  const onChange = (filter) => {
    let currentFilters = { ...filters };
    currentFilters.checkbox.some((f) => {
      if (f.key == filter.key) {
        f.checked = !f.checked;
        return true;
      }
    });
    // force all checkboxes to be checked if none are. prevents user from enabling all, resulting in a blank map
    if (
      currentFilters.checkbox.every((f) => {
        return !f.checked;
      })
    ) {
      currentFilters.checkbox.forEach((f) => {
        f.checked = true;
      });
    }
    setFilters(currentFilters);
  };

  return (
    <Form>
      {filters.checkbox.map((f) => (
        <div key={f.key}>
          <Form.Check
            type="switch"
            id={f.key}
            label={f.label}
            checked={f.checked}
            onChange={() => onChange(f)}
            className="text-dts-primary"
          />
        </div>
      ))}
    </Form>
  );
};

const FilterButton = (props) => {
  // A styled button for the filter toggle. All props are passed
  // to the react-bootstrap Button component
  const [isExpanded, setIsExpanded] = React.useState(false);
  return (
    <Button
      id="filter-button-toggle"
      {...props}
      onClick={() => {
        props.onClick();
        setIsExpanded(!isExpanded);
      }}
    >
      Filter
      {!isExpanded ? <FaCaretDown /> : <FaCaretUp />}
    </Button>
  );
};

const TableSearch = ({ filters, setFilters }) => {
  const handleChange = (e) => {
    let currentFilters = { ...filters };
    currentFilters.search.value = e.target.value;
    setFilters(currentFilters);
  };
  return (
    <>
      <Navbar expand="xs" className="py-0">
        <Container fluid className="px-0">
          <InputGroup className="mb-1">
            <InputGroup.Text id="basic-addon1">
              <BsSearch />
            </InputGroup.Text>
            <Form.Control
              size="sm"
              key={filters.search.key}
              name={filters.search.label}
              type="search"
              placeholder={filters.search.placeholder}
              onChange={handleChange}
            />
            {filters.checkbox && (
              <Navbar.Toggle
                as={FilterButton}
                aria-controls="basic-navbar-nav"
              />
            )}
          </InputGroup>

          {filters.checkbox && (
            <Navbar.Collapse timeout={100} id="basic-navbar-nav">
              <CheckBoxFilters filters={filters} setFilters={setFilters} />
            </Navbar.Collapse>
          )}
        </Container>
      </Navbar>
    </>
  );
};

const stringIncludesCaseInsensitive = (val, str) => {
  return str.toLowerCase().includes(val.toLowerCase());
};

/**
 * Custom hook that that applies search and checkbox filter states to geojson features
**/
const useFilteredGeojson = ({ geojson, filterDefs }) => {
  const [filters, setFilters] = React.useState(filterDefs);
  const [filteredGeosjon, setFilteredGeojson] = React.useState(geojson);
  /*
    todo: we could be more efficient here by filtering on the previously filtered geojson
    but it would require more state. if the table is going to handle more than ~1000 rows
    we should implement this.
    also consider adding a timeout function to the search filter component so that it doesn't
    re-filter on each key input
  */
  React.useEffect(() => {
    if (!geojson?.features) return;
    // create a mutable copy of geojson
    let currentGeojson = { ...geojson };
    let currentCheckedFilters = filters.checkbox?.filter((f) => f.checked);
    let currentSearchVal = filters.search.value;
    // apply checkbox filters if any exist and are checked
    if (currentCheckedFilters && currentCheckedFilters.length > 0) {
      currentGeojson.features = currentGeojson.features.filter((feature) => {
        return (
          // filter is applied by matching feature prop val exactly to filter val
          currentCheckedFilters.some((filter) => {
            return filter.value === feature.properties[filter.featureProp];
          })
        );
      });
    }
    // apply search term filter
    if (currentSearchVal) {
      currentGeojson.features = currentGeojson.features.filter((feature) => {
        return stringIncludesCaseInsensitive(
          currentSearchVal,
          feature.properties[filters.search.featureProp]
        );
      });
    }
    setFilteredGeojson(currentGeojson);
  }, [geojson, filters]);
  return [filteredGeosjon, filters, setFilters];
};

/**
 * A fullscreen modal into which the map is rendered.
 * 
 * Note that the modal's visibility is toggled via a combination of display properties: the `show`
 * prop is static (`true``). This prevents the component from unmounting when it is "closed", and
 * would otherwise require mapbox GL to re-load a new map instance every time the modal is made
 * visible.
 * 
**/
function MapModal({ showMap, setShowMap, children }) {
  const handleClose = () => setShowMap(false);
  return (
    <>
      <Modal
        fullscreen
        animation={false}
        show={true}
        onHide={handleClose}
        backdrop="static"
        keyboard={false}
        className={!showMap ? "d-none" : ""}
        backdropClassName={!showMap ? "d-none" : ""}
      >
        <Modal.Body className="p-0">{children}</Modal.Body>
      </Modal>
    </>
  );
}

export default function GeoTable({ geojson, headers, layerStyle, filterDefs }) {
  const [showModal, setShowModal] = React.useState(true);
  //
  const [showMap, setShowMap] = React.useState(false);
  const [selectedFeature, setSelectedFeature] = React.useState(null);
  const [filteredGeosjon, filters, setFilters] = useFilteredGeojson({
    geojson,
    filterDefs,
  });

  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);

  const onRowClick = (feature) => {
    if (feature) {
      easeToFeature(mapRef.current, feature);
      setSelectedFeature(feature);
      setShowMap(true);
      setTimeout(() => {
        mapRef.current?.resize();
      }, 400);
    } else {
      setSelectedFeature(null);
    }
  };

  const onFeatureClick = (eventData) => {
    const clickedFeature = eventData.features[0];
    setSelectedFeature(clickedFeature);
    easeToFeature(mapRef.current, clickedFeature);
  };

  const onBreakpointChange = () => {
    // resize (aka repaint) map when container size changes
    setTimeout(() => {
      mapRef.current?.resize();
    }, 400);
  };

  // bootstrap `md` and lower
  const isSmallScreen = useMediaQuery(
    { query: "(max-width: 991px)" },
    undefined,
    onBreakpointChange
  );

  // todo: document use of display to prevent map reloading/rendering
  // todo: bring setTimeout/showmap into function
  if (isSmallScreen && !showMap) {
    document.body.classList.remove("modal-open");
    document.body.style.overflow = "";
  } else if (isSmallScreen && showMap) {
    document.body.classList.add("modal-open");
    document.body.style.overflow = "hidden";
  }
  return (
    <>
      <Row>
        {isSmallScreen && (
          <MapModal showMap={showMap} setShowMap={setShowMap}>
            {!selectedFeature && (
              <Button
                variant="outline-primary"
                style={{
                  zIndex: 99999999,
                  position: "absolute",
                  top: 0,
                  right: 0,
                  margin: "5px",
                  backgroundColor: "#fff",
                }}
                onClick={() => {
                  setShowMap(false);
                }}
              >
                Close map
              </Button>
            )}
            <Map
              geojson={filteredGeosjon}
              layerStyle={layerStyle}
              mapContainerRef={mapContainerRef}
              mapRef={mapRef}
              selectedFeature={selectedFeature}
              setSelectedFeature={setSelectedFeature}
              onFeatureClick={onFeatureClick}
            />
          </MapModal>
        )}
      </Row>
      <Row style={{ height: "100%" }}>
        <Col xs={12} lg={5}>
          <Row style={{ height: 500, overflow: "hidden" }}>
            <Col>
              <Row>
                <Col>
                  <TableSearch filters={filters} setFilters={setFilters} />
                </Col>
                {isSmallScreen && (
                  <Col xs="auto">
                    <Button
                      variant="outline-dts-4"
                      // className="text-white"
                      size="sm"
                      onClick={() => {
                        setShowMap(!showMap);
                        setTimeout(() => {
                          mapRef.current?.resize();
                        }, 400);
                      }}
                    >
                      <FaMapMarkerAlt /> Map
                    </Button>
                  </Col>
                )}
              </Row>
              <Row style={{ height: 500, overflow: "auto" }}>
                <Col>
                  <Table
                    features={filteredGeosjon?.features}
                    onRowClick={onRowClick}
                    headers={headers}
                  />
                </Col>
              </Row>
            </Col>
          </Row>
        </Col>
        {!isSmallScreen && (
          <Col className={styles["map-col"]}>
            <Row style={{ height: 500 }}>
              <Col>
                <Map
                  geojson={filteredGeosjon}
                  layerStyle={layerStyle}
                  mapContainerRef={mapContainerRef}
                  mapRef={mapRef}
                  selectedFeature={selectedFeature}
                  setSelectedFeature={setSelectedFeature}
                  onFeatureClick={onFeatureClick}
                />
              </Col>
            </Row>
          </Col>
        )}
      </Row>
    </>
  );
}
