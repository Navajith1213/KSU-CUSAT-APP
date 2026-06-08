import React from 'react';

export default function Topbar({ userRole }) {
  const getBadgeConfig = () => {
    switch (userRole) {
      case 'admin':
        return {
          className: 'status-badge admin',
          icon: 'ti-shield-check',
          label: 'Admin Mode (GitHub)'
        };
      case 'student':
        return {
          className: 'status-badge student',
          icon: 'ti-user-check',
          label: 'Student Member'
        };
      default:
        return {
          className: 'status-badge user',
          icon: 'ti-eye',
          label: 'Guest Viewer'
        };
    }
  };

  const badge = getBadgeConfig();

  return (
    <div className="topbar">
      <div>
        <h1>KSU Students Portal</h1>
        <p>Kalamassery, Kochi - campus support, accommodation and nearby essentials</p>
      </div>
      <div className="status-box">
        <span className={badge.className}>
          <i className={`ti ${badge.icon}`}></i>
          {badge.label}
        </span>
      </div>
    </div>
  );
}
