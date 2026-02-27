import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  FiHome,
  FiPackage,
  FiCalendar,
  FiMessageSquare,
  FiImage,
  FiSettings,
  FiLogOut,
  FiEdit   // Import edit icon
} from 'react-icons/fi';
import { FaBullhorn } from "react-icons/fa";
import '../Components/Sidebae.css';

const Sidebar = ({ collapsed, onLogout }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogoutClick = () => {
    sessionStorage.removeItem('authToken');
    sessionStorage.removeItem('authUser');

    if (onLogout) onLogout();

    navigate('/login');
  };

  return (
    <div className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      {/* Sidebar Header */}
      <div className="sidebar-header">
        {!collapsed && <h2 className="sidebar-title">Admin Panel</h2>}
      </div>

      {/* Navigation Links */}
      <nav className="sidebar-nav">
        <Link to="/" className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}>
          <FiHome className="nav-icon" />
          {!collapsed && <span>Dashboard</span>}
        </Link>
        {!collapsed && <hr className="sidebar-divider" />}

        <Link to="/products" className={`nav-link ${location.pathname.includes('/products') ? 'active' : ''}`}>
          <FiPackage className="nav-icon" />
          {!collapsed && <span>Products</span>}
        </Link>
        {!collapsed && <hr className="sidebar-divider" />}

        <Link to="/appointments" className={`nav-link ${location.pathname.includes('/appointments') ? 'active' : ''}`}>
          <FiCalendar className="nav-icon" />
          {!collapsed && <span>Appointments</span>}
        </Link>
        {!collapsed && <hr className="sidebar-divider" />}

        <Link to="/messages" className={`nav-link ${location.pathname.includes('/messages') ? 'active' : ''}`}>
          <FiMessageSquare className="nav-icon" />
          {!collapsed && <span>Messages</span>}
        </Link>
        {!collapsed && <hr className="sidebar-divider" />}

        <Link to="/gallery" className={`nav-link ${location.pathname.includes('/gallery') ? 'active' : ''}`}>
          <FiImage className="nav-icon" />
          {!collapsed && <span className="ms-2">Gallery</span>}
        </Link>
        {!collapsed && <hr className="sidebar-divider" />}




        {/* Updates with FaBullhorn icon */}
        <Link to="/updates" className={`nav-link ${location.pathname.includes('/updates') ? 'active' : ''}`}>
          <FaBullhorn className="nav-icon" />
          {!collapsed && <span className="ms-2">Updates</span>}
        </Link>
        {!collapsed && <hr className="sidebar-divider" />}
        
        {/* Contents with FiEdit icon */}
        <Link to="/contents" className={`nav-link ${location.pathname.includes('/contents') ? 'active' : ''}`}>
          <FiEdit className="nav-icon" />
          {!collapsed && <span className="ms-2">Contents</span>}
        </Link>
      </nav>

      {/* Bottom Section */}
      <div className="sidebar-bottom">
        <button className="nav-link logout-btn" onClick={handleLogoutClick}>
          <FiLogOut className="nav-icon" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
