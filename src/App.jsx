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
  const [restaurantCuisineFilter, setRestaurantCuisineFilter] = useState('all');
  const [amenitySearch, setAmenitySearch] = useState('');
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

  const filteredRestaurants = restaurants.filter((item) => {
    const textMatch =
      contains(item.name, restaurantSearch) ||
      contains(item.location, restaurantSearch) ||
      contains(item.cuisine, restaurantSearch);

    const cuisineMatch =
      restaurantCuisineFilter === 'all'
        ? true
        : contains(item.cuisine, restaurantCuisineFilter);

    return textMatch && cuisineMatch;
  });

  const filteredAmenities = amenities.filter(
    (item) =>
      contains(item.name, amenitySearch) ||
      contains(item.location, amenitySearch) ||
      contains(item.details, amenitySearch) ||
      contains(item.category, amenitySearch)
  );

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
              <select
                value={restaurantCuisineFilter}
                onChange={(e) => setRestaurantCuisineFilter(e.target.value)}
              >
                <option value="all">All cuisines</option>
                <option value="kerala">Kerala</option>
                <option value="fast">Fast food</option>
                <option value="arabic">Arabic</option>
                <option value="chinese">Chinese</option>
                <option value="veg">Veg</option>
              </select>
            </div>
            <ListingGrid
              items={filteredRestaurants}
              fields={['location', 'cuisine', 'priceRange', 'description', 'contact']}
            />
          </BorderGlow>
        )}

        {activeModule === 'amenities' && (
          <BorderGlow className="card">
            <h2>Amenities</h2>
            <div className="filter-bar">
              <input
                type="text"
                placeholder="Search amenities by name, category, location, or details"
                value={amenitySearch}
                onChange={(e) => setAmenitySearch(e.target.value)}
              />
            </div>
            <ListingGrid items={filteredAmenities} fields={['category', 'location', 'details']} />
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
      <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 0 }}>
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
