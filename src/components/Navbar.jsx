import React, { useState } from 'react';

export default function Navbar({
  userRole,
  activeModule,
  setActiveModule,
  setShowAuthModal,
  logout,
  loggedStudent,
  theme,
  setTheme
}) {
  const [isOpen, setIsOpen] = useState(false);

  // Mobile drawer categories expanded state
  const [mobileExpanded, setMobileExpanded] = useState({
    accommodations: true, // Default open for ease of discovery
    dining: false,
    info: false,
    campus_life: false
  });

  const toggleMobileCat = (catId) => {
    setMobileExpanded((prev) => ({
      ...prev,
      [catId]: !prev[catId]
    }));
  };

  const navCategories = [
    {
      id: 'accommodations',
      label: 'Stay & PG',
      icon: 'ti-building',
      items: [
        { id: 'boysPgs', label: "Boys PG's", icon: 'ti-building-community' },
        { id: 'girlsPgs', label: "Girls PG's", icon: 'ti-home-2' },
        { id: 'hostels', label: 'College Hostels', icon: 'ti-building' }
      ]
    },
    {
      id: 'dining',
      label: 'Food & Dining',
      icon: 'ti-tools-kitchen-2',
      items: [
        { id: 'food', label: 'Tea Spots', icon: 'ti-coffee' },
        { id: 'restaurants', label: 'Restaurants', icon: 'ti-tools-kitchen-2' }
      ]
    },
    {
      id: 'info',
      label: 'Campus Info',
      icon: 'ti-info-circle',
      items: [
        { id: 'calendar', label: 'Calendar', icon: 'ti-calendar' },
        { id: 'contacts', label: 'Contacts', icon: 'ti-phone' }
      ]
    },
    {
      id: 'campus_life',
      label: 'Campus Life',
      icon: 'ti-users',
      items: [
        { id: 'amenities', label: 'Amenities', icon: 'ti-map-pin' },
        { id: 'clubs', label: 'Clubs', icon: 'ti-users' },
        { id: 'academic_resources', label: 'Academic Resources', icon: 'ti-books' }
      ]
    }
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
          <img 
            src="/logo.jpg" 
            alt="KSU CUSAT Logo" 
            style={{ 
              height: '40px', 
              objectFit: 'contain', 
              display: 'block',
              filter: theme === 'dark' ? 'invert(1)' : 'none',
              mixBlendMode: theme === 'dark' ? 'screen' : 'multiply'
            }} 
          />
        </a>

        <div className="navbar-actions">
          
          {/* Theme Toggle Button */}
          <button 
            className="navbar-btn" 
            style={{ padding: '8px', borderRadius: '50%', background: 'var(--bg-hover)', color: 'var(--text-primary)' }}
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            title="Toggle Dark Mode"
          >
            <i className={theme === 'dark' ? 'ti ti-sun' : 'ti ti-moon'} style={{ fontSize: '18px' }}></i>
          </button>

          {userRole === 'student' && loggedStudent && (
            <span className="status-badge student" style={{ padding: '6px 14px', fontSize: '13px' }}>
              <i className="ti ti-user-check" style={{ marginRight: '4px' }}></i>
              {loggedStudent.full_name.split(' ')[0]}
            </span>
          )}

          {userRole === 'dept_admin' && loggedStudent && (
            <span className="status-badge admin" style={{ padding: '6px 14px', fontSize: '13px' }}>
              <i className="ti ti-shield-check" style={{ marginRight: '4px' }}></i>
              Dept Admin
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

      {/* Bottom Row: Desktop Navigation Links (Grouped Category Dropdowns) */}
      <div className="navbar-container">
        <nav className="navbar-menu">
          <button
            className={`navbar-link ${activeModule === 'home' ? 'active' : ''}`}
            onClick={() => handleNavClick('home')}
          >
            <i className="ti ti-home" style={{ fontSize: '15px' }}></i>
            Home
          </button>

          {navCategories.map((cat) => {
            const isCatActive = cat.items.some(item => activeModule === item.id);
            return (
              <div key={cat.id} className="navbar-dropdown-container">
                <button className={`navbar-category-btn ${isCatActive ? 'active-cat' : ''}`}>
                  <i className={`ti ${cat.icon}`} style={{ fontSize: '15px' }}></i>
                  {cat.label}
                  <i className="ti ti-chevron-down" style={{ fontSize: '12px', marginLeft: '2px' }}></i>
                </button>
                <div className="navbar-dropdown-menu">
                  {cat.items.map((item) => (
                    <button
                      key={item.id}
                      className={`dropdown-item-btn ${activeModule === item.id ? 'active' : ''}`}
                      onClick={() => handleNavClick(item.id)}
                    >
                      <i className={`ti ${item.icon}`} style={{ fontSize: '14px' }}></i>
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}

          {(userRole === 'student' || userRole === 'dept_admin') && (
            <button
              className={`navbar-link ${activeModule === 'queries' ? 'active' : ''}`}
              onClick={() => handleNavClick('queries')}
            >
              <i className="ti ti-mail" style={{ fontSize: '15px' }}></i>
              My Queries
            </button>
          )}

          {userRole === 'dept_admin' && (
            <button
              className={`navbar-link ${activeModule === 'dept_dashboard' ? 'active' : ''}`}
              onClick={() => handleNavClick('dept_dashboard')}
            >
              <i className="ti ti-books" style={{ fontSize: '15px' }}></i>
              Dept Dashboard
            </button>
          )}
        </nav>
      </div>

      {/* Backdrop overlay for mobile menu drawer */}
      {isOpen && <div className="mobile-menu-overlay" onClick={() => setIsOpen(false)}></div>}

      {/* Mobile Menu Drawer (Collapsible Accordion) */}
      <div className={`mobile-menu ${isOpen ? 'open' : ''}`}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--text-primary)', fontFamily: 'Outfit, sans-serif' }}>Navigation</h3>
          <button className="hamburger-btn" style={{ display: 'block' }} onClick={() => setIsOpen(false)} aria-label="Close menu">
            <i className="ti ti-x"></i>
          </button>
        </div>

        {/* Big logo placed above the Home/menu links in mobile menu drawer */}
        <div style={{ marginBottom: '20px', textAlign: 'center' }}>
          <img 
            src="/logo.jpg" 
            alt="KSU CUSAT Logo" 
            style={{ 
              width: '100%', 
              maxHeight: '76px', 
              objectFit: 'contain', 
              borderRadius: '8px',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
              filter: theme === 'dark' ? 'invert(1)' : 'none',
              mixBlendMode: theme === 'dark' ? 'screen' : 'multiply'
            }} 
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', overflowY: 'auto', flex: 1 }}>
          {/* Home Link (Direct) */}
          <button
            className={`mobile-menu-link ${activeModule === 'home' ? 'active' : ''}`}
            onClick={() => handleNavClick('home')}
            style={{ fontWeight: '700' }}
          >
            <i className="ti ti-home" style={{ fontSize: '16px' }}></i>
            Home
          </button>

          {/* Categorized Collapsible Accordions */}
          {navCategories.map((cat) => {
            const isCatExpanded = mobileExpanded[cat.id];
            const isCatActive = cat.items.some(item => activeModule === item.id);
            return (
              <div key={cat.id} className="mobile-category-group">
                <button
                  className={`mobile-category-header ${isCatExpanded ? 'open' : ''}`}
                  onClick={() => toggleMobileCat(cat.id)}
                  style={{ color: isCatActive ? '#0d9488' : 'var(--text-primary)' }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <i className={`ti ${cat.icon}`}></i>
                    {cat.label}
                  </span>
                  <i className="ti ti-chevron-down chevron"></i>
                </button>
                
                {isCatExpanded && (
                  <div className="mobile-category-items">
                    {cat.items.map((item) => (
                      <button
                        key={item.id}
                        className={`mobile-menu-link ${activeModule === item.id ? 'active' : ''}`}
                        onClick={() => handleNavClick(item.id)}
                        style={{ paddingLeft: '20px' }}
                      >
                        <i className={`ti ${item.icon}`} style={{ fontSize: '15px' }}></i>
                        {item.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}

          {/* Student Queries (Direct) */}
          {(userRole === 'student' || userRole === 'dept_admin') && (
            <button
              className={`mobile-menu-link ${activeModule === 'queries' ? 'active' : ''}`}
              onClick={() => handleNavClick('queries')}
              style={{ fontWeight: '700' }}
            >
              <i className="ti ti-mail" style={{ fontSize: '16px' }}></i>
              My Queries
            </button>
          )}

          {/* Dept Dashboard (Direct) */}
          {userRole === 'dept_admin' && (
            <button
              className={`mobile-menu-link ${activeModule === 'dept_dashboard' ? 'active' : ''}`}
              onClick={() => handleNavClick('dept_dashboard')}
              style={{ fontWeight: '700' }}
            >
              <i className="ti ti-books" style={{ fontSize: '16px' }}></i>
              Dept Dashboard
            </button>
          )}
        </div>

        <div style={{ marginTop: 'auto', borderTop: '1px solid var(--border-color)', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {userRole === 'student' && loggedStudent && (
            <div style={{ padding: '8px 12px', fontSize: '13px', color: 'var(--text-muted)' }}>
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
