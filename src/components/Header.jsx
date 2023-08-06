import React, { useState, useContext } from "react";
import { NavLink, Link, useOutletContext } from "react-router-dom";
import { signOut } from "firebase/auth";
import { AuthContext } from "../context/authContext";
import { auth } from "../firebase";
import { motion } from "framer-motion";

export default function Header({ toggleDarkMode, isDarkMode, darkTheme }) {
  const [isChecked, setIsChecked] = useState(false);
  const { currentUser } = useContext(AuthContext);

  const activeStyles = {
    fontWeight: "bold",
    textDecoration: "underline",
    textDecorationColor: "#adadff",
    color: "#f55742",
    backgroundColor: "transparent",
  };

  const burgerActiveStyles = {
    textDecorationColor: "#adadff",
    color: "#f55742",
    backgroundColor: "transparent",
    textDecoration: "underline",
  };

  const burgerToggleDark = {
    backgroundColor: isDarkMode && "white",
  };

  const mainLogoDark = {
    boxShadow: isDarkMode && "-5px 8px 2px 1px rgba(64,68,75, 0.219)",
  };

  const handleClick = () => {
    setIsChecked(!isChecked);
  };

  function logOut() {
    signOut(auth)
      .then(() => {
        console.log("Logged out!");
        setIsChecked(false);
      })
      .catch((error) => {
        console.log(error);
      });
  }

  return (
    <header>
      <Link className="main-logo-link" to="/">
        <h1 className="main-logo" style={mainLogoDark}>
          Fridge2Pan 🥑
        </h1>
      </Link>

      <nav className="nav-menu">
        <NavLink
          to="/"
          style={({ isActive }) => (isActive ? activeStyles : null)}
          onClick={handleClick}
        >
          Home
        </NavLink>
        <NavLink
          to="fridge"
          style={({ isActive }) => (isActive ? activeStyles : null)}
          onClick={handleClick}
        >
          Fridge
        </NavLink>
        <NavLink
          to="search-recipes"
          style={({ isActive }) => (isActive ? activeStyles : null)}
          onClick={handleClick}
        >
          Search-Recipes
        </NavLink>
        <NavLink
          to="saved-recipes"
          style={({ isActive }) => (isActive ? activeStyles : null)}
          onClick={handleClick}
        >
          Saved Recipes
        </NavLink>
        {!currentUser ? (
          <NavLink
            to="login"
            style={({ isActive }) => (isActive ? activeStyles : null)}
            onClick={handleClick}
          >
            Login
          </NavLink>
        ) : (
          <NavLink
            to="login"
            style={({ isActive }) => (isActive ? activeStyles : null)}
            onClick={logOut}
          >
            Log out
          </NavLink>
        )}

        <label className="switch">
          <input type="checkbox" onClick={toggleDarkMode} />
          <span className="slider"></span>
        </label>
      </nav>

      {/*--- BURGER MENU ---*/}
      <nav className="burger-menu">
        <input
          type="checkbox"
          className="burger-toggle"
          id="burger-toggle"
          checked={isChecked}
          onChange={() => setIsChecked(!isChecked)}
        />

        <label htmlFor="burger-toggle" className="burger-icon">
          <span style={burgerToggleDark}></span>
          <span style={burgerToggleDark}></span>
          <span style={burgerToggleDark}></span>
        </label>
        <motion.div
          className="burger-nav"
          initial={{ opacity: 0 }}
          animate={{
            opacity: isChecked ? 1 : 0,
            y: isChecked ? 0 : -1300,
          }}
          transition={{ duration: 0.6 }}
          style={darkTheme}
        >
          <label className="switch">
            <input type="checkbox" onClick={toggleDarkMode} />
            <span className="slider"></span>
          </label>

          <NavLink
            to="/"
            style={({ isActive }) => (isActive ? burgerActiveStyles : null)}
            onClick={handleClick}
          >
            Home
          </NavLink>
          <NavLink
            to="fridge"
            style={({ isActive }) => (isActive ? burgerActiveStyles : null)}
            onClick={handleClick}
          >
            Fridge
          </NavLink>
          <NavLink
            to="search-recipes"
            style={({ isActive }) => (isActive ? burgerActiveStyles : null)}
            onClick={handleClick}
          >
            Search Recipes
          </NavLink>
          <NavLink
            to="saved-recipes"
            style={({ isActive }) => (isActive ? burgerActiveStyles : null)}
            onClick={handleClick}
          >
            Saved Recipes
          </NavLink>
          {!currentUser ? (
            <NavLink
              to="login"
              style={({ isActive }) => (isActive ? burgerActiveStyles : null)}
              onClick={handleClick}
            >
              Login
            </NavLink>
          ) : (
            <NavLink
              to="login"
              style={({ isActive }) => (isActive ? burgerActiveStyles : null)}
              onClick={logOut}
            >
              Log out
            </NavLink>
          )}
        </motion.div>
      </nav>
      {/* --------- */}
    </header>
  );
}
