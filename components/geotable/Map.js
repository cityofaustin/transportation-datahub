import React, { useRef, useEffect, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Spinner from "react-bootstrap/Spinner";
import CloseButton from "react-bootstrap/CloseButton";
import Button from "react-bootstrap/Button";
import { FaMapMarkerAlt } from "react-icons/fa";
import styles from "../../styles/Map.module.css";


// TODO: move to build environment
mapboxgl.accessToken =
  "pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4M29iazA2Z2gycXA4N2pmbDZmangifQ.-g_vE53SD2WrJ6tFX7QHmA";


const MAP_OPTIONS = {
  center: [-97.74, 30.28],
  zoom: 11,
  style: "mapbox://styles/mapbox/light-v10",
  maxZoom: 18,
  pitchWithRotate: false,
  dragRotate: false,
  maxBounds: [
    [-98.27, 30.05],
    [-97.18318, 30.49],
  ],
};

const POINT_LAYER_OPTIONS_DEFAULT = {
  id: "points",
  type: "circle",
  source: "points",
  paint: {
    "circle-radius": {
      stops: [
        [10, 5],
        [16, 15],
      ],
    },
    "circle-stroke-color": "#fff",
    "circle-stroke-width": 2,
    "circle-stroke-opacity": 0.9,
    "circle-color": "#607d8f",
    "circle-opacity": 0.9,
  },
};

/**
 * Add a custom geojson point layer to a map and enable basic interactivity
**/
export const addPointLayer = ({ map, layer, geojson, onFeatureClick }) => {
  if (map.getLayer(layer.id)) {
    map.removeLayer(layer.id);
  }

  if (map.getSource(layer.id)) {
    map.removeSource(layer.id);
  }
  /* merge paint properties separately to allow individual default paint properties
  to be overwritten */
  layer.paint = {
    ...POINT_LAYER_OPTIONS_DEFAULT.paint,
    ...(layer.paint || {}),
  };

  layer = { ...POINT_LAYER_OPTIONS_DEFAULT, ...layer };

  map.addSource(layer.id, {
    type: "geojson",
    data: geojson,
  });

  map.addLayer(layer);

  map.on("mouseenter", layer.id, function () {
    map.getCanvas().style.cursor = "pointer";
  });

  map.on("mouseleave", layer.id, function () {
    map.getCanvas().style.cursor = "";
  });

  map.on("click", layer.id, onFeatureClick);
};


/**
 * Add a point marker to a map
**/
const Marker = ({ map, feature }) => {
  const markerRef = useRef();

  useEffect(() => {
    const marker = new mapboxgl.Marker(markerRef)
      .setLngLat([
        feature.geometry.coordinates[0],
        feature.geometry.coordinates[1],
      ])
      .addTo(map);
    return () => marker.remove();
  });

  return <div ref={markerRef} />;
};


/**
 * Get the centroid coordinates from a multiPoint feature.
**/
const getMultipointCenter = (feature) => {
  let bounds = new mapboxgl.LngLatBounds();
  feature.geometry.coordinates.forEach((coordinatePair) => {
    bounds.extend(coordinatePair);
  });
  return bounds.getCenter();
};

/**
 * Pan and zoom to a map feature. Supports Point or MultiPoint geojson features.
**/
export const easeToFeature = (map, feature) => {
  const coordinates =
    feature.geometry.type === "Point"
      ? feature.geometry.coordinates
      : getMultipointCenter(feature);
  map.easeTo({
    center: coordinates,
    zoom: 13,
    duration: 1000,
  });
};

/**
 * Hook which initializes a Mapbox GL map
**/
const useMap = (mapContainerRef, mapRef) => {
  const [isMapLoaded, setIsMapLoaded] = useState(false);

  useEffect(() => {
    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      ...MAP_OPTIONS,
    });
    mapRef.current.addControl(new mapboxgl.NavigationControl(), "bottom-right");
    mapRef.current.once("load").then(() => setIsMapLoaded(true));
    return () => mapRef.current?.remove();
  }, []);
  return isMapLoaded;
};

/**
 * A dialogue that renders selected feature info across the top of map.
**/
const MapOverlay = ({ feature, setSelectedFeature, children }) => {
  // TODO: allow custom overlay or none at all when constructing GeoTable
  // TODO: you'll need to pass feature/setSElectedFeature props within geotable. good luck.
  // TODO: add aria tags?
  return (
    <div className="map-overlay-container">
      <div className="list-group">
        <div className="list-group-item " aria-current="true">
          <div className="d-flex w-100 justify-content-between">
            <h5 className="mb-1">
              <span className="text-dts-4">
                <FaMapMarkerAlt />
              </span>{" "}
              {feature.properties.location_name}
            </h5>
            <CloseButton
              onClick={() => {
                setSelectedFeature(null);
              }}
            />
          </div>
          <p className="mb-1">{feature.properties.signal_status}</p>
        </div>
      </div>
    </div>
  );
};

/**
 * A customizeable Mapbox GL map component which renders a point or multipoint layer and enables basic interactivity.
**/
export default function Map({
  geojson,
  layerStyle,
  mapContainerRef,
  mapRef,
  selectedFeature,
  setSelectedFeature,
  onFeatureClick,
}) {
  const isMapLoaded = useMap(mapContainerRef, mapRef);

  useEffect(() => {
    isMapLoaded &&
      geojson &&
      addPointLayer({
        map: mapRef.current,
        layer: layerStyle,
        geojson: geojson,
        onFeatureClick: onFeatureClick,
      });
  }, [mapRef.current, geojson, isMapLoaded, onFeatureClick, layerStyle]);

  useEffect(() => {
    if (!mapRef.current) return;
    mapRef.current.on("click", () => {
      // Clears selected feature when user clicks/taps elsewhere on the map
      setSelectedFeature(null);
    });
  }, [mapRef.current]);

  return (
    <div className={styles["map-container"]} ref={mapContainerRef}>
      {selectedFeature && (
        <>
          <MapOverlay
            feature={selectedFeature}
            setSelectedFeature={setSelectedFeature}
          />
          {selectedFeature.geometry.type === "Point" && (
            <Marker map={mapRef.current} feature={selectedFeature} />
          )}
        </>
      )}
      {!isMapLoaded && (
        <div className="d-flex justify-content-center">
          <Spinner className="text-secondary" animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
        </div>
      )}
    </div>
  );
}
