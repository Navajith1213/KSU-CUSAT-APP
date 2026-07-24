import React, { useState, useEffect, Suspense, lazy } from 'react';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import AuthModal from './components/Modals/AuthModal';
import PasswordResetModal from './components/Modals/PasswordResetModal';
import Home from './components/Home';
import CardNav from './components/CardNav';
import Chatbot from './components/Chatbot';
import SocialSpeedDial from './components/SocialSpeedDial';
import ScrollToTop from './components/ScrollToTop';
import { supabase } from './utils/supabaseClient';
import JoinKSUForm from './components/JoinKSUForm';
import ColorBends from './components/ColorBends';
import BorderGlow from './components/BorderGlow';

const ListingGrid = lazy(() => import('./components/ListingGrid'));
const ContactList = lazy(() => import('./components/ContactList'));
const AdminDashboard = lazy(() => import('./components/Admin/AdminDashboard'));
const AdminQueries = lazy(() => import('./components/Admin/AdminQueries'));
const QueryPanel = lazy(() => import('./components/QueryPanel'));
const AcademicResources = lazy(() => import('./components/AcademicResources'));
const DepartmentDashboard = lazy(() => import('./components/DepartmentDashboard'));
const CampusInfo = lazy(() => import('./components/CampusInfo'));
const HelpdeskDirectory = lazy(() => import('./components/HelpdeskDirectory'));




export default function App() {
  const [userRole, setUserRole] = useState('user');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showPasswordResetModal, setShowPasswordResetModal] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');
  const [isLoading, setIsLoading] = useState(true);
  const [isSpeedDialOpen, setIsSpeedDialOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);


  useEffect(() => {
    if (theme === 'dark') {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Student session state
  const [loggedStudent, setLoggedStudent] = useState(() => {
    try {
      const session = sessionStorage.getItem('student_session');
      return session ? JSON.parse(session) : null;
    } catch (_) {
      return null;
    }
  });

  // Git credentials in memory or session storage
      
  const [activeModule, setActiveModule] = useState(() => sessionStorage.getItem('active_module') || 'home');

  useEffect(() => {
    // Listen for password recovery events
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        setShowPasswordResetModal(true);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    sessionStorage.setItem('active_module', activeModule);
    window.scrollTo(0, 0);
  }, [activeModule]);

  // Main data states
  const [academicEvents, setAcademicEvents] = useState([]);
  const [boysPgs, setBoysPgs] = useState([]);
  const [girlsPgs, setGirlsPgs] = useState([]);
  const [hostels, setHostels] = useState([]);
  const [foodSpots, setFoodSpots] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [amenities, setAmenities] = useState([]);
  const [clubs, setClubs] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [turfs, setTurfs] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [helpdeskContacts, setHelpdeskContacts] = useState([]);


  // Search/Filter states
  const [boysPgSearch, setBoysPgSearch] = useState('');
  const [girlsPgSearch, setGirlsPgSearch] = useState('');
  const [hostelSearch, setHostelSearch] = useState('');
  const [hostelTypeFilter, setHostelTypeFilter] = useState('all');
  const [foodSearch, setFoodSearch] = useState('');
  const [restaurantSearch, setRestaurantSearch] = useState('');
  const [amenitySearch, setAmenitySearch] = useState('');
  const [amenitySortBy, setAmenitySortBy] = useState('name-asc');
  const [selectedAmenityCategory, setSelectedAmenityCategory] = useState('all');
  const [clubSearch, setClubSearch] = useState('');
  const [turfSearch, setTurfSearch] = useState('');

  // Auto login on mount if session keys exist
  useEffect(() => {
    const session = sessionStorage.getItem('student_session');
    if (session) {
      try {
        const parsed = JSON.parse(session);
        if (parsed.department) {
          setUserRole('dept_admin');
        } else {
          setUserRole('student');
        }
      } catch(e) {
        setUserRole('student');
      }
    }
  }, []);

  // Intercept unauthorized access to queries page and trigger login modal
  useEffect(() => {
    if (activeModule === 'queries' && userRole !== 'student' && userRole !== 'dept_admin') {
      setActiveModule('home');
      setShowAuthModal(true);
      alert('Please log in or register to your student account to file a grievance.');
    }
  }, [activeModule, userRole]);



  const logout = () => {
    sessionStorage.clear();
    setLoggedStudent(null);
    setUserRole('user');
    setActiveModule('home');
    alert('Logged out successfully.');
  };

  const fetchStaticData = async () => {
    try {
      const tables = [
        { name: 'events', setter: setAcademicEvents },
        { name: 'boys_pgs', setter: setBoysPgs },
        { name: 'girls_pgs', setter: setGirlsPgs },
        { name: 'hostels', setter: setHostels },
        { name: 'food_spots', setter: setFoodSpots },
        { name: 'restaurants', setter: setRestaurants },
        { name: 'amenities', setter: setAmenities },
        { name: 'clubs', setter: setClubs },
        { name: 'contacts', setter: setContacts },
        { name: 'turfs', setter: setTurfs },
        { name: 'announcements', setter: setAnnouncements },
        { name: 'helpdesk_contacts', setter: setHelpdeskContacts }
      ];

      // Fetch all tables concurrently instead of sequentially
      await Promise.all(tables.map(async ({ name, setter }) => {
        const { data, error } = await supabase.from(name).select('*');
        if (!error && data) {
          const formatted = data.map(row => ({ id: row.id, ...row.data }));
          setter(formatted);
        }
      }));
    } catch (err) {
      console.error("Error fetching static data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStaticData();
  }, []);


  const contains = (value, search) => (value || '').toLowerCase().includes(search.toLowerCase());

  // Filter calculations
  const filteredBoysPgs = boysPgs.filter(
    (item) =>
      contains(item.name, boysPgSearch) ||
      contains(item.location, boysPgSearch) ||
      contains(item.food, boysPgSearch)
  );

  const filteredGirlsPgs = girlsPgs.filter(
    (item) =>
      contains(item.name, girlsPgSearch) ||
      contains(item.location, girlsPgSearch) ||
      contains(item.food, girlsPgSearch)
  );

  const filteredHostels = hostels.filter((item) => {
    const textMatch =
      contains(item.name, hostelSearch) ||
      contains(item.location, hostelSearch) ||
      contains(item.food, hostelSearch);

    const typeMatch =
      hostelTypeFilter === 'all'
        ? true
        : item.type === hostelTypeFilter;

    return textMatch && typeMatch;
  });

  const filteredFoodSpots = foodSpots.filter(
    (item) =>
      contains(item.name, foodSearch) ||
      contains(item.location, foodSearch) ||
      contains(item.description || item.specialty, foodSearch)
  );

  const filteredRestaurants = restaurants.filter(
    (item) =>
      contains(item.name, restaurantSearch) ||
      contains(item.location, restaurantSearch) ||
      contains(item.cuisine, restaurantSearch)
  );

  const matchesAmenityCategory = (item, cat) => {
    if (cat === 'all') return true;
    const categoryLower = (item.category || '').toLowerCase();
    
    if (cat === 'stationery') {
      return (
        categoryLower.includes('station') || 
        categoryLower.includes('print') || 
        categoryLower.includes('xerox') || 
        categoryLower.includes('photostat') || 
        categoryLower.includes('binding') ||
        categoryLower.includes('common service')
      );
    }
    if (cat === 'medical') {
      return (
        categoryLower.includes('pharmac') || 
        categoryLower.includes('clinic') || 
        categoryLower.includes('medical') || 
        categoryLower.includes('hospital') || 
        categoryLower.includes('gym') ||
        categoryLower.includes('fitness')
      );
    }
    if (cat === 'banking') {
      return (
        categoryLower.includes('bank') || 
        categoryLower.includes('atm')
      );
    }
    if (cat === 'services') {
      return (
        (categoryLower.includes('post') || 
        categoryLower.includes('workshop') || 
        categoryLower.includes('utility') || 
        categoryLower.includes('service') ||
        categoryLower.includes('amenity')) && 
        !categoryLower.includes('common service')
      );
    }
    return false;
  };

  const filteredAmenities = amenities
    .filter(
      (item) =>
        contains(item.name, amenitySearch) ||
        contains(item.location, amenitySearch) ||
        contains(item.details, amenitySearch) ||
        contains(item.category, amenitySearch)
    )
    .filter((item) => matchesAmenityCategory(item, selectedAmenityCategory))
    .sort((a, b) => {
      if (amenitySortBy === 'name-asc') {
        return (a.name || '').localeCompare(b.name || '');
      } else if (amenitySortBy === 'name-desc') {
        return (b.name || '').localeCompare(a.name || '');
      } else if (amenitySortBy === 'category-asc') {
        return (a.category || '').localeCompare(b.category || '');
      }
      return 0;
    });

  const filteredClubs = clubs.filter(
    (item) =>
      contains(item.name, clubSearch) ||
      contains(item.location, clubSearch) ||
      contains(item.description, clubSearch)
  );

  const filteredTurfs = turfs.filter(
    (item) =>
      contains(item.name, turfSearch) ||
      contains(item.location, turfSearch) ||
      contains(item.facilities, turfSearch)
  );

  const renderModuleContent = () => {
    return (
      <Suspense fallback={<div style={{ display: 'flex', justifyContent: 'center', padding: '100px 0', color: 'var(--text-muted)' }}>Loading...</div>}>
      <div key={activeModule} className="fade-in-section">
        {['calendar', 'contacts', 'boysPgs', 'girlsPgs', 'hostels', 'food', 'restaurants', 'amenities', 'clubs', 'turfs', 'queries', 'helpdesk'].includes(activeModule) && (
          <button
            onClick={() => setActiveModule('home')}
            className="back-btn"
          >
            <i className="ti ti-arrow-left"></i> Back to Home
          </button>
        )}

        {activeModule === 'home' && (
          <Home 
            academicEvents={academicEvents}
            boysPgs={boysPgs}
            girlsPgs={girlsPgs}
            hostels={hostels}
            foodSpots={foodSpots}
            restaurants={restaurants}
            amenities={amenities}
            clubs={clubs}
            setActiveModule={setActiveModule}
            announcements={announcements}
            loggedStudent={loggedStudent}
            setShowAuthModal={setShowAuthModal}
            userRole={userRole}
          />
        )}
        {activeModule === 'join_ksu' && <JoinKSUForm setActiveModule={setActiveModule} />}
        {activeModule === 'academic_resources' && <AcademicResources userRole={userRole} setShowAuthModal={setShowAuthModal} />}
        {activeModule === 'contacts' && <ContactList contacts={contacts} />}

        {activeModule === 'calendar' && (
          <CampusInfo academicEvents={academicEvents} />
        )}

        {activeModule === 'helpdesk' && (
          <HelpdeskDirectory helpdeskContacts={helpdeskContacts} />
        )}

        {activeModule === 'boysPgs' && (
          <BorderGlow className="card">
            <div className="module-header">
              <h2>Boys PG's</h2>
            </div>
            <div style={{ padding: '12px 16px', backgroundColor: 'rgba(2, 132, 199, 0.1)', border: '1px solid rgba(2, 132, 199, 0.2)', borderRadius: '12px', marginBottom: '16px', display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
              <i className="ti ti-clock" style={{ fontSize: '20px', color: '#0284c7', marginTop: '2px' }}></i>
              <div>
                <h4 style={{ margin: 0, fontSize: '14px', color: 'var(--text-primary)' }}>Curfew Time Information</h4>
                <p style={{ margin: '2px 0 0', fontSize: '13px', color: 'var(--text-secondary)' }}>Standard curfew is usually around <strong>9:30 PM</strong> for most PG accommodations. Please verify exact timings with the respective owners.</p>
              </div>
            </div>
            <div className="filter-bar">
              <input
                type="text"
                placeholder="Search by name, location, or food"
                value={boysPgSearch}
                onChange={(e) => setBoysPgSearch(e.target.value)}
              />
            </div>
            <ListingGrid
              items={filteredBoysPgs}
              fields={['location', 'rent', 'food', 'contact', 'rooms']}
            />
          </BorderGlow>
        )}

        {activeModule === 'girlsPgs' && (
          <BorderGlow className="card">
            <div className="module-header">
              <h2>Girls PG's</h2>
            </div>
            <div style={{ padding: '12px 16px', backgroundColor: 'rgba(236, 72, 153, 0.1)', border: '1px solid rgba(236, 72, 153, 0.2)', borderRadius: '12px', marginBottom: '16px', display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
              <i className="ti ti-clock" style={{ fontSize: '20px', color: '#ec4899', marginTop: '2px' }}></i>
              <div>
                <h4 style={{ margin: 0, fontSize: '14px', color: 'var(--text-primary)' }}>Curfew Time Information</h4>
                <p style={{ margin: '2px 0 0', fontSize: '13px', color: 'var(--text-secondary)' }}>Standard curfew is usually <strong>6:30 PM</strong> for most PG accommodations (As per general rules). Please verify exact timings with the respective owners.</p>
              </div>
            </div>
            <div className="filter-bar">
              <input
                type="text"
                placeholder="Search by name, location, or food"
                value={girlsPgSearch}
                onChange={(e) => setGirlsPgSearch(e.target.value)}
              />
            </div>
            <ListingGrid
              items={filteredGirlsPgs}
              fields={['location', 'rent', 'food', 'contact', 'rooms']}
            />
          </BorderGlow>
        )}

        {activeModule === 'hostels' && (
          <BorderGlow className="card">
            <div className="module-header">
              <h2>College Hostels</h2>
            </div>
            <div className="filter-bar">
              <input
                type="text"
                placeholder="Search by name, location, or food"
                value={hostelSearch}
                onChange={(e) => setHostelSearch(e.target.value)}
              />
              <select
                value={hostelTypeFilter}
                onChange={(e) => setHostelTypeFilter(e.target.value)}
              >
                <option value="all">All Hostels</option>
                <option value="Mens">Men's Hostels</option>
                <option value="Ladies">Ladies' Hostels</option>
              </select>
            </div>
            <ListingGrid
              items={filteredHostels}
              fields={['type', 'location', 'fees', 'food', 'wardenContact', 'secretaryContact', 'rooms']}
            />
          </BorderGlow>
        )}

        {activeModule === 'food' && (
          <BorderGlow className="card">
            <h2>Tea Spots</h2>
            <div className="filter-bar">
              <input
                type="text"
                placeholder="Search tea spots by name, location, or description"
                value={foodSearch}
                onChange={(e) => setFoodSearch(e.target.value)}
              />
            </div>
            <ListingGrid
              items={filteredFoodSpots}
              fields={['location', 'description', 'timing']}
            />
          </BorderGlow>
        )}

        {activeModule === 'restaurants' && (
          <BorderGlow className="card">
            <h2>Restaurants</h2>
            <div className="filter-bar">
              <input
                type="text"
                placeholder="Search restaurants by name, location, or cuisine"
                value={restaurantSearch}
                onChange={(e) => setRestaurantSearch(e.target.value)}
              />
            </div>
            <ListingGrid
              items={filteredRestaurants}
              fields={['location', 'cuisine', 'priceRange', 'description', 'contact']}
            />
          </BorderGlow>
        )}

        {activeModule === 'amenities' && (
          <BorderGlow className="card">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
                <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <i className="ti ti-map-pin" style={{ color: '#0284c7' }}></i>
                  Campus Amenities & Shops
                </h2>
                
                {/* Category Pill Tab Buttons */}
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {[
                    { id: 'all', label: 'All', icon: 'ti-map-pin' },
                    { id: 'stationery', label: 'Stationery & Xerox', icon: 'ti-file-text' },
                    { id: 'medical', label: 'Medical & Health', icon: 'ti-heart-medical' },
                    { id: 'banking', label: 'Banking & ATM', icon: 'ti-building-bank' },
                    { id: 'services', label: 'Services & Utility', icon: 'ti-settings' }
                  ].map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedAmenityCategory(cat.id)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '6px 12px',
                        borderRadius: '20px',
                        border: '1px solid',
                        borderColor: selectedAmenityCategory === cat.id ? '#0284c7' : 'var(--border-color)',
                        background: selectedAmenityCategory === cat.id ? '#0284c7' : 'transparent',
                        color: selectedAmenityCategory === cat.id ? '#ffffff' : 'var(--text-muted)',
                        fontSize: '13px',
                        fontWeight: '500',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        outline: 'none'
                      }}
                    >
                      <i className={`ti ${cat.icon}`}></i>
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Search & Sort Controls Row */}
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                <input
                  type="text"
                  placeholder="Search amenities by name, category, location, or details..."
                  value={amenitySearch}
                  onChange={(e) => setAmenitySearch(e.target.value)}
                  style={{
                    flex: 1,
                    padding: '10px 16px',
                    borderRadius: '12px',
                    border: '1px solid var(--border-color)',
                    background: 'var(--bg-card, #ffffff)',
                    color: 'var(--text-primary, #0f172a)',
                    fontSize: '14.5px',
                    fontWeight: '600',
                    outline: 'none',
                    transition: 'all 0.2s ease'
                  }}
                />
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: '500', whiteSpace: 'nowrap' }}>
                    <i className="ti ti-arrows-sort" style={{ marginRight: '4px', verticalAlign: 'middle' }}></i>
                    Sort:
                  </span>
                  <select
                    value={amenitySortBy}
                    onChange={(e) => setAmenitySortBy(e.target.value)}
                    style={{
                      padding: '10px 16px',
                      paddingRight: '32px',
                      borderRadius: '12px',
                      border: '1px solid var(--border-color)',
                      background: 'var(--bg-card, #ffffff)',
                      color: 'var(--text-primary, #0f172a)',
                      fontSize: '14.5px',
                      fontWeight: '600',
                      outline: 'none',
                      cursor: 'pointer',
                      WebkitAppearance: 'none',
                      MozAppearance: 'none',
                      appearance: 'none',
                      backgroundImage: 'url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%2364748b\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3e%3cpath d=\'m6 9 6 6 6-6\'/%3e%3c/svg%3e")',
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: 'right 12px center',
                      backgroundSize: '16px'
                    }}
                  >
                    <option value="name-asc">Name (A-Z)</option>
                    <option value="name-desc">Name (Z-A)</option>
                    <option value="category-asc">Category (A-Z)</option>
                  </select>
                </div>
              </div>

              {filteredAmenities.length > 0 ? (
                <ListingGrid items={filteredAmenities} fields={['category', 'location', 'details']} />
              ) : (
                <div style={{ textAlign: 'center', padding: '36px 0', color: 'var(--text-muted)' }}>
                  <i className="ti ti-map-pin" style={{ fontSize: '48px', opacity: 0.5, marginBottom: '8px', display: 'block' }}></i>
                  <p style={{ margin: 0 }}>No amenities found in this category.</p>
                </div>
              )}
            </div>
          </BorderGlow>
        )}

        {activeModule === 'clubs' && (
          <BorderGlow className="card">
            <h2>Campus Clubs</h2>
            <div className="filter-bar">
              <input
                type="text"
                placeholder="Search clubs by name, location, or description..."
                value={clubSearch}
                onChange={(e) => setClubSearch(e.target.value)}
              />
            </div>
            <ListingGrid
              items={filteredClubs}
              fields={['location', 'contact', 'description']}
              requireGmapsForNavigation={true}
            />
          </BorderGlow>
        )}

        {activeModule === 'turfs' && (
          <BorderGlow className="card">
            <div className="module-header">
              <h2>Turfs & Sports Arenas</h2>
            </div>
            <div className="filter-bar">
              <input
                type="text"
                placeholder="Search turfs by name, location, or facilities..."
                value={turfSearch}
                onChange={(e) => setTurfSearch(e.target.value)}
              />
            </div>
            <ListingGrid
              items={filteredTurfs}
              fields={['location', 'facilities', 'rent', 'timing', 'contact']}
            />
          </BorderGlow>
        )}

        {activeModule === 'dept_dashboard' && (userRole === 'dept_admin' || userRole === 'admin') && (
          <DepartmentDashboard loggedStudent={loggedStudent} />
        )}

        {activeModule === 'queries' && (userRole === 'student' || userRole === 'dept_admin') && (
          <QueryPanel loggedStudent={loggedStudent} contacts={contacts} />
        )}

        {activeModule === 'admin' && userRole === 'admin' && (
          <AdminDashboard
            academicEvents={academicEvents}
            setAcademicEvents={setAcademicEvents}
            contacts={contacts}
            setContacts={setContacts}
            boysPgs={boysPgs}
            setBoysPgs={setBoysPgs}
            girlsPgs={girlsPgs}
            setGirlsPgs={setGirlsPgs}
            hostels={hostels}
            setHostels={setHostels}
            foodSpots={foodSpots}
            setFoodSpots={setFoodSpots}
            restaurants={restaurants}
            setRestaurants={setRestaurants}
            amenities={amenities}
            setAmenities={setAmenities}
            clubs={clubs}
            setClubs={setClubs}
            turfs={turfs}
            setTurfs={setTurfs}
            announcements={announcements}
            setAnnouncements={setAnnouncements}
            helpdeskContacts={helpdeskContacts}
            setHelpdeskContacts={setHelpdeskContacts}
            loggedStudent={loggedStudent}
          />
        )}
        
        {activeModule === 'admin_dashboard' && userRole === 'admin' && (
          <AdminDashboard />
        )}
        {activeModule === 'admin-queries' && userRole === 'admin' && (
          <AdminQueries />
        )}
      </div>
      </Suspense>
    );
  };

  return (
    <>
      {/* Background WebGL canvas rendered only on the Home page for desktop screens to maximize CPU/GPU speed */}
      {activeModule === 'home' && !isMobile && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 0, pointerEvents: 'none' }}>
          <ColorBends
            colors={["#e0f2fe", "#93c5fd", "#3b82f6"]}
            rotation={45}
            speed={0.15}
            scale={1.2}
            frequency={0.8}
            warpStrength={1.5}
            mouseInfluence={1}
            noise={0.05}
            parallax={0.2}
            iterations={2}
            intensity={1.2}
            bandWidth={4}
            transparent={true}
          />
        </div>
      )}

      {isLoading ? (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg-main)', backdropFilter: 'blur(10px)' }}>
          <img src="/logo.png" alt="Loading" style={{ height: '140px', objectFit: 'contain', marginBottom: '20px', animation: 'pulse 1.5s infinite' }} />
          <div style={{ color: 'var(--text-primary)', fontSize: '18px', fontWeight: '600' }}>Fetching Dashboard...</div>
        </div>
      ) : null}

      <div style={{ position: 'relative', zIndex: 1, width: '100%', height: '100%' }}>
      {userRole === 'admin' ? (
        <div className="portal-layout">
          <Sidebar
            userRole={userRole}
            activeModule={activeModule}
            setActiveModule={setActiveModule}
            logout={logout}
          />

          <div className="main-area">
            <Topbar userRole={userRole} theme={theme} setTheme={setTheme} />

            <div className="content">


              {renderModuleContent()}
            </div>
          </div>
        </div>
      ) : (
        <div className="website-layout" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          <CardNav
            userRole={userRole}
            activeModule={activeModule}
            setActiveModule={setActiveModule}
            setShowAuthModal={setShowAuthModal}
            logout={logout}
            loggedStudent={loggedStudent}
            theme={theme}
            setTheme={setTheme}
          />
          <main className="content website-content">
            {renderModuleContent()}
          </main>

          <footer className="footer">
            <div className="footer-container">
              <div className="footer-brand" style={{ cursor: 'pointer' }} onClick={() => { setActiveModule('home'); window.scrollTo(0, 0); }}>
                <img 
                  src="/logo.png" 
                  alt="CUSAT Portal" 
                  style={{ 
                    height: '40px', 
                    objectFit: 'contain', 
                    backgroundColor: 'transparent', 
                    padding: '4px 0', 
                    marginBottom: '12px',
                    display: 'inline-block'
                  }} 
                />
                <p>Your ultimate campus assistant for staying, dining, and navigating Cochin University of Science and Technology.</p>
              </div>
              <div className="footer-links">
                <h4>Quick Links</h4>
                <ul style={{ listStyle: 'none', padding: 0 }}>
                  <li>
                    <button
                      onClick={() => setActiveModule('home')}
                      style={{ color: 'var(--text-muted)', background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px 0', fontSize: '13.5px', fontWeight: '500' }}
                    >
                      Home
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => setActiveModule('calendar')}
                      style={{ color: 'var(--text-muted)', background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px 0', fontSize: '13.5px', fontWeight: '500' }}
                    >
                      Calendar
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => setActiveModule('contacts')}
                      style={{ color: 'var(--text-muted)', background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px 0', fontSize: '13.5px', fontWeight: '500' }}
                    >
                      Contacts
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => setActiveModule('food')}
                      style={{ color: 'var(--text-muted)', background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px 0', fontSize: '13.5px', fontWeight: '500' }}
                    >
                      Tea Spots
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => setActiveModule('hostels')}
                      style={{ color: 'var(--text-muted)', background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px 0', fontSize: '13.5px', fontWeight: '500' }}
                    >
                      Hostels
                    </button>
                  </li>
                </ul>
              </div>
              <div className="footer-contact">
                <h4>Contact Info</h4>
                <p><i className="ti ti-mail" style={{ marginRight: '8px' }}></i> ksucusatofficial@gmail.com</p>
                <p><i className="ti ti-phone" style={{ marginRight: '8px' }}></i> Moh Rashid (President): +91 7025016468</p>
                <p><i className="ti ti-map-pin" style={{ marginRight: '8px' }}></i> Kalamassery, Kochi, Kerala</p>
              </div>
            </div>
            <div className="footer-bottom">
              &copy; {new Date().getFullYear()} - Initiative by the KSU DCS Subcommittee
            </div>
          </footer>
        </div>
      )}
      </div>

      {showAuthModal && (
        <AuthModal
          contacts={contacts}
          setUserRole={setUserRole}
          setLoggedStudent={setLoggedStudent}
          setShowAuthModal={setShowAuthModal}
        />
      )}
      
      {showPasswordResetModal && (
        <PasswordResetModal onClose={() => setShowPasswordResetModal(false)} />
      )}
      {/* Always render chatbot globally */}
      <ScrollToTop isSpeedDialOpen={isSpeedDialOpen} />
      <SocialSpeedDial isOpen={isSpeedDialOpen} setIsOpen={setIsSpeedDialOpen} />
      <Chatbot onNavigate={(id) => setActiveModule(id)} />
    </>
  );
}
