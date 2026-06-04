import React from 'react';

export default function Sidebar({ userRole, activeModule, setActiveModule, setShowAuthModal, logout }) {
  const menuItems = [
    { id: 'home', label: 'Home', icon: 'ti-home' },
    { id: 'calendar', label: 'Academic Calendar', icon: 'ti-calendar' },
    { id: 'contacts', label: 'Contacts', icon: 'ti-phone' },
    { id: 'hostels', label: 'Hostels', icon: 'ti-building-community' },
    { id: 'pgs', label: 'PGs', icon: 'ti-bed' },
    { id: 'food', label: 'Tea Spots', icon: 'ti-coffee' },
    { id: 'restaurants', label: 'Restaurants', icon: 'ti-tools-kitchen-2' },
    { id: 'amenities', label: 'Amenities', icon: 'ti-map-pin' },
    { id: 'clubs', label: 'Campus Clubs', icon: 'ti-users' },
    ...(userRole === 'admin' ? [{ id: 'admin', label: 'Admin Panel', icon: 'ti-settings' }] : [])
  ];

  return (
    <aside className="sidebar">
      <div className="brand-box">
        <h2>CUSAT</h2>
        <p>Kochi Student Utility Portal</p>
      </div>

      {userRole === 'user' ? (
        <button className="auth-btn" onClick={() => setShowAuthModal(true)}>
          <i className="ti ti-lock"></i> Admin Access
        </button>
      ) : (
        <button className="auth-btn logout" onClick={logout}>
          <i className="ti ti-logout"></i> Exit Admin
        </button>
      )}

      <div className="menu-list">
        {menuItems.map(item => (
          <button
            key={item.id}
            className={`menu-btn ${activeModule === item.id ? 'active' : ''}`}
            onClick={() => setActiveModule(item.id)}
          >
            <i className={`ti ${item.icon}`}></i>
            {item.label}
          </button>
        ))}
      </div>
    </aside>
  );
}
