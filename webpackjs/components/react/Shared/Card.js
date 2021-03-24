import React from "react";

const Card = ({ imageUrl, linkUrl, text }) => (
  <div className="card mb-4 shadow-sm">
    <img
      className="card-img-top"
      alt={text}
      style={{ height: "225px", width: "100%", display: "block" }}
      src={imageUrl}
    />
    <div className="card-body">
      <p className="card-text">{text}</p>
      <div className="d-flex justify-content-between align-items-center">
        <div className="btn-group">
          <button type="button" className="btn btn-sm btn-outline-secondary">
            <a href={linkUrl}>See more</a>
          </button>
        </div>
      </div>
    </div>
  </div>
);

export default Card;
