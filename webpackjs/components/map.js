import mapboxgl from "!mapbox-gl";
import { showCard, updateCard } from "./mapCard";

const MAPBOX_ACCESS_TOKEN =
  "pk.eyJ1Ijoiam9obmNsYXJ5IiwiYSI6ImNrbW13OGo1MTAwYXIyenBvOW9iMmRua3QifQ.o9R4uG8USa4ZazTEyheJcQ";

const MAP_OPTIONS_DEFAULT = {
  container: "map", // container ID
  style: "mapbox://styles/mapbox/light-v10", // style URL
  center: [-97.74, 30.28], // starting position [lng, lat]
  zoom: 12, // starting zoom
  maxZoom: 18,
  pitchWithRotate: false,
  dragRotate: false,
  maxBounds: [[-98.27,30.05],[-97.18318,30.49]],
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

mapboxgl.accessToken = MAPBOX_ACCESS_TOKEN;

export const makeMarker = (map, coordinates, previousMarker) => {
  if (previousMarker) {
    previousMarker.remove();
  }
  const marker = new mapboxgl.Marker({
    closeButton: false,
    focusAfterOpen: false,
    color: "#00c0a1",
  })
    .setLngLat(coordinates)
    .addTo(map);

  map.on("click", () => {
    marker.remove();
  });
  return marker;
};

export const makeMap = (options = {}) => {
  return new mapboxgl.Map({ ...MAP_OPTIONS_DEFAULT, ...options });
};

export const basicMapConfig = (map) => {
  map.addControl(
    new mapboxgl.NavigationControl({ showCompass: false }),
    "top-right"
  );
  map.on("idle", function () {
    map.resize();
  });
};

export const basicPointLayerConfig = (map, layer, geojson) => {
  /* merge paint properties separately to allow individual default paint properties
  to be overrided */
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
};

export const easeToFeatureMarker = (
  map,
  coordinates,
  previousMarker = undefined
) => {
  map.easeTo({ center: coordinates, zoom: 17, duration: 1000 });
  return makeMarker(map, coordinates, previousMarker);
};
