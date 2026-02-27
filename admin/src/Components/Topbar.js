import React from 'react';
// import './Topbar.css';

const Topbar = () => {
  return (
    <div className="topbar d-flex justify-content-between align-items-center p-3">
      <div className="fw-bold">Dashboard</div>
      <div className="d-flex gap-2 align-items-center">
        <input type="text" placeholder="Search anything..." className="form-control" style={{ maxWidth: '250px' }} />
        <button className="btn btn-success">Add New Product</button>
      </div>
    </div>
  );
};

export default Topbar;
