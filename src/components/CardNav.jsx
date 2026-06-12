import React, { useLayoutEffect, useRef, useState, useEffect } from 'react';
import { gsap } from 'gsap';
import './CardNav.css';

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
  const navRef = useRef(null);
  const cardsRef = useRef([]);
  const tlRef = useRef(null);

  // Define nav items mapping
  const items = [
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
        { id: 'contacts', label: 'Departments', icon: 'ti-building' }
      ]
    },
    {
      id: 'campus_life',
      label: 'Campus Life',
      icon: 'ti-users',
      bgColor: theme === 'dark' ? '#3b2512' : '#fff7ed',
      textColor: theme === 'dark' ? '#e2e8f0' : '#0f172a',
      links: [
        { id: 'amenities', label: 'Amenities', icon: 'ti-map-pin' },
        { id: 'clubs', label: 'Clubs', icon: 'ti-users' },
        { id: 'turfs', label: 'Turfs & Arenas', icon: 'ti-ball-football' },
        { id: 'academic_resources', label: 'Academic Resources', icon: 'ti-books' }
      ]
    }
  ];

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

    gsap.set(navEl, { height: 64 });
    const validCards = cardsRef.current.filter(el => el != null);
    gsap.set(validCards, { y: 30, opacity: 0 });

    const tl = gsap.timeline({ paused: true });

    tl.to(navEl, {
      height: calculateHeight,
      duration: 0.4,
      ease: 'power3.out'
    });

    tl.to(validCards, { y: 0, opacity: 1, duration: 0.4, ease: 'power3.out', stagger: 0.05 }, '-=0.2');

    return tl;
  };

  useLayoutEffect(() => {
    const tl = createTimeline();
    tlRef.current = tl;

    return () => {
      tl?.kill();
      tlRef.current = null;
    };
  }, [items]);

  useLayoutEffect(() => {
    const handleResize = () => {
      if (!tlRef.current) return;

      if (isExpanded) {
        const newHeight = calculateHeight();
        gsap.set(navRef.current, { height: newHeight });

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

  const toggleMenu = () => {
    const tl = tlRef.current;
    if (!tl) return;
    if (!isExpanded) {
      setIsHamburgerOpen(true);
      setIsExpanded(true);
      tl.play(0);
    } else {
      setIsHamburgerOpen(false);
      tl.eventCallback('onReverseComplete', () => setIsExpanded(false));
      tl.reverse();
    }
  };

  const handleNavClick = (id) => {
    setActiveModule(id);
    if (isExpanded) toggleMenu();
    window.scrollTo(0, 0);
  };

  const setCardRef = i => el => {
    if (el) cardsRef.current[i] = el;
  };

  return (
    <div className="card-nav-container">
      <nav ref={navRef} className={`card-nav ${isExpanded ? 'open' : ''}`}>
        <div className="card-nav-top">
          
          <div className="logo-container" onClick={() => handleNavClick('home')} style={{ cursor: 'pointer' }}>
            <img 
              src="/logo.png" 
              alt="KSU CUSAT Logo" 
              className="logo" 
              style={{ filter: theme === 'dark' ? 'none' : 'invert(1)', mixBlendMode: theme === 'dark' ? 'screen' : 'multiply' }}
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
            <div
              key={`${item.label}-${idx}`}
              className="nav-card"
              ref={setCardRef(idx)}
              style={{ backgroundColor: item.bgColor, color: item.textColor }}
            >
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
          ))}

          {/* Mobile specific auth panel inside the GSAP animated menu */}
          <div className="nav-auth-mobile nav-card" ref={setCardRef(items.length)} style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--border-color)' }}>
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
                    <button className="navbar-btn" onClick={() => handleNavClick('dept_dashboard')} style={{ width: '100%', justifyContent: 'center', background: 'var(--card-bg)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}>
                      <i className="ti ti-books"></i> Dept Dashboard
                    </button>
                  )}
                  {(userRole === 'student' || userRole === 'dept_admin') && (
                    <button className="navbar-btn" onClick={() => handleNavClick('queries')} style={{ width: '100%', justifyContent: 'center', background: 'var(--card-bg)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}>
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
  );
};

export default CardNav;
