import React from 'react';

export default function Sidebar({
  userRole,
  activeModule,
  setActiveModule,
  setShowAuthModal,
  logout,
  loggedStudent
}) {
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
    ...(userRole === 'student' ? [{ id: 'queries', label: 'My Queries', icon: 'ti-mail' }] : []),
    ...(userRole === 'admin' ? [{ id: 'admin', label: 'Admin Panel', icon: 'ti-settings' }] : [])
  ];

  return (
    <aside className="sidebar">
      <div className="brand-box">
        <h2>CUSAT</h2>
        <p>Kochi Student Utility Portal</p>
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

      <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {userRole === 'student' && loggedStudent && (
          <div style={{ padding: '10px 14px', borderRadius: '10px', background: 'rgba(255,255,255,0.03)', fontSize: '13px' }}>
            <span style={{ color: '#94a3b8', fontSize: '11px', display: 'block', textTransform: 'uppercase' }}>Logged in as</span>
            <strong style={{ color: 'white', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {loggedStudent.full_name}
            </strong>
          </div>
        )}

        {userRole === 'user' ? (
          <button className="auth-btn" onClick={() => setShowAuthModal(true)}>
            <i className="ti ti-login"></i> Log In / Access
          </button>
        ) : (
          <button className="auth-btn logout" onClick={logout}>
            <i className="ti ti-logout"></i> {userRole === 'admin' ? 'Exit Admin' : 'Log Out'}
          </button>
        )}
      </div>
    </aside>
  );
}
