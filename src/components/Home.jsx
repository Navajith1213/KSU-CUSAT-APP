import React from 'react';

export default function Home({
  academicEvents,
  hostels,
  pgs,
  foodSpots,
  restaurants,
  amenities,
  clubs,
  setActiveModule
}) {
  return (
    <div>
      {/* Hero Section */}
      <div className="hero-section">
        <h2 className="hero-title">CUSAT Student Portal</h2>
        <p className="hero-subtitle">
          Your ultimate campus assistant for staying, dining, and navigating Kochi University. Find local hostels, PG accommodations, dining spots, and key campus contacts.
        </p>
        <div className="quick-stats">
          <div className="stat-item">
            <div className="stat-val">{academicEvents.length}</div>
            <div className="stat-lbl">Calendar Events</div>
          </div>
          <div className="stat-item">
            <div className="stat-val">{hostels.length + pgs.length}</div>
            <div className="stat-lbl">Accommodations</div>
          </div>
          <div className="stat-item">
            <div className="stat-val">{foodSpots.length + restaurants.length}</div>
            <div className="stat-lbl">Tea & Dining</div>
          </div>
          <div className="stat-item">
            <div className="stat-val">{amenities.length}</div>
            <div className="stat-lbl">Campus Services</div>
          </div>
          <div className="stat-item">
            <div className="stat-val">{clubs.length}</div>
            <div className="stat-lbl">Clubs Active</div>
          </div>
        </div>
      </div>

      {/* Modules Preview Grid */}
      <div className="preview-grid">
        {/* Academic Calendar Card */}
        <div className="preview-card" onClick={() => setActiveModule('calendar')}>
          <div>
            <div className="preview-header">
              <div className="preview-icon-box">
                <i className="ti ti-calendar"></i>
              </div>
              <h3 className="preview-title">Academic Calendar</h3>
            </div>
            <div className="preview-content">
              Stay updated with upcoming registrations, examinations, and university holidays.
              <ul className="preview-list-small">
                {academicEvents.slice(0, 2).map((e, idx) => (
                  <li key={idx}>
                    <i className="ti ti-circle-chevron-right"></i>
                    <span>{e.title} ({e.date})</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <button className="preview-btn-text">
            Open Calendar <i className="ti ti-arrow-right"></i>
          </button>
        </div>

        {/* Accommodation Card */}
        <div className="preview-card" onClick={() => setActiveModule('hostels')}>
          <div>
            <div className="preview-header">
              <div className="preview-icon-box">
                <i className="ti ti-home"></i>
              </div>
              <h3 className="preview-title">Stays & Hostels</h3>
            </div>
            <div className="preview-content">
              Browse verified university hostels and Paying Guest (PG) listings near Kalamassery.
              <ul className="preview-list-small">
                {hostels.slice(0, 1).map((h, idx) => (
                  <li key={idx}>
                    <i className="ti ti-building-community"></i>
                    <span>{h.name} - {h.fees}</span>
                  </li>
                ))}
                {pgs.slice(0, 1).map((p, idx) => (
                  <li key={idx}>
                    <i className="ti ti-bed"></i>
                    <span>{p.name} - {p.rent}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <button className="preview-btn-text" onClick={(e) => { e.stopPropagation(); setActiveModule('hostels'); }}>
            Explore Stays <i className="ti ti-arrow-right"></i>
          </button>
        </div>

        {/* Tea Spot & Restaurant Card */}
        <div className="preview-card" onClick={() => setActiveModule('food')}>
          <div>
            <div className="preview-header">
              <div className="preview-icon-box">
                <i className="ti ti-coffee"></i>
              </div>
              <h3 className="preview-title">Tea Spots</h3>
            </div>
            <div className="preview-content">
              Discover local tea shops, campus canteens, and snack joints around the university.
              <ul className="preview-list-small">
                {foodSpots.slice(0, 1).map((f, idx) => (
                  <li key={idx}>
                    <i className="ti ti-cookie"></i>
                    <span>{f.name} ({f.timing})</span>
                  </li>
                ))}
                {restaurants.slice(0, 1).map((r, idx) => (
                  <li key={idx}>
                    <i className="ti ti-tools-kitchen-2"></i>
                    <span>{r.name} - {r.cuisine}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <button className="preview-btn-text" onClick={(e) => { e.stopPropagation(); setActiveModule('food'); }}>
            Explore Tea Spots <i className="ti ti-arrow-right"></i>
          </button>
        </div>

        {/* Amenities Card */}
        <div className="preview-card" onClick={() => setActiveModule('amenities')}>
          <div>
            <div className="preview-header">
              <div className="preview-icon-box">
                <i className="ti ti-map-pin"></i>
              </div>
              <h3 className="preview-title">Campus Amenities</h3>
            </div>
            <div className="preview-content">
              Locate critical facilities like medical stores, photocopying centers, and laundry services.
              <ul className="preview-list-small">
                {amenities.slice(0, 2).map((a, idx) => (
                  <li key={idx}>
                    <i className="ti ti-info-circle"></i>
                    <span>{a.name} - {a.location}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <button className="preview-btn-text">
            View Utilities <i className="ti ti-arrow-right"></i>
          </button>
        </div>

        {/* Clubs Card */}
        <div className="preview-card" onClick={() => setActiveModule('clubs')}>
          <div>
            <div className="preview-header">
              <div className="preview-icon-box">
                <i className="ti ti-users"></i>
              </div>
              <h3 className="preview-title">Campus Clubs</h3>
            </div>
            <div className="preview-content">
              Explore technical, cultural, and activity clubs active on the CUSAT campus.
              <ul className="preview-list-small">
                {clubs.slice(0, 2).map((c, idx) => (
                  <li key={idx}>
                    <i className="ti ti-trophy"></i>
                    <span>{c.name} - {c.location}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <button className="preview-btn-text">
            Explore Clubs <i className="ti ti-arrow-right"></i>
          </button>
        </div>
      </div>

      {/* Contact Summary Banner */}
      <div className="landing-contact-banner">
        <div className="landing-contact-info">
          <h3>Need Immediate Assistance?</h3>
          <p>Access direct office phone numbers, email addresses, and locations instantly.</p>
        </div>
        <button className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '6px' }} onClick={() => setActiveModule('contacts')}>
          <i className="ti ti-phone"></i> Contact Directory
        </button>
      </div>
    </div>
  );
}
