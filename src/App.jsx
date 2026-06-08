import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import AuthModal from './components/Modals/AuthModal';
import Home from './components/Home';
import ListingGrid from './components/ListingGrid';
import ContactList from './components/ContactList';
import AdminDashboard from './components/Admin/AdminDashboard';
import AdminQueries from './components/Admin/AdminQueries';
import QueryPanel from './components/QueryPanel';
import Navbar from './components/Navbar';
import AcademicResources from './components/AcademicResources';
import DepartmentDashboard from './components/DepartmentDashboard';
import Chatbot from './components/Chatbot';

import {
  defaultEvents,
  defaultBoysPGs,
  defaultGirlsPGs,
  defaultHostels,
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

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const isoPattern = /^\d{4}-\d{2}-\d{2}$/;
  if (isoPattern.test(dateStr)) {
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year}`;
  }
  return dateStr;
};

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
  const [boysPgs, setBoysPgs] = useState(defaultBoysPGs);
  const [girlsPgs, setGirlsPgs] = useState(defaultGirlsPGs);
  const [hostels, setHostels] = useState(defaultHostels);
  const [foodSpots, setFoodSpots] = useState(defaultFoodSpots);
  const [restaurants, setRestaurants] = useState(defaultRestaurants);
  const [amenities, setAmenities] = useState(defaultAmenities);
  const [clubs, setClubs] = useState(defaultClubs);
  const [contacts, setContacts] = useState(defaultContacts);

  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishingStatus, setPublishingStatus] = useState('');

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

  // Auto login on mount if session keys exist
  useEffect(() => {
    if (gitOwner && gitRepo && gitPat) {
      setUserRole('admin');
    } else {
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
    }
  }, [gitOwner, gitRepo, gitPat]);



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
      alert('Authentication failed. Please check your credentials and token permissions.');
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
      // Fetch file from GitHub API
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
      alert('Publishing failed: Could not fetch the latest file from GitHub. Please check your connection and try again.');
      return;
    }

    setPublishingStatus('Formatting updated data and updating source code...');

    // Sanitize text fields in data arrays to strip any embedded HTML/script tags
    const stripTags = (str) => typeof str === 'string' ? str.replace(/<[^>]*>/g, '') : str;
    const sanitizeObj = (obj) => {
      const cleaned = {};
      for (const key in obj) {
        cleaned[key] = typeof obj[key] === 'string' ? stripTags(obj[key]) : obj[key];
      }
      return cleaned;
    };
    const sanitizeArray = (arr) => Array.isArray(arr) ? arr.map(sanitizeObj) : arr;

    let updatedData = '';
    try {
      // 2. Perform text replacements using comments markers (with sanitized data)
      updatedData = dataContent;
      updatedData = replaceSection(updatedData, '// <!--EVENTS_START-->', '// <!--EVENTS_END-->', `export const defaultEvents = ${JSON.stringify(sanitizeArray(academicEvents), null, 2)};`);
      updatedData = replaceSection(updatedData, '// <!--BOYSPGS_START-->', '// <!--BOYSPGS_END-->', `export const defaultBoysPGs = ${JSON.stringify(sanitizeArray(boysPgs), null, 2)};`);
      updatedData = replaceSection(updatedData, '// <!--GIRLSPGS_START-->', '// <!--GIRLSPGS_END-->', `export const defaultGirlsPGs = ${JSON.stringify(sanitizeArray(girlsPgs), null, 2)};`);
      updatedData = replaceSection(updatedData, '// <!--HOSTELS_START-->', '// <!--HOSTELS_END-->', `export const defaultHostels = ${JSON.stringify(sanitizeArray(hostels), null, 2)};`);
      updatedData = replaceSection(updatedData, '// <!--FOODSPOTS_START-->', '// <!--FOODSPOTS_END-->', `export const defaultFoodSpots = ${JSON.stringify(sanitizeArray(foodSpots), null, 2)};`);
      updatedData = replaceSection(updatedData, '// <!--RESTAURANTS_START-->', '// <!--RESTAURANTS_END-->', `export const defaultRestaurants = ${JSON.stringify(sanitizeArray(restaurants), null, 2)};`);
      updatedData = replaceSection(updatedData, '// <!--AMENITIES_START-->', '// <!--AMENITIES_END-->', `export const defaultAmenities = ${JSON.stringify(sanitizeArray(amenities), null, 2)};`);
      updatedData = replaceSection(updatedData, '// <!--CLUBS_START-->', '// <!--CLUBS_END-->', `export const defaultClubs = ${JSON.stringify(sanitizeArray(clubs), null, 2)};`);
      updatedData = replaceSection(updatedData, '// <!--CONTACTS_START-->', '// <!--CONTACTS_END-->', `export const defaultContacts = ${JSON.stringify(sanitizeArray(contacts), null, 2)};`);
    } catch (replaceErr) {
      setIsPublishing(false);
      setPublishingStatus('');
      alert('Publishing failed: Could not process the data update. Please try again.');
      return;
    }

    setPublishingStatus('Submitting commit to GitHub...');

    try {
      // 3. Encode updated file content to base64
      const base64Content = encodeBase64Utf8(updatedData);

      // 4. PUT updated file to GitHub (with 409 retry logic)
      const attemptPut = async (sha) => {
        // Submit commit to GitHub API
        const putRes = await fetch(fetchUrl, {
          method: 'PUT',
          headers: {
            Authorization: `token ${pat}`,
            'Content-Type': 'application/json',
            Accept: 'application/vnd.github.v3+json'
          },
          body: JSON.stringify({
            message: 'Update campus listings via Admin Portal UI',
            content: base64Content,
            sha: sha
          })
        });
        return putRes;
      };

      let putRes;
      try {
        putRes = await attemptPut(fileSha);
      } catch (putFetchErr) {
        throw new Error('Network error while uploading changes. Please check your connection and try again.');
      }

      // If 409 conflict (SHA mismatch), re-fetch latest SHA and retry once
      if (putRes.status === 409) {
        setPublishingStatus('SHA conflict detected — re-fetching latest version and retrying...');
        try {
          const refreshRes = await fetch(fetchUrl, {
            headers: {
              Authorization: `token ${pat}`,
              Accept: 'application/vnd.github.v3+json'
            }
          });
          if (refreshRes.ok) {
            const refreshed = await refreshRes.json();
            putRes = await attemptPut(refreshed.sha);
          }
        } catch (_) {
          // If refresh fails, fall through to the error handler below
        }
      }

      if (!putRes.ok) {
        let errText = putRes.statusText;
        try {
          const errDetails = await putRes.json();
          errText = errDetails.message || errText;
        } catch (_) {}
        throw new Error('GitHub rejected the commit. Please try again or re-authenticate.');
      }

      setUnsavedChanges(false);
      alert('Success! Changes committed to your repository. GitHub Pages will build and deploy the update in 1-2 minutes.');
    } catch (putErr) {
      alert(`Publishing failed: ${putErr.message}`);
      console.error('Publish error (for debugging):', putErr);
    } finally {
      setIsPublishing(false);
      setPublishingStatus('');
    }
  };

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

  const renderModuleContent = () => {
    return (
      <div key={activeModule} className="fade-in-section">
        {['calendar', 'contacts', 'boysPgs', 'girlsPgs', 'hostels', 'food', 'restaurants', 'amenities', 'clubs', 'queries'].includes(activeModule) && (
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
            setShowAuthModal={setShowAuthModal}
            loggedStudent={loggedStudent}
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
                    {formatDate(event.date)} | {event.type}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeModule === 'contacts' && (
          <ContactList contacts={contacts} />
        )}

        {activeModule === 'boysPgs' && (
          <div className="card">
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
          </div>
        )}

        {activeModule === 'girlsPgs' && (
          <div className="card">
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
          </div>
        )}

        {activeModule === 'hostels' && (
          <div className="card">
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
              fields={['type', 'location', 'fees', 'food', 'contact', 'wardenContact', 'secretaryContact', 'rooms']}
            />
          </div>
        )}

        {activeModule === 'food' && (
          <div className="card">
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
                placeholder="Search amenities by name, category, location, or details"
                value={amenitySearch}
                onChange={(e) => setAmenitySearch(e.target.value)}
              />
            </div>
            <ListingGrid items={filteredAmenities} fields={['category', 'location', 'details']} />
          </div>
        )}

        {activeModule === 'clubs' && (
          <div className="card">
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
          </div>
        )}

        {activeModule === 'academic_resources' && (
          <AcademicResources userRole={userRole} setShowAuthModal={setShowAuthModal} />
        )}

        {activeModule === 'dept_dashboard' && userRole === 'dept_admin' && (
          <DepartmentDashboard loggedStudent={loggedStudent} />
        )}

        {activeModule === 'queries' && (userRole === 'student' || userRole === 'dept_admin') && (
          <QueryPanel loggedStudent={loggedStudent} />
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
            setUnsavedChanges={setUnsavedChanges}
            publishToGitHub={publishToGitHub}
            isPublishing={isPublishing}
          />
        )}
        {activeModule === 'admin-queries' && userRole === 'admin' && (
          <AdminQueries />
        )}
      </div>
    );
  };

  return (
    <>
      {userRole === 'admin' ? (
        <div className="portal-layout">
          <Sidebar
            userRole={userRole}
            activeModule={activeModule}
            setActiveModule={setActiveModule}
            logout={logout}
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

              {renderModuleContent()}
            </div>
          </div>
        </div>
      ) : (
        <div className="website-layout" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          <Navbar
            userRole={userRole}
            activeModule={activeModule}
            setActiveModule={setActiveModule}
            setShowAuthModal={setShowAuthModal}
            logout={logout}
            loggedStudent={loggedStudent}
          />

          <main className="content website-content">
            {renderModuleContent()}
          </main>

          <footer className="footer">
            <div className="footer-container">
              <div className="footer-brand">
                <img 
                  src="/logo.jpg" 
                  alt="CUSAT Portal" 
                  style={{ 
                    height: '32px', 
                    objectFit: 'contain', 
                    backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                    padding: '4px 10px', 
                    borderRadius: '8px',
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
                      style={{ color: '#94a3b8', background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px 0', fontSize: '13.5px', fontWeight: '500' }}
                    >
                      Home
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => setActiveModule('calendar')}
                      style={{ color: '#94a3b8', background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px 0', fontSize: '13.5px', fontWeight: '500' }}
                    >
                      Calendar
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => setActiveModule('contacts')}
                      style={{ color: '#94a3b8', background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px 0', fontSize: '13.5px', fontWeight: '500' }}
                    >
                      Contacts
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => setActiveModule('food')}
                      style={{ color: '#94a3b8', background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px 0', fontSize: '13.5px', fontWeight: '500' }}
                    >
                      Tea Spots
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => setActiveModule('hostels')}
                      style={{ color: '#94a3b8', background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px 0', fontSize: '13.5px', fontWeight: '500' }}
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
      {/* Always render chatbot globally */}
      <Chatbot />
    </>
  );
}
