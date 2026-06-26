import React, { useLayoutEffect, useRef, useState, useEffect } from 'react';
import { gsap } from 'gsap';
import './CardNav.css';
import BorderGlow from './BorderGlow';

const CardNav = ({
  userRole,
  activeModule,
  setActiveModule,
  setShowAuthModal,
  logout,
  loggedStudent,
  theme,
  setTheme
}) => {
  const [isHamburgerOpen, setIsHamburgerOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [selectedSheetTab, setSelectedSheetTab] = useState('stay');
  const navRef = useRef(null);
  const cardsRef = useRef([]);
  const tlRef = useRef(null);

  // Compute active tab dynamically based on activeModule
  const currentTab = React.useMemo(() => {
    if (activeModule === 'home') return 'home';
    if (['boysPgs', 'girlsPgs', 'hostels'].includes(activeModule)) return 'stay';
    if (['food', 'restaurants'].includes(activeModule)) return 'food';
    if (['calendar', 'contacts', 'helpdesk', 'amenities'].includes(activeModule)) return 'info';
    return 'menu';
  }, [activeModule]);

  // Define nav items mapping, wrapped in useMemo to prevent GSAP timeline re-creation on every render
  const items = React.useMemo(() => [
    {
      id: 'accommodations',
      label: 'Stay & PG',
      icon: 'ti-building',
      bgColor: theme === 'dark' ? '#1e293b' : '#f0f9ff',
      textColor: theme === 'dark' ? '#e2e8f0' : '#0f172a',
      links: [
        { id: 'boysPgs', label: "Boys PG's", icon: 'ti-building-community' },
        { id: 'girlsPgs', label: "Girls PG's", icon: 'ti-home-2' },
        { id: 'hostels', label: 'College Hostels', icon: 'ti-building' }
      ]
    },
    {
      id: 'dining',
      label: 'Food & Dining',
      icon: 'ti-tools-kitchen-2',
      bgColor: theme === 'dark' ? '#332929' : '#fff1f2',
      textColor: theme === 'dark' ? '#e2e8f0' : '#0f172a',
      links: [
        { id: 'food', label: 'Tea Spots', icon: 'ti-coffee' },
        { id: 'restaurants', label: 'Restaurants', icon: 'ti-tools-kitchen-2' }
      ]
    },
    {
      id: 'info',
      label: 'Campus Info',
      icon: 'ti-info-circle',
      bgColor: theme === 'dark' ? '#1c2e26' : '#ecfdf5',
      textColor: theme === 'dark' ? '#e2e8f0' : '#0f172a',
      links: [
        { id: 'calendar', label: 'Calendar', icon: 'ti-calendar' },
        { id: 'contacts', label: 'Departments', icon: 'ti-building' },
        { id: 'helpdesk', label: 'Helpdesk Directory', icon: 'ti-headset' },
        { id: 'amenities', label: 'Amenities', icon: 'ti-map-pin' }
      ]
    },
    {
      id: 'campus_life',
      label: 'Campus Life',
      icon: 'ti-users',
      bgColor: theme === 'dark' ? '#3b2512' : '#fff7ed',
      textColor: theme === 'dark' ? '#e2e8f0' : '#0f172a',
      links: [
        { id: 'clubs', label: 'Clubs', icon: 'ti-users' },
        { id: 'turfs', label: 'Turfs & Arenas', icon: 'ti-ball-football' },
        { id: 'academic_resources', label: 'Academic Resources', icon: 'ti-books' },
        ...(userRole === 'student' || userRole === 'dept_admin' ? [{ id: 'queries', label: 'My Queries', icon: 'ti-mail' }] : [])
      ]
    }
  ], [theme, userRole]);

  const calculateHeight = () => {
    const navEl = navRef.current;
    if (!navEl) return 64;

    const contentEl = navEl.querySelector('.card-nav-content');
    if (!contentEl) return 300;

    const wasVisible = contentEl.style.visibility;
    const wasPointerEvents = contentEl.style.pointerEvents;
    const wasPosition = contentEl.style.position;
    const wasHeight = contentEl.style.height;

    contentEl.style.visibility = 'visible';
    contentEl.style.pointerEvents = 'auto';
    contentEl.style.position = 'static';
    contentEl.style.height = 'auto';

    contentEl.offsetHeight; // Force reflow

    const topBar = 64;
    const padding = 32; // 16px top + 16px bottom padding inside .card-nav-content
    const contentHeight = contentEl.scrollHeight;

    contentEl.style.visibility = wasVisible;
    contentEl.style.pointerEvents = wasPointerEvents;
    contentEl.style.position = wasPosition;
    contentEl.style.height = wasHeight;

    return topBar + contentHeight + padding;
  };

  const createTimeline = () => {
    const navEl = navRef.current;
    if (!navEl) return null;

    const validCards = cardsRef.current.filter(el => el != null);
    const contentEl = navEl.querySelector('.card-nav-content');

    const tl = gsap.timeline({ 
      paused: true,
      onReverseComplete: () => setIsExpanded(false) 
    });

    if (window.innerWidth <= 900) {
      // Mobile sliding from right is handled purely by CSS via .open class
      // We just return a dummy timeline so toggleMenu still works seamlessly
      gsap.set(navEl, { clearProps: 'height' });
      gsap.set(contentEl, { clearProps: 'all' });
      gsap.set(validCards, { clearProps: 'all' });
      
      tl.to({}, { duration: 0.1 }); // dummy animation
    } else {
      // Desktop expanding height
      gsap.set(navEl, { height: 64 });
      gsap.set(contentEl, { clearProps: 'all' }); // reset any CSS transform
      gsap.set(validCards, { y: 30, x: 0, opacity: 0 });

      tl.to(navEl, {
        height: calculateHeight,
        duration: 0.4,
        ease: 'power3.out'
      });

      tl.to(validCards, { y: 0, opacity: 1, duration: 0.4, ease: 'power3.out', stagger: 0.05 }, '-=0.2');
    }

    return tl;
  };

  // Only recreate timeline if the structural layout of the menu items or user role changes.
  // This prevents resetting/recreating the timeline when only the theme is toggled.
  const itemsStructureKey = items.map(item => `${item.id}-${item.links.length}`).join(',') + `-${userRole}`;

  useLayoutEffect(() => {
    const tl = createTimeline();
    if (tl && isExpanded) {
      tl.progress(1);
    }
    tlRef.current = tl;

    return () => {
      tl?.kill();
      tlRef.current = null;
    };
  }, [itemsStructureKey]);

  useLayoutEffect(() => {
    let lastWidth = window.innerWidth;

    const handleResize = () => {
      // Ignore height-only resize events triggered by mobile browser scroll bars hiding/overscrolling
      if (window.innerWidth === lastWidth) return;
      lastWidth = window.innerWidth;

      if (!tlRef.current) return;

      if (isExpanded) {
        if (window.innerWidth > 900) {
          const newHeight = calculateHeight();
          gsap.set(navRef.current, { height: newHeight });
        } else {
          gsap.set(navRef.current, { clearProps: 'height' });
        }

        tlRef.current.kill();
        const newTl = createTimeline();
        if (newTl) {
          newTl.progress(1);
          tlRef.current = newTl;
        }
      } else {
        tlRef.current.kill();
        const newTl = createTimeline();
        if (newTl) {
          tlRef.current = newTl;
        }
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isExpanded]);

  useEffect(() => {
    if (isSheetOpen && window.innerWidth <= 900) {
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }
    return () => {
      document.body.classList.remove('modal-open');
    };
  }, [isSheetOpen]);

  const toggleMenu = () => {
    const tl = tlRef.current;
    if (!tl) return;
    if (!isExpanded) {
      setIsHamburgerOpen(true);
      setIsExpanded(true);
      tl.restart(); // Bulletproof: always restarts from 0 and plays forward
    } else {
      setIsHamburgerOpen(false);
      tl.reverse(); // onReverseComplete baked into timeline creation handles the rest
    }
  };

  const handleNavClick = (id) => {
    setActiveModule(id);
    if (isExpanded) toggleMenu();
    window.scrollTo(0, 0);
  };

  const handleTabClick = (tabId) => {
    if (tabId === 'home') {
      setIsSheetOpen(false);
      handleNavClick('home');
    } else {
      setSelectedSheetTab(tabId);
      setIsSheetOpen(true);
    }
  };

  const handleLinkClick = (moduleId) => {
    setIsSheetOpen(false);
    handleNavClick(moduleId);
  };

  const setCardRef = i => el => {
    if (el) cardsRef.current[i] = el;
  };

  return (
    <>
      <div className="card-nav-container">
        <nav ref={navRef} className={`card-nav ${isExpanded ? 'open' : ''}`}>
          <div className="card-nav-top">
            
            <div className="logo-container" onClick={() => handleNavClick('home')} style={{ cursor: 'pointer' }}>
              <img 
                src="/logo.png" 
                alt="KSU CUSAT Logo" 
                className="logo" 
                style={{ 
                  filter: theme === 'dark' ? 'brightness(0) invert(1)' : 'brightness(0)', 
                  opacity: 0.9 
                }}
              />
            </div>

            <div className="nav-actions-right">
              
              <button 
                className="theme-toggle" 
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '8px', borderRadius: '50%', color: 'var(--text-primary)' }}
              >
                {theme === 'dark' ? <i className="ti ti-sun" style={{fontSize: '20px'}}></i> : <i className="ti ti-moon" style={{fontSize: '20px'}}></i>}
              </button>

              {/* Mobile Dashboard Button for Dept Admin / Admin */}
              {(userRole === 'dept_admin' || userRole === 'admin') && (
                <button 
                  className="nav-dashboard-mobile-btn" 
                  onClick={() => handleNavClick('dept_dashboard')}
                >
                  <i className="ti ti-books"></i> Dashboard
                </button>
              )}

              <div className="nav-auth-desktop">
                {userRole === 'student' && loggedStudent && (
                  <span className="status-badge student" style={{ padding: '6px 14px', fontSize: '13px' }}>
                    <i className="ti ti-user-check" style={{ marginRight: '4px' }}></i>
                    {loggedStudent.full_name.split(' ')[0]}
                  </span>
                )}
                {userRole === 'dept_admin' && (
                  <button className="navbar-btn" onClick={() => handleNavClick('dept_dashboard')} style={{ background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-primary)', padding: '6px 14px' }}>
                     Dashboard
                  </button>
                )}
                {userRole === 'user' ? (
                  <button className="navbar-btn slide-in-btn" onClick={() => setShowAuthModal(true)}>
                    <i className="ti ti-login"></i> <span className="btn-text">Log In</span>
                  </button>
                ) : (
                  <button className="navbar-btn logout" onClick={logout}>
                    <i className="ti ti-logout"></i> Logout
                  </button>
                )}
              </div>

              <div
                className={`hamburger-menu ${isHamburgerOpen ? 'open' : ''}`}
                onClick={toggleMenu}
                role="button"
                aria-label={isExpanded ? 'Close menu' : 'Open menu'}
                tabIndex={0}
              >
                <div className="hamburger-line" />
                <div className="hamburger-line" />
              </div>
            </div>
          </div>

          <div className="card-nav-content" aria-hidden={!isExpanded}>
            {items.map((item, idx) => (
              <BorderGlow
                key={`${item.label}-${idx}`}
                className="nav-card"
                backgroundColor={item.bgColor}
                style={{ color: item.textColor }}
                borderRadius={16}
                glowRadius={30}
              >
                <div ref={setCardRef(idx)} style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                  <div className="nav-card-label">
                    <i className={`ti ${item.icon}`} style={{ fontSize: '22px' }}></i>
                    {item.label}
                  </div>
                  <div className="nav-card-links">
                    {item.links?.map((lnk, i) => (
                      <a 
                        key={`${lnk.label}-${i}`} 
                        className="nav-card-link" 
                        onClick={(e) => { e.preventDefault(); handleNavClick(lnk.id); }}
                      >
                        <i className={`ti ${lnk.icon} nav-card-link-icon`}></i>
                        {lnk.label}
                      </a>
                    ))}
                  </div>
                </div>
              </BorderGlow>
            ))}

            {/* Mobile specific auth panel inside the GSAP animated menu */}
            <div className="nav-auth-mobile nav-card" ref={setCardRef(items.length)} style={{ backgroundColor: 'var(--bg-hover)', border: '1px solid var(--border-color)' }}>
               {userRole === 'user' ? (
                  <button className="navbar-btn slide-in-btn" onClick={() => { setShowAuthModal(true); toggleMenu(); }} style={{ width: '100%', justifyContent: 'center' }}>
                    <i className="ti ti-login"></i> Log In
                  </button>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%' }}>
                    {loggedStudent && (
                      <span style={{ fontSize: '14px', color: 'var(--text-muted)', textAlign: 'center' }}>
                        Logged in as <b>{loggedStudent.full_name}</b>
                      </span>
                    )}
                    {userRole === 'dept_admin' && (
                      <button className="navbar-btn" onClick={() => handleNavClick('dept_dashboard')} style={{ width: '100%', justifyContent: 'center', background: 'var(--bg-hover)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}>
                        <i className="ti ti-books"></i> Dept Dashboard
                      </button>
                    )}
                    {(userRole === 'student' || userRole === 'dept_admin') && (
                      <button className="navbar-btn" onClick={() => handleNavClick('queries')} style={{ width: '100%', justifyContent: 'center', background: 'var(--bg-hover)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}>
                        <i className="ti ti-mail"></i> My Queries
                      </button>
                    )}
                    <button className="navbar-btn logout" onClick={() => { logout(); toggleMenu(); }} style={{ width: '100%', justifyContent: 'center' }}>
                      <i className="ti ti-logout"></i> Logout
                    </button>
                  </div>
                )}
            </div>

          </div>
        </nav>
      </div>

      {/* Mobile Bottom Tab Bar */}
      <div className="mobile-bottom-bar">
        <button 
          className={`mobile-tab-item ${currentTab === 'home' && !isSheetOpen ? 'active' : ''}`} 
          onClick={() => handleTabClick('home')}
        >
          <i className="ti ti-home-2"></i>
          <span>Home</span>
        </button>
        <button 
          className={`mobile-tab-item ${isSheetOpen && selectedSheetTab === 'stay' ? 'active' : (currentTab === 'stay' && !isSheetOpen ? 'active' : '')}`} 
          onClick={() => handleTabClick('stay')}
        >
          <i className="ti ti-building-community"></i>
          <span>Stay & PG</span>
        </button>
        <button 
          className={`mobile-tab-item ${isSheetOpen && selectedSheetTab === 'food' ? 'active' : (currentTab === 'food' && !isSheetOpen ? 'active' : '')}`} 
          onClick={() => handleTabClick('food')}
        >
          <i className="ti ti-tools-kitchen-2"></i>
          <span>Food</span>
        </button>
        <button 
          className={`mobile-tab-item ${isSheetOpen && selectedSheetTab === 'info' ? 'active' : (currentTab === 'info' && !isSheetOpen ? 'active' : '')}`} 
          onClick={() => handleTabClick('info')}
        >
          <i className="ti ti-info-circle"></i>
          <span>Info</span>
        </button>
        <button 
          className={`mobile-tab-item ${isSheetOpen && selectedSheetTab === 'menu' ? 'active' : (currentTab === 'menu' && !isSheetOpen ? 'active' : '')}`} 
          onClick={() => handleTabClick('menu')}
        >
          <i className="ti ti-menu-2"></i>
          <span>Menu</span>
        </button>
      </div>

      {/* Mobile Bottom Sheet Backdrop & Drawer */}
      <div className={`mobile-sheet-backdrop ${isSheetOpen ? 'open' : ''}`} onClick={() => setIsSheetOpen(false)} />
      <div className={`mobile-bottom-sheet ${isSheetOpen ? 'open' : ''}`}>
        <div className="sheet-handle" onClick={() => setIsSheetOpen(false)} />
        
        <div className="sheet-content">
          {selectedSheetTab === 'stay' && (
            <div className="sheet-section">
              <h3 className="sheet-section-title"><i className="ti ti-building-community"></i> Accommodations</h3>
              <div className="sheet-grid">
                <a className="sheet-grid-item" onClick={() => handleLinkClick('boysPgs')}>
                  <i className="ti ti-building-community"></i>
                  <span>Boys PG's</span>
                </a>
                <a className="sheet-grid-item" onClick={() => handleLinkClick('girlsPgs')}>
                  <i className="ti ti-home-2"></i>
                  <span>Girls PG's</span>
                </a>
                <a className="sheet-grid-item" onClick={() => handleLinkClick('hostels')}>
                  <i className="ti ti-building"></i>
                  <span>College Hostels</span>
                </a>
              </div>
            </div>
          )}

          {selectedSheetTab === 'food' && (
            <div className="sheet-section">
              <h3 className="sheet-section-title"><i className="ti ti-tools-kitchen-2"></i> Food & Dining</h3>
              <div className="sheet-grid">
                <a className="sheet-grid-item" onClick={() => handleLinkClick('food')}>
                  <i className="ti ti-coffee"></i>
                  <span>Tea Spots</span>
                </a>
                <a className="sheet-grid-item" onClick={() => handleLinkClick('restaurants')}>
                  <i className="ti ti-tools-kitchen-2"></i>
                  <span>Restaurants</span>
                </a>
              </div>
            </div>
          )}

          {selectedSheetTab === 'info' && (
            <div className="sheet-section">
              <h3 className="sheet-section-title"><i className="ti ti-info-circle"></i> Campus Info</h3>
              <div className="sheet-grid">
                <a className="sheet-grid-item" onClick={() => handleLinkClick('calendar')}>
                  <i className="ti ti-calendar"></i>
                  <span>Calendar</span>
                </a>
                <a className="sheet-grid-item" onClick={() => handleLinkClick('contacts')}>
                  <i className="ti ti-building"></i>
                  <span>Departments</span>
                </a>
                <a className="sheet-grid-item" onClick={() => handleLinkClick('helpdesk')}>
                  <i className="ti ti-headset"></i>
                  <span>Helpdesk Directory</span>
                </a>
                <a className="sheet-grid-item" onClick={() => handleLinkClick('amenities')}>
                  <i className="ti ti-map-pin"></i>
                  <span>Amenities</span>
                </a>
              </div>
            </div>
          )}

          {selectedSheetTab === 'menu' && (
            <div className="sheet-section full-menu">
              <h3 className="sheet-section-title"><i className="ti ti-menu-2"></i> Main Menu</h3>
              
              {userRole === 'student' && loggedStudent ? (
                <div className="sheet-profile-card">
                  <div className="profile-info">
                    <i className="ti ti-user-check" style={{ fontSize: '24px', color: 'var(--primary-color)' }}></i>
                    <div>
                      <div className="profile-name">{loggedStudent.full_name}</div>
                      <div className="profile-role">Student Portal</div>
                    </div>
                  </div>
                </div>
              ) : null}

              <div className="sheet-grid">
                {/* Stay Links */}
                <a className="sheet-grid-item" onClick={() => handleLinkClick('boysPgs')}>
                  <i className="ti ti-building-community"></i>
                  <span>Boys PG's</span>
                </a>
                <a className="sheet-grid-item" onClick={() => handleLinkClick('girlsPgs')}>
                  <i className="ti ti-home-2"></i>
                  <span>Girls PG's</span>
                </a>
                <a className="sheet-grid-item" onClick={() => handleLinkClick('hostels')}>
                  <i className="ti ti-building"></i>
                  <span>College Hostels</span>
                </a>

                {/* Food Links */}
                <a className="sheet-grid-item" onClick={() => handleLinkClick('food')}>
                  <i className="ti ti-coffee"></i>
                  <span>Tea Spots</span>
                </a>
                <a className="sheet-grid-item" onClick={() => handleLinkClick('restaurants')}>
                  <i className="ti ti-tools-kitchen-2"></i>
                  <span>Restaurants</span>
                </a>

                {/* Info Links */}
                <a className="sheet-grid-item" onClick={() => handleLinkClick('calendar')}>
                  <i className="ti ti-calendar"></i>
                  <span>Calendar</span>
                </a>
                <a className="sheet-grid-item" onClick={() => handleLinkClick('contacts')}>
                  <i className="ti ti-building"></i>
                  <span>Departments</span>
                </a>
                <a className="sheet-grid-item" onClick={() => handleLinkClick('helpdesk')}>
                  <i className="ti ti-headset"></i>
                  <span>Helpdesk Directory</span>
                </a>
                <a className="sheet-grid-item" onClick={() => handleLinkClick('amenities')}>
                  <i className="ti ti-map-pin"></i>
                  <span>Amenities</span>
                </a>

                {/* Campus Life Links */}
                <a className="sheet-grid-item" onClick={() => handleLinkClick('clubs')}>
                  <i className="ti ti-users"></i>
                  <span>Clubs</span>
                </a>
                <a className="sheet-grid-item" onClick={() => handleLinkClick('turfs')}>
                  <i className="ti ti-ball-football"></i>
                  <span>Turfs & Arenas</span>
                </a>
                <a className="sheet-grid-item" onClick={() => handleLinkClick('academic_resources')}>
                  <i className="ti ti-books"></i>
                  <span>Academics</span>
                </a>

                {/* Conditional queries/dashboard links */}
                {(userRole === 'student' || userRole === 'dept_admin') && (
                  <a className="sheet-grid-item" onClick={() => handleLinkClick('queries')}>
                    <i className="ti ti-mail"></i>
                    <span>My Queries</span>
                  </a>
                )}
                {(userRole === 'dept_admin' || userRole === 'admin') && (
                  <a className="sheet-grid-item" onClick={() => handleLinkClick('dept_dashboard')}>
                    <i className="ti ti-books"></i>
                    <span>Dashboard</span>
                  </a>
                )}
              </div>

              <div className="sheet-actions">
                {userRole === 'user' ? (
                  <button className="navbar-btn slide-in-btn" onClick={() => { setShowAuthModal(true); setIsSheetOpen(false); }} style={{ width: '100%', justifyContent: 'center' }}>
                    <i className="ti ti-login"></i> Log In
                  </button>
                ) : (
                  <button className="navbar-btn logout" onClick={() => { logout(); setIsSheetOpen(false); }} style={{ width: '100%', justifyContent: 'center' }}>
                    <i className="ti ti-logout"></i> Logout
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default CardNav;
