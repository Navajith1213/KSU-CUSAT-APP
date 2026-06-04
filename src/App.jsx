import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import AuthModal from './components/Modals/AuthModal';
import Home from './components/Home';
import ListingGrid from './components/ListingGrid';
import ContactList from './components/ContactList';
import AdminDashboard from './components/Admin/AdminDashboard';
import QueryPanel from './components/QueryPanel';

import {
  defaultEvents,
  defaultHostels,
  defaultPGs,
  defaultFoodSpots,
  defaultRestaurants,
  defaultAmenities,
  defaultClubs,
  defaultContacts
} from './data/defaultData';

import {
  decodeBase64Utf8,
  encodeBase64Utf8,
  replaceSection
} from './utils/gitUtils';

export default function App() {
  const [userRole, setUserRole] = useState('user');
  const [showAuthModal, setShowAuthModal] = useState(false);

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
  const [gitOwner, setGitOwner] = useState(() => sessionStorage.getItem('git_owner') || '');
  const [gitRepo, setGitRepo] = useState(() => sessionStorage.getItem('git_repo') || '');
  const [gitPat, setGitPat] = useState(() => sessionStorage.getItem('git_pat') || '');

  const [activeModule, setActiveModule] = useState('home');

  // Main data states
  const [academicEvents, setAcademicEvents] = useState(defaultEvents);
  const [hostels, setHostels] = useState(defaultHostels);
  const [pgs, setPgs] = useState(defaultPGs);
  const [foodSpots, setFoodSpots] = useState(defaultFoodSpots);
  const [restaurants, setRestaurants] = useState(defaultRestaurants);
  const [amenities, setAmenities] = useState(defaultAmenities);
  const [clubs, setClubs] = useState(defaultClubs);
  const [contacts, setContacts] = useState(defaultContacts);

  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishingStatus, setPublishingStatus] = useState('');

  // Search/Filter states
  const [hostelSearch, setHostelSearch] = useState('');
  const [pgSearch, setPgSearch] = useState('');
  const [pgFoodFilter, setPgFoodFilter] = useState('all');
  const [pgRentFilter, setPgRentFilter] = useState('all');
  const [foodSearch, setFoodSearch] = useState('');
  const [restaurantSearch, setRestaurantSearch] = useState('');
  const [restaurantCuisineFilter, setRestaurantCuisineFilter] = useState('all');
  const [amenitySearch, setAmenitySearch] = useState('');
  const [clubSearch, setClubSearch] = useState('');

  // Auto login on mount if session keys exist
  useEffect(() => {
    if (gitOwner && gitRepo && gitPat) {
      setUserRole('admin');
    } else {
      const session = sessionStorage.getItem('student_session');
      if (session) {
        setUserRole('student');
      }
    }
  }, [gitOwner, gitRepo, gitPat]);

  // Global keyboard shortcuts listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ignore shortcuts when typing inside form elements
      if (
        document.activeElement && 
        (document.activeElement.tagName === 'INPUT' ||
         document.activeElement.tagName === 'TEXTAREA' ||
         document.activeElement.tagName === 'SELECT')
      ) {
        return;
      }

      const key = e.key.toLowerCase();
      
      const shortcuts = {
        h: 'home',
        c: 'calendar',
        d: 'contacts',
        s: 'hostels',
        p: 'pgs',
        t: 'food',
        r: 'restaurants',
        a: 'amenities',
        k: 'clubs',
        q: 'queries'
      };

      if (shortcuts[key]) {
        if (key === 'q' && userRole !== 'student') return; // Student only queries view
        setActiveModule(shortcuts[key]);
      }

      if (key === 'l' && userRole === 'user') {
        setShowAuthModal(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [userRole]);

  const handleLogin = async (e) => {
    e.preventDefault();
    const owner = gitOwner.trim();
    const repo = gitRepo.trim();
    const pat = gitPat.trim();

    if (!owner || !repo || !pat) {
      alert('Please fill out all credentials.');
      return;
    }

    setIsPublishing(true);
    setPublishingStatus('Verifying access token with GitHub API...');

    try {
      // Fetch contents of the default data file to verify credentials and repo validity
      const res = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/contents/src/data/defaultData.js`,
        {
          headers: {
            Authorization: `token ${pat}`,
            Accept: 'application/vnd.github.v3+json'
          }
        }
      );

      if (!res.ok) {
        throw new Error(`GitHub responded with status: ${res.status}`);
      }

      sessionStorage.setItem('git_owner', owner);
      sessionStorage.setItem('git_repo', repo);
      sessionStorage.setItem('git_pat', pat);

      setGitOwner(owner);
      setGitRepo(repo);
      setGitPat(pat);

      setUserRole('admin');
      setShowAuthModal(false);
      alert('Authenticated successfully! Admin Access unlocked.');
    } catch (err) {
      alert(`Authentication failed: ${err.message}. Please check your credentials and token permissions.`);
    } finally {
      setIsPublishing(false);
      setPublishingStatus('');
    }
  };

  const logout = () => {
    sessionStorage.clear();
    setGitOwner('');
    setGitRepo('');
    setGitPat('');
    setLoggedStudent(null);
    setUserRole('user');
    setActiveModule('home');
    setUnsavedChanges(false);
    alert('Logged out successfully.');
  };

  const publishToGitHub = async () => {
    const owner = gitOwner.trim();
    const repo = gitRepo.trim();
    const pat = gitPat.trim();

    if (!owner || !repo || !pat) {
      alert('Missing GitHub credentials. Please re-login.');
      logout();
      return;
    }

    setIsPublishing(true);
    setPublishingStatus('Fetching latest file content from GitHub...');

    let fileSha = '';
    let dataContent = '';

    const fetchUrl = `https://api.github.com/repos/${owner}/${repo}/contents/src/data/defaultData.js`;

    try {
      // 1. Fetch current defaultData.js contents
      console.log('Fetching file from GitHub API:', fetchUrl);
      let getRes;
      try {
        getRes = await fetch(fetchUrl, {
          headers: {
            Authorization: `token ${pat}`,
            Accept: 'application/vnd.github.v3+json'
          }
        });
      } catch (fetchErr) {
        throw new Error(`[GET download phase] Network/CORS error: ${fetchErr.message}`);
      }

      if (!getRes.ok) {
        throw new Error(`[GET download phase] GitHub responded with status: ${getRes.status} ${getRes.statusText}`);
      }

      const gitFile = await getRes.json();
      fileSha = gitFile.sha;
      dataContent = decodeBase64Utf8(gitFile.content);
    } catch (getErr) {
      setIsPublishing(false);
      setPublishingStatus('');
      alert(`Publishing failed: ${getErr.message}`);
      return;
    }

    setPublishingStatus('Formatting updated data and updating source code...');

    let updatedData = '';
    try {
      // 2. Perform text replacements using comments markers
      updatedData = dataContent;
      updatedData = replaceSection(updatedData, '// <!--EVENTS_START-->', '// <!--EVENTS_END-->', `export const defaultEvents = ${JSON.stringify(academicEvents, null, 2)};`);
      updatedData = replaceSection(updatedData, '// <!--HOSTELS_START-->', '// <!--HOSTELS_END-->', `export const defaultHostels = ${JSON.stringify(hostels, null, 2)};`);
      updatedData = replaceSection(updatedData, '// <!--PGS_START-->', '// <!--PGS_END-->', `export const defaultPGs = ${JSON.stringify(pgs, null, 2)};`);
      updatedData = replaceSection(updatedData, '// <!--FOODSPOTS_START-->', '// <!--FOODSPOTS_END-->', `export const defaultFoodSpots = ${JSON.stringify(foodSpots, null, 2)};`);
      updatedData = replaceSection(updatedData, '// <!--RESTAURANTS_START-->', '// <!--RESTAURANTS_END-->', `export const defaultRestaurants = ${JSON.stringify(restaurants, null, 2)};`);
      updatedData = replaceSection(updatedData, '// <!--AMENITIES_START-->', '// <!--AMENITIES_END-->', `export const defaultAmenities = ${JSON.stringify(amenities, null, 2)};`);
      updatedData = replaceSection(updatedData, '// <!--CLUBS_START-->', '// <!--CLUBS_END-->', `export const defaultClubs = ${JSON.stringify(clubs, null, 2)};`);
      updatedData = replaceSection(updatedData, '// <!--CONTACTS_START-->', '// <!--CONTACTS_END-->', `export const defaultContacts = ${JSON.stringify(contacts, null, 2)};`);
    } catch (replaceErr) {
      setIsPublishing(false);
      setPublishingStatus('');
      alert(`Publishing failed (marker replacement): ${replaceErr.message}`);
      return;
    }

    setPublishingStatus('Submitting commit to GitHub...');

    try {
      // 3. Encode updated file content to base64
      const base64Content = encodeBase64Utf8(updatedData);

      // 4. PUT updated file to GitHub
      console.log('Sending PUT request to commit changes to GitHub API:', fetchUrl);
      let putRes;
      try {
        putRes = await fetch(fetchUrl, {
          method: 'PUT',
          headers: {
            Authorization: `token ${pat}`,
            'Content-Type': 'application/json',
            Accept: 'application/vnd.github.v3+json'
          },
          body: JSON.stringify({
            message: 'Update campus listings via Admin Portal UI',
            content: base64Content,
            sha: fileSha
          })
        });
      } catch (putFetchErr) {
        throw new Error(`[PUT upload phase] Network/CORS error: ${putFetchErr.message}`);
      }

      if (!putRes.ok) {
        let errText = putRes.statusText;
        try {
          const errDetails = await putRes.json();
          errText = errDetails.message || errText;
        } catch (_) {}
        throw new Error(`[PUT upload phase] GitHub Commit Rejected: ${errText} (status: ${putRes.status})`);
      }

      setUnsavedChanges(false);
      alert('Success! Changes committed to your repository. GitHub Pages will build and deploy the update in 1-2 minutes.');
    } catch (putErr) {
      alert(`Publishing failed: ${putErr.message}`);
    } finally {
      setIsPublishing(false);
      setPublishingStatus('');
    }
  };

  const contains = (value, search) => (value || '').toLowerCase().includes(search.toLowerCase());

  // Filter calculations
  const filteredHostels = hostels.filter(
    (item) =>
      contains(item.name, hostelSearch) ||
      contains(item.location, hostelSearch) ||
      contains(item.food, hostelSearch)
  );

  const parseRent = (rent) => {
    const num = parseInt((rent || '').toString().replace(/[^\d]/g, ''), 10);
    return isNaN(num) ? null : num;
  };

  const filteredPGs = pgs.filter((item) => {
    const textMatch =
      contains(item.name, pgSearch) ||
      contains(item.location, pgSearch) ||
      contains(item.food, pgSearch) ||
      contains(item.rooms, pgSearch);

    const foodMatch =
      pgFoodFilter === 'all'
        ? true
        : pgFoodFilter === 'included'
        ? contains(item.food, 'included') || contains(item.food, 'mess')
        : pgFoodFilter === 'not-included'
        ? !contains(item.food, 'included') && !contains(item.food, 'mess')
        : true;

    const rent = parseRent(item.rent);
    const rentMatch =
      pgRentFilter === 'all'
        ? true
        : pgRentFilter === 'below6000'
        ? rent !== null && rent < 6000
        : pgRentFilter === '6000to8000'
        ? rent !== null && rent >= 6000 && rent <= 8000
        : pgRentFilter === 'above8000'
        ? rent !== null && rent > 8000
        : true;

    return textMatch && foodMatch && rentMatch;
  });

  const filteredFoodSpots = foodSpots.filter(
    (item) =>
      contains(item.name, foodSearch) ||
      contains(item.location, foodSearch) ||
      contains(item.specialty, foodSearch)
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
      contains(item.details, amenitySearch)
  );

  const filteredClubs = clubs.filter(
    (item) =>
      contains(item.name, clubSearch) ||
      contains(item.location, clubSearch) ||
      contains(item.services, clubSearch)
  );

  return (
    <div className="portal-layout">
      <Sidebar
        userRole={userRole}
        activeModule={activeModule}
        setActiveModule={setActiveModule}
        setShowAuthModal={setShowAuthModal}
        logout={logout}
        loggedStudent={loggedStudent}
      />

      <div className="main-area">
        <Topbar userRole={userRole} />

        <div className="content">
          {/* Publishing Loading Banner */}
          {isPublishing && (
            <div className="publish-banner" style={{ background: '#fef3c7', borderColor: '#fde68a' }}>
              <div className="publish-banner-text" style={{ color: '#92400e' }}>
                <i
                  className="ti ti-loader"
                  style={{
                    display: 'inline-block',
                    animation: 'spin 1s linear infinite',
                    marginRight: '8px'
                  }}
                ></i>
                <strong>Processing:</strong> {publishingStatus}
              </div>
            </div>
          )}

          {/* Unsaved Changes Banner */}
          {unsavedChanges && !isPublishing && (
            <div className="publish-banner">
              <div className="publish-banner-text">
                <i className="ti ti-alert-circle" style={{ marginRight: '8px', fontSize: '16px' }}></i>
                <strong>Unsaved Edits:</strong> You have made changes locally. Click publish to deploy them to GitHub Pages.
              </div>
              <button
                className="btn-secondary"
                style={{ padding: '8px 16px', fontSize: '13px' }}
                onClick={publishToGitHub}
              >
                <i className="ti ti-cloud-upload" style={{ marginRight: '6px' }}></i> Save & Publish
              </button>
            </div>
          )}

          <div key={activeModule} className="fade-in-section">
            {activeModule === 'home' && (
              <Home
                academicEvents={academicEvents}
                hostels={hostels}
                pgs={pgs}
                foodSpots={foodSpots}
                restaurants={restaurants}
                amenities={amenities}
                clubs={clubs}
                setActiveModule={setActiveModule}
              />
            )}

            {activeModule === 'calendar' && (
              <div className="card">
                <h2>Academic Calendar</h2>
                {academicEvents.map((event, idx) => (
                  <div key={idx} className="event-item">
                    <div>
                      <p>
                        <strong>{event.title}</strong>
                      </p>
                      <p className="small-text">
                        {event.date} | {event.type}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeModule === 'contacts' && (
              <ContactList contacts={contacts} />
            )}

            {activeModule === 'hostels' && (
              <div className="card">
                <div className="module-header">
                  <h2>Hostels</h2>
                </div>
                <div className="filter-bar">
                  <input
                    type="text"
                    placeholder="Search by hostel, location, or food"
                    value={hostelSearch}
                    onChange={(e) => setHostelSearch(e.target.value)}
                  />
                </div>
                <ListingGrid
                  items={filteredHostels}
                  fields={['location', 'fees', 'food', 'contact', 'rooms']}
                />
              </div>
            )}

            {activeModule === 'pgs' && (
              <div className="card">
                <div className="module-header">
                  <h2>Paying Guest (PG) Options</h2>
                </div>
                <div className="filter-bar">
                  <input
                    type="text"
                    placeholder="Search PG by name, location, food, or room type"
                    value={pgSearch}
                    onChange={(e) => setPgSearch(e.target.value)}
                  />
                  <select value={pgFoodFilter} onChange={(e) => setPgFoodFilter(e.target.value)}>
                    <option value="all">All food options</option>
                    <option value="included">Food included / mess</option>
                    <option value="not-included">No food included</option>
                  </select>
                  <select value={pgRentFilter} onChange={(e) => setPgRentFilter(e.target.value)}>
                    <option value="all">All rent ranges</option>
                    <option value="below6000">Below 6000</option>
                    <option value="6000to8000">6000 to 8000</option>
                    <option value="above8000">Above 8000</option>
                  </select>
                </div>
                <ListingGrid
                  items={filteredPGs}
                  fields={['location', 'rent', 'food', 'contact', 'rooms']}
                />
              </div>
            )}

            {activeModule === 'food' && (
              <div className="card">
                <h2>Tea Spots</h2>
                <div className="filter-bar">
                  <input
                    type="text"
                    placeholder="Search tea spots by name, location, or specialty"
                    value={foodSearch}
                    onChange={(e) => setFoodSearch(e.target.value)}
                  />
                </div>
                <ListingGrid
                  items={filteredFoodSpots}
                  fields={['location', 'specialty', 'timing']}
                />
              </div>
            )}

            {activeModule === 'restaurants' && (
              <div className="card">
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
                  fields={['location', 'cuisine', 'contact']}
                />
              </div>
            )}

            {activeModule === 'amenities' && (
              <div className="card">
                <h2>Amenities</h2>
                <div className="filter-bar">
                  <input
                    type="text"
                    placeholder="Search amenities by name, location, or details"
                    value={amenitySearch}
                    onChange={(e) => setAmenitySearch(e.target.value)}
                  />
                </div>
                <ListingGrid items={filteredAmenities} fields={['location', 'details']} />
              </div>
            )}

            {activeModule === 'clubs' && (
              <div className="card">
                <h2>Campus Clubs</h2>
                <div className="filter-bar">
                  <input
                    type="text"
                    placeholder="Search clubs by name, location, or services..."
                    value={clubSearch}
                    onChange={(e) => setClubSearch(e.target.value)}
                  />
                </div>
                <ListingGrid
                  items={filteredClubs}
                  fields={['location', 'contact', 'services']}
                />
              </div>
            )}

            {activeModule === 'queries' && userRole === 'student' && (
              <QueryPanel loggedStudent={loggedStudent} />
            )}

            {activeModule === 'admin' && userRole === 'admin' && (
              <AdminDashboard
                academicEvents={academicEvents}
                setAcademicEvents={setAcademicEvents}
                contacts={contacts}
                setContacts={setContacts}
                hostels={hostels}
                setHostels={setHostels}
                pgs={pgs}
                setPgs={setPgs}
                foodSpots={foodSpots}
                setFoodSpots={setFoodSpots}
                restaurants={restaurants}
                setRestaurants={setRestaurants}
                amenities={amenities}
                setAmenities={setAmenities}
                clubs={clubs}
                setClubs={setClubs}
                setUnsavedChanges={setUnsavedChanges}
                publishToGitHub={publishToGitHub}
                isPublishing={isPublishing}
              />
            )}
          </div>
        </div>
      </div>

      {showAuthModal && (
        <AuthModal
          gitOwner={gitOwner}
          setGitOwner={setGitOwner}
          gitRepo={gitRepo}
          setGitRepo={setGitRepo}
          gitPat={gitPat}
          setGitPat={setGitPat}
          isPublishing={isPublishing}
          handleGitConnect={handleLogin}
          setUserRole={setUserRole}
          setLoggedStudent={setLoggedStudent}
          setShowAuthModal={setShowAuthModal}
        />
      )}
    </div>
  );
}
