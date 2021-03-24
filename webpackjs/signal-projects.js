import $ from "jquery";
import {
  makeMap,
  basicMapConfig,
  basicPointLayerConfig,
} from "./components/map";

import { initSearch } from "./components/search";

let filters = [
  {
    label: "Design",
    iconClass: "fas fa-pen",
    dataKey: "signal_status",
    dataValue: "DESIGN",
    checked: true,
  },
  {
    label: "Construction",
    iconClass: "fas fa-wrench",
    dataKey: "signal_status",
    dataValue: "CONSTRUCTION",
    checked: true,
  },
  {
    label: "Turned On",
    iconClass: "fas fa-check-circle",
    dataKey: "signal_status",
    dataValue: "TURNED_ON",
    checked: false,
  },
  {
    label: "Other",
    iconClass: "fas fa-question-circle",
    dataKey: "signal_status",
    dataValue: "Other",
    checked: false,
  },
];

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

const url = `https://data.austintexas.gov/resource/xwqn-2f78.geojson?$select=id, modified_date, atd_location_id, signal_type, signal_id, signal_status, location_name, construction_note, construction_note_date, location&$limit=999999&$where=signal_status in ('DESIGN', 'CONSTRUCTION', 'TURNED_ON')`;

const findFilterIconClass = (row) => {
  const matchesFilter = filters.filter((f) => {
    return f.dataValue === row[f.dataKey];
  });
  return matchesFilter.length === 1 ? matchesFilter[0].iconClass : "";
};

const cardContentFactory = (row) =>
  `<h5 class="card-title">${row.location_name || ""}</h5>
    <h6 class="card-subtitle mb-2 text-muted"><span class="status-badge status-badge-${row.signal_status.toLowerCase() || ""}"><i class="${findFilterIconClass(
    row
  )}"></i> ${row.signal_status || ""}</h6>
    <p class="card-text">${row.construction_note || ""}</p>
    <p class="card-text text-muted small">Updated: ${new Date(row.modified_date).toLocaleDateString() || ""}</p>`;

let tableOptions = {
  columns: [
    {
      data: "signal_status",
      searchable: false,
      render: function (data, type, row, meta) {
        return `<span class='status-badge status-badge-${row.signal_status.toLowerCase()}'><i class='${findFilterIconClass(
          row
        )}'></i></span>`;
      },
    },
    {
      data: "location_name",
    },
  ],
  order: [[1, "asc"]],
};

fetch(url)
  .then((response) => response.json())
  .then((geojson) => {
    initMap(geojson);
  });

const initMap = (geojson) => {
  const map = makeMap();
  map.on("load", function () {
    basicMapConfig(map);
    basicPointLayerConfig(map, POINT_LAYER_STYLE, geojson);
    $("#spinner").addClass("d-none");
    $("#data-row").removeClass("d-none");
    map.resize();
    main(map, geojson);
  });
};

const flattenGeojson = (geojson) =>
  geojson.features.map((feature) => {
    return { ...feature.properties, ...feature.geometry };
  });

function main(map, geojson) {
  tableOptions.data = flattenGeojson(geojson);
  initSearch(
    map,
    geojson,
    tableOptions,
    cardContentFactory,
    filters
  );
}
