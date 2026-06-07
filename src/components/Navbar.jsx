import React, { useState } from 'react';

export default function Navbar({
  userRole,
  activeModule,
  setActiveModule,
  setShowAuthModal,
  logout,
  loggedStudent
}) {
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { id: 'home', label: 'Home', icon: 'ti-home' },
    { id: 'calendar', label: 'Calendar', icon: 'ti-calendar' },
    { id: 'contacts', label: 'Contacts', icon: 'ti-phone' },
    { id: 'boysPgs', label: "Boys PG's", icon: 'ti-building-community' },
    { id: 'girlsPgs', label: "Girls PG's", icon: 'ti-home-2' },
    { id: 'food', label: 'Tea Spots', icon: 'ti-coffee' },
    { id: 'restaurants', label: 'Restaurants', icon: 'ti-tools-kitchen-2' },
    { id: 'amenities', label: 'Amenities', icon: 'ti-map-pin' },
    { id: 'clubs', label: 'Clubs', icon: 'ti-users' },
    ...(userRole === 'student' ? [{ id: 'queries', label: 'My Queries', icon: 'ti-mail' }] : [])
  ];

  const handleNavClick = (id) => {
    setActiveModule(id);
    setIsOpen(false); // Close mobile drawer on click
  };

  return (
    <header className="navbar">
      {/* Top Row: Brand + Auth */}
      <div className="navbar-top">
        <a href="#home" className="navbar-logo" onClick={() => handleNavClick('home')}>
          <h2>CUSAT Portal</h2>
        </a>

        <div className="navbar-actions">
          {userRole === 'student' && loggedStudent && (
            <span className="status-badge student" style={{ padding: '6px 14px', fontSize: '13px' }}>
              <i className="ti ti-user-check" style={{ marginRight: '4px' }}></i>
              {loggedStudent.full_name.split(' ')[0]}
            </span>
          )}

          {userRole === 'user' ? (
            <button className="navbar-btn" onClick={() => setShowAuthModal(true)}>
              <i className="ti ti-login"></i> Log In
            </button>
          ) : (
            <button className="navbar-btn logout" onClick={logout}>
              <i className="ti ti-logout"></i> Logout
            </button>
          )}

          {/* Hamburger Menu Toggle (Mobile only) */}
          <button className="hamburger-btn" onClick={() => setIsOpen(!isOpen)} aria-label="Toggle menu">
            <i className={isOpen ? 'ti ti-x' : 'ti ti-menu-2'}></i>
          </button>
        </div>
      </div>

      {/* Bottom Row: Navigation Links */}
      <div className="navbar-container">
        <nav className="navbar-menu">
          {navItems.map((item) => (
            <button
              key={item.id}
              className={`navbar-link ${activeModule === item.id ? 'active' : ''}`}
              onClick={() => handleNavClick(item.id)}
            >
              <i className={`ti ${item.icon}`} style={{ fontSize: '15px' }}></i>
              {item.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Backdrop overlay for mobile menu drawer */}
      {isOpen && <div className="mobile-menu-overlay" onClick={() => setIsOpen(false)}></div>}

      {/* Mobile Menu Drawer */}
      <div className={`mobile-menu ${isOpen ? 'open' : ''}`}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #e2e8f0', paddingBottom: '14px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a', fontFamily: 'Outfit, sans-serif' }}>Navigation</h3>
          <button className="hamburger-btn" style={{ display: 'block' }} onClick={() => setIsOpen(false)} aria-label="Close menu">
            <i className="ti ti-x"></i>
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', overflowY: 'auto', flex: 1 }}>
          {navItems.map((item) => (
            <button
              key={item.id}
              className={`mobile-menu-link ${activeModule === item.id ? 'active' : ''}`}
              onClick={() => handleNavClick(item.id)}
            >
              <i className={`ti ${item.icon}`} style={{ fontSize: '16px' }}></i>
              {item.label}
            </button>
          ))}
        </div>

        <div style={{ marginTop: 'auto', borderTop: '1px solid #e2e8f0', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {userRole === 'student' && loggedStudent && (
            <div style={{ padding: '8px 12px', fontSize: '13px', color: '#64748b' }}>
              Logged in as: <strong>{loggedStudent.full_name}</strong>
            </div>
          )}

          {userRole === 'user' ? (
            <button className="navbar-btn" style={{ width: '100%' }} onClick={() => { setShowAuthModal(true); setIsOpen(false); }}>
              <i className="ti ti-login"></i> Log In
            </button>
          ) : (
            <button className="navbar-btn logout" style={{ width: '100%' }} onClick={() => { logout(); setIsOpen(false); }}>
              <i className="ti ti-logout"></i> Logout
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
