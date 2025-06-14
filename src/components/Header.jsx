import React from "react";

function Header({ onLoginClick }) {
  return (
    <header className="header">
      <div className="logo">Test Management Tool</div>
      <button className="login-btn" onClick={onLoginClick}>
        Login
      </button>
    </header>
  );
}

export default Header;