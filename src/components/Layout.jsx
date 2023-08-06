import React, { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import Header from "./Header";

export default function Layout() {
  // Get the initial state of isDarkMode from localStorage if available, otherwise default to false
  const initialIsDarkMode = localStorage.getItem("isDarkMode") === "true";
  const [isDarkMode, setIsDarkMode] = useState(initialIsDarkMode);

  // Save the state of isDarkMode in localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("isDarkMode", isDarkMode.toString());
  }, [isDarkMode]);
  const toggleDarkMode = () => {
    setIsDarkMode((prevMode) => !prevMode);
  };

  const darkTheme = {
    backgroundColor: isDarkMode && "#202225",
    background: isDarkMode && "#202225",
    color: isDarkMode ? "white" : "black",
    transition: "background 0.7s ease",
  };

  const btnDarkTheme = {
    backgroundColor: isDarkMode && "#bd4332",
    transition: "background 0.7s ease",
  };

  return (
    <div style={darkTheme} className="site-wrapper">
      <Header
        toggleDarkMode={toggleDarkMode}
        isDarkMode={isDarkMode}
        darkTheme={darkTheme}
      />
      <main>
        <Outlet
          context={{
            isDarkMode,
            setIsDarkMode,
            toggleDarkMode,
            btnDarkTheme,
            darkTheme,
          }}
        />
      </main>
    </div>
  );
}
