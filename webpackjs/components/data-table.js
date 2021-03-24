import $ from "jquery";
const dt = require("datatables.net");

const TABLE_OPTIONS_DEFAULT = {
  dom: "tr", // (t): table, (r): processing display element
  rowId: "id",
  scrollY: "50vh",
  scrollCollapse: true,
  paging: false,
  autoWidth: true,
  order: [[1, "asc"]],
  createdRow: function (row) {
    $(row).addClass("data-table-row");
  },
};

export const makeDataTable = (divId, options) => {
  return $(`#${divId}`).DataTable({ ...TABLE_OPTIONS_DEFAULT, ...options });
};
