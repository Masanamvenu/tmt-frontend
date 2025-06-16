import React from "react";
import "./Header.css";

function Header({ isLoggedIn, onLoginClick, onLogoutClick }) {
  return (
    <header className="header">
      <div className="logo">Test Management Tool</div>
      <div className="header-btn-container">
        {isLoggedIn ? (
          <button className="logout-btn" onClick={onLogoutClick}>
            Logout
          </button>
        ) : (
          <button className="login-btn" onClick={onLoginClick}>
            Login
          </button>
        )}
      </div>
    </header>
  );
}

export default Header;