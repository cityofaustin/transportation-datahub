import React from "react";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import BsTable from "react-bootstrap/Table";
import Button from "react-bootstrap/Button";

/**
 * A Bootstrap table component which renders geojson features as table rows.
 *
 * @param {Object[]}  features - an array of geojson features
 * @param {Object[]}  headers - an array of column header properties. the table will display one column for each header provided.
 * @param {string}  headers[].key - a string which must uniquely identify this header. if no renderFunc() is provided, the key will also be used to access the property to display in each table cell.
 * @param {string}  headers[].label - a string which will be used as the column's name in the first row of the table
 * @param { function(object) : string } headers[].renderFunc - An optional cell rendering function which accepts a single feature and returns a string value
 * @param { function(object) } onRowClick - An optional callback function which accepts a single feature and will be called when a table row is clicked.
 */

export default function Table({ features, headers, onRowClick }) {
  if (!features || features.length === 0) {
    // TODO: render something helpful? e.g., "No data to display"
    return null;
  }
  return (
    <BsTable responsive hover striped size="sm" style={{ fontSize: ".75em" }}>
      <thead>
        <tr>
          {headers.map((header) => {
            return <th key={header.key}>{header.label}</th>;
          })}
        </tr>
      </thead>
      <tbody>
        {features.map((feature, i) => {
          return (
            <tr
              key={i}
              style={onRowClick && { cursor: "pointer" }}
              onClick={() => {
                onRowClick && onRowClick(feature);
              }}
            >
              {headers.map(({ key, renderFunc }) => {
                return (
                  <td key={key}>
                    {renderFunc ? renderFunc(feature) : feature.properties[key]}
                  </td>
                );
              })}
            </tr>
          );
        })}
      </tbody>
    </BsTable>
  );
}
