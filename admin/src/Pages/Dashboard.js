// Dashboard.js
import React, { useState } from 'react';
import Sidebar from '../Components/Sidebar';
import Header from '../Components/Header';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import './Dashboard.css';

const Dashboard = ({ children, onLogout }) => {  // accept onLogout here
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div>
      <div className={`sidebar-wrapper ${sidebarCollapsed ? 'collapsed' : ''}`}>
        {/* Pass onLogout prop to Sidebar */}
        <Sidebar collapsed={sidebarCollapsed} onLogout={onLogout} />
        <button
          className="sidebar-toggle"
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
        >
          {sidebarCollapsed ? <FiChevronRight /> : <FiChevronLeft />}
        </button>
      </div>

      <div className="main-content">
        <Header />

        <div className="dashboard-body">
          <div className="content-background-pattern"></div>
          {children}
        </div>

        <footer className="dashboard-footer">
          <div className="footer-content">
            <p className="footer-text">
              © {new Date().getFullYear()} Krishivishwa Admin Dashboard
            </p>
            <div className="footer-links">
              <a href="/privacy" className="footer-link">Privacy Policy</a>
              <span className="footer-divider">•</span>
              <a href="/terms" className="footer-link">Terms of Service</a>
              <span className="footer-divider">•</span>
              <a href="/contact" className="footer-link">Contact Support</a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Dashboard;
