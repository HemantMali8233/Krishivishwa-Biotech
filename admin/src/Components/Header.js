import React from "react";
import "../Components/Header.css";
import Logo from '../Assets/logo.png';

const Header = () => {
  // Get stored admin details from sessionStorage
  const storedUser = sessionStorage.getItem("authUser");
  const username = storedUser ? JSON.parse(storedUser).username : "Admin";

  return (
    <header className="modern-header">
      <div className="header-content">

        {/* Logo */}
        <div className="logo-section">
          <img src={Logo} alt="Krishivishwa Logo" className="brand-logo" />
        </div>

        {/* Center Title */}
        <div className="panel-heading">
          <h2 className="panel-title">Welcome to Krishivishwa Panel</h2>
        </div>

        {/* Profile Section WITHOUT dropdown */}
        <div className="header-actions">
          <div className="user-profile-container">
            <div className="user-avatar">👨‍💼</div>
            <span className="user-name">{username}</span>
          </div>
        </div>

      </div>
    </header>
  );
};

export default Header;
