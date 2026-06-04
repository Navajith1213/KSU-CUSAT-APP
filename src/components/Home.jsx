import React, { useState, useEffect } from 'react';
import { supabase, hasSupabaseConfig } from '../utils/supabaseClient';

export default function Home({
  academicEvents,
  hostels,
  pgs,
  foodSpots,
  restaurants,
  amenities,
  clubs,
  setActiveModule,
  setShowAuthModal
}) {
  const [loggedStudent, setLoggedStudent] = useState(null);
  const [queryCount, setQueryCount] = useState(0);

  // Check student session on mount/focus
  useEffect(() => {
    try {
      const session = sessionStorage.getItem('student_session');
      if (session) {
        const student = JSON.parse(session);
        setLoggedStudent(student);

        // Fetch query count
        if (hasSupabaseConfig) {
          supabase
            .from('complaints')
            .select('id', { count: 'exact', head: true })
            .then(({ count, error }) => {
              if (!error) setQueryCount(count || 0);
            });
        } else {
          const mockHistory = JSON.parse(localStorage.getItem(`mock_queries_${student.email}`) || '[]');
          setQueryCount(mockHistory.length);
        }
      }
    } catch (_) {}
  }, []);

  const features = [
    {
      id: 'calendar',
      title: 'Academic Calendar',
      icon: 'ti-calendar',
      key: 'C',
      description: 'Check crucial dates including semester registrations, mid-term examinations, and official university holidays.'
    },
    {
      id: 'contacts',
      title: 'Contact Directory',
      icon: 'ti-phone',
      key: 'D',
      description: 'Find administrative helpline details, university hostel office contacts, and google map directions instantly.'
    },
    {
      id: 'hostels',
      title: 'Campus Hostels',
      icon: 'ti-building-community',
      key: 'S',
      description: 'Explore verified student hostel listings inside or around Kalamassery campus, detailing mess options and room rules.'
    },
    {
      id: 'pgs',
      title: 'Paying Guests (PGs)',
      icon: 'ti-bed',
      key: 'P',
      description: 'Compare double and single sharing PG options, monthly rent ranges, food availability, and contact detail cards.'
    },
    {
      id: 'food',
      title: 'Evening Tea Spots',
      icon: 'ti-coffee',
      key: 'T',
      description: 'Locate local student canteens, tea joints, and evening fast food outlets around the CUSAT road corridor.'
    },
    {
      id: 'restaurants',
      title: 'Restaurants',
      icon: 'ti-tools-kitchen-2',
      key: 'R',
      description: 'Browse local lunch tables, biryani counters, arabic kitchens, and vegetarian dining centers near the Metro link.'
    },
    {
      id: 'amenities',
      title: 'Amenities & Shops',
      icon: 'ti-map-pin',
      key: 'A',
      description: 'Quickly find critical campus amenities such as laundry services, stationery/xerox hubs, and medical stores.'
    },
    {
      id: 'clubs',
      title: 'Clubs & Arts',
      icon: 'ti-users',
      key: 'K',
      description: 'Get involved in cultural clubs, arts collectives, IEEE student branches, and technical workshops active on campus.'
    }
  ];

  return (
    <div>
      {/* Hero Welcome banner */}
      <div className="hero-section">
        {loggedStudent ? (
          <div>
            <h2 className="hero-title" style={{ fontSize: '32px' }}>
              Welcome back, {loggedStudent.full_name}!
            </h2>
            <p className="hero-subtitle">
              Your student dashboard is active. You have submitted{' '}
              <strong style={{ color: '#0d9488' }}>{queryCount} support ticket(s)</strong>. Use the sidebar tabs or
              shortcut keys to search accommodations, check holidays, or file new inquiries.
            </p>
          </div>
        ) : (
          <div>
            <h2 className="hero-title">Student Portal</h2>
            <p className="hero-subtitle">
              Your ultimate campus assistant for staying, dining, and navigating CUSAT. Find local hostels,
              paying guest (PG) accommodations, tea spots, and key campus contacts.
            </p>
          </div>
        )}

        {/* Quick statistics */}
        <div className="quick-stats">
          <div className="stat-item">
            <div className="stat-val">{academicEvents.length}</div>
            <div className="stat-lbl">Calendar Events</div>
          </div>
          <div className="stat-item">
            <div className="stat-val">{hostels.length + pgs.length}</div>
            <div className="stat-lbl">Stays Listed</div>
          </div>
          <div className="stat-item">
            <div className="stat-val">{foodSpots.length + restaurants.length}</div>
            <div className="stat-lbl">Tea Spots</div>
          </div>
          <div className="stat-item">
            <div className="stat-val">{amenities.length}</div>
            <div className="stat-lbl">Amenities</div>
          </div>
          <div className="stat-item">
            <div className="stat-val">{clubs.length}</div>
            <div className="stat-lbl">Clubs</div>
          </div>
        </div>
      </div>

      {/* Guest Call to Action */}
      {!loggedStudent && (
        <div className="card" style={{ display: 'flex', gap: '20px', alignItems: 'center', background: 'linear-gradient(135deg, #f0fdfa, #eff6ff)', border: '1px solid #bfdbfe', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '260px' }}>
            <h3 style={{ color: '#1e3a8a', fontSize: '18px', fontWeight: '700', marginBottom: '6px' }}>
              File Inquiries and Track complaints
            </h3>
            <p style={{ color: '#475569', fontSize: '14px', lineHeight: '1.5' }}>
              Log in to your student account to access the Kerala Students Union help desk. Submit issues directly to the admins
              and track their status.
            </p>
          </div>
          <button className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }} onClick={() => setShowAuthModal(true)}>
            <i className="ti ti-login"></i> Log In to File Inquiries
          </button>
        </div>
      )}

      {/* Logged in student shortcut */}
      {loggedStudent && (
        <div className="card" style={{ display: 'flex', gap: '20px', alignItems: 'center', background: 'linear-gradient(135deg, #f0fdfa, #eff6ff)', border: '1px solid #bfdbfe', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '260px' }}>
            <h3 style={{ color: '#1e3a8a', fontSize: '18px', fontWeight: '700', marginBottom: '6px' }}>
              Need Help? File a Complaint
            </h3>
            <p style={{ color: '#475569', fontSize: '14px', lineHeight: '1.5' }}>
              File an official request or complaint regarding hostels, dining, or amenities and get a formal response letter back.
            </p>
          </div>
          <button className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }} onClick={() => setActiveModule('queries')}>
            <i className="ti ti-mail"></i> File Complaint
          </button>
        </div>
      )}

      {/* Feature Grid */}
      <h2 style={{ fontSize: '22px', fontWeight: '800', color: '#0f172a', marginBottom: '18px', letterSpacing: '-0.02em' }}>
        Portal Features & Resources
      </h2>
      
      <div className="preview-grid" style={{ marginBottom: '24px' }}>
        {features.map((feat) => (
          <div className="preview-card" key={feat.id} onClick={() => setActiveModule(feat.id)}>
            <div>
              <div className="preview-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div className="preview-icon-box">
                    <i className={`ti ${feat.icon}`}></i>
                  </div>
                  <h3 className="preview-title" style={{ fontSize: '16px' }}>{feat.title}</h3>
                </div>
              </div>
              <p className="preview-content" style={{ fontSize: '13.5px', marginTop: '4px' }}>
                {feat.description}
              </p>
            </div>
            <button className="preview-btn-text" style={{ fontSize: '13px' }}>
              Explore <i className="ti ti-arrow-right"></i>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
