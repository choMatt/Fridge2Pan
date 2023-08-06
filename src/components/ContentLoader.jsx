import React from "react";
import { useOutletContext } from "react-router-dom";

export default function ContentLoader(props) {
  const { isDarkMode } = useOutletContext();

  console.log(props);

  const cardDarkTheme = {
    boxShadow: isDarkMode && "-5px 8px 2px 1px rgba(64,68,75, 0.219)",
    backgroundColor: isDarkMode && "transparent",
    border: isDarkMode && "1px solid rgb(187, 187, 187)",
  };

  const loadingRow = (
    <div className="load-row">
      <span></span>
      <span></span>
      <span></span>
      <span></span>
    </div>
  );

  const loadingState = (
    <div className="loading-card">
      <div className="loading-text"  style={cardDarkTheme}>
        {loadingRow}
        <h2>Searching Recipe...</h2>
      </div>
    </div>
  );

  const errorState = (
    <div className="error-card" >
      <div className="error-text" style={cardDarkTheme}>
        <h3>Aww... No recipe found :( </h3>
        <button className="fridge__button" onClick={props.back}>
          Back
        </button>
      </div>
    </div>
  );
  return <>{props.isLoading ? loadingState : errorState}</>;
}
