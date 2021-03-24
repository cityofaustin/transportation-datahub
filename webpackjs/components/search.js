import $ from "jquery";
import { makeDataTable } from "./data-table";
import { showCard, hideCard, updateCard } from "./mapCard";
import { easeToFeatureMarker } from "./map";

const hide = (element) => {
  element.addClass("d-none");
};

const show = (element) => {
  element.removeClass("d-none");
};

const filterButton = ({ label, iconClass, dataKey, dataValue, checked }) => {
  return `<div class="col text-nowrap filter-button m-1 px-2 py-0" role="button" ${
    checked ? "checked=checked" : ""
  } data-key="${dataKey}" data-value="${dataValue}">
        <span><i class="${iconClass}"></i> ${label}</span>
    </div>`;
};

export const createFilterButtons = (filters) => {
  filters.forEach((f) => {
    const btn = $(filterButton(f));
    $("#filter-buttons").append(btn);
  });
};

const updateTableMapData = (table, map, geojson, filters) => {
  let filteredFeatures = geojson.features.filter((feature) => {
    return filters.some((f) => feature.properties[f.key] === f.value);
  });

  let tableData = filteredFeatures.map((feature) => {
    return { ...feature.properties, ...feature.geometry };
  });

  table.clear();
  table.rows.add(tableData).draw();
  map.getSource("points").setData({
    type: "FeatureCollection",
    features: filteredFeatures,
  });
};

const getCurrentFilters = () => {
  let currentFilters = [];
  const activeFilters = $(".filter-button[checked]");
  activeFilters.each((i, filter) => {
    currentFilters.push($(filter).data());
  });
  return currentFilters;
};

export function initSearch(
  map,
  geojson,
  tableOptions,
  cardContentFactory,
  filters = undefined,
  layerId = "points"
) {
  // create element references
  const tableWrapper = $("#data-table-parent");
  const searchWrapper = $("#search");
  const input = $("#search input");
  const cancelInputButton = $("#search-cancel");
  let filterButtons;
  let marker;

  // create data table
  const table = makeDataTable("data-table", tableOptions);

  // create filter buttons
  if (filters) {
    createFilterButtons(filters);
    filterButtons = $(".filter-button");
    updateTableMapData(table, map, geojson, getCurrentFilters());
  }
  // define event handlers
  const onCancelInput = (e) => {
    e.data.input.val("");
    hide(e.data.cancelInputButton);
    hide(e.data.tableWrapper);
  };

  const onInput = (e) => {
    const value = e.currentTarget.value;
    hideCard();
    if (value) {
      e.data.table.search(value).draw();
      show(e.data.cancelInputButton);
      show(e.data.tableWrapper);
    } else {
      hide(e.data.cancelInputButton);
      hide(e.data.tableWrapper);
    }
  };

  const onRowClick = (e) => {
    const row = e.data.table.row(e.currentTarget).data();
    updateCard(row, e.data.cardContentFactory);
    hide(e.data.tableWrapper);
    hide(e.data.cancelInputButton);
    hide(e.data.searchWrapper);
    e.data.input.val("");
    $("#filter-buttons").addClass("d-none");
    showCard();
    marker = easeToFeatureMarker(e.data.map, row.coordinates, marker);
  };

  const onFilterButtonClick = (e) => {
    const button = $(e.currentTarget);
    const checked = button.attr("checked");
    if (checked) {
      button.attr("checked", false);
    } else {
      button.attr("checked", true);
    }
    const currentFilters = getCurrentFilters();
    updateTableMapData(
      e.data.table,
      e.data.map,
      e.data.geojson,
      currentFilters
    );
  };

  const onMapFeatureClick = (e) => {
    const feature = e.features[0];
    updateCard(feature.properties, cardContentFactory);
    hide(tableWrapper);
    hide(cancelInputButton);
    hide(searchWrapper);
    $("#filter-buttons").addClass("d-none");
    showCard();
  };

  // create event listeners
  input.on("input", { table, cancelInputButton, tableWrapper }, onInput);

  cancelInputButton.on(
    "click",
    { input, cancelInputButton, tableWrapper },
    onCancelInput
  );

  // by binding the event to the table wrapper (rather than directly to table rows) we
  // ensure that binding persists when rows are regenerated from filtered data
  tableWrapper.on(
    "click",
    "tr",
    {
      map,
      marker,
      searchWrapper,
      input,
      cancelInputButton,
      tableWrapper,
      table,
      cardContentFactory,
    },
    onRowClick
  );

  map.on("click", layerId, onMapFeatureClick);

  if (filterButtons) {
    filterButtons.on("click", { table, map, geojson }, onFilterButtonClick);
  }
}
