import React from 'react';

export default function Topbar({ userRole }) {
  return (
    <div className="topbar">
      <div>
        <h1>CUSAT Smart Student Portal</h1>
        <p>Kalamassery, Kochi - campus support, accommodation and nearby essentials</p>
      </div>
      <div className="status-box">
        <span className={`status-badge ${userRole}`}>
          <i className={`ti ${userRole === 'admin' ? 'ti-shield-check' : 'ti-eye'}`}></i>
          {userRole === 'admin' ? 'Admin Mode (GitHub)' : 'Guest Viewer'}
        </span>
      </div>
    </div>
  );
}
