import React from 'react';

export default function Sidebar({
  userRole,
  activeModule,
  setActiveModule,
  logout
}) {
  // The Admin sidebar menu items are identical to the original admin dashboard sidebar
  const menuItems = [
    { id: 'home', label: 'Back to Site', icon: 'ti-arrow-left' },
    { id: 'calendar', label: 'Academic Calendar', icon: 'ti-calendar' },
    { id: 'contacts', label: 'Contacts', icon: 'ti-phone' },
    { id: 'hostels', label: 'Hostels', icon: 'ti-building-community' },
    { id: 'pgs', label: 'PGs', icon: 'ti-bed' },
    { id: 'food', label: 'Tea Spots', icon: 'ti-coffee' },
    { id: 'restaurants', label: 'Restaurants', icon: 'ti-tools-kitchen-2' },
    { id: 'amenities', label: 'Amenities', icon: 'ti-map-pin' },
    { id: 'clubs', label: 'Campus Clubs', icon: 'ti-users' },
    { id: 'admin-queries', label: 'Student Queries', icon: 'ti-mail' },
    { id: 'admin', label: 'Admin Dashboard', icon: 'ti-settings' }
  ];

  return (
    <aside className="sidebar">
      <div className="brand-box">
        <h2>CUSAT Admin</h2>
        <p>Repository Manager Panel</p>
      </div>

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

      <div style={{ marginTop: 'auto' }}>
        <button className="auth-btn logout" style={{ width: '100%' }} onClick={logout}>
          <i className="ti ti-logout"></i> Exit Admin
        </button>
      </div>
    </aside>
  );
}
