import React, { useState, useEffect } from 'react';
import { supabase, hasSupabaseConfig } from '../utils/supabaseClient';

export default function Home({
  academicEvents,
  boysPgs,
  girlsPgs,
  hostels = [],
  foodSpots,
  restaurants,
  amenities,
  clubs,
  setActiveModule,
  setShowAuthModal,
  loggedStudent
}) {
  const [queryCount, setQueryCount] = useState(0);

  // Fetch active queries count for logged student
  useEffect(() => {
    if (!loggedStudent) {
      setQueryCount(0);
      return;
    }
    
    if (hasSupabaseConfig) {
      supabase
        .from('complaints')
        .select('id', { count: 'exact', head: true })
        .eq('student_email', loggedStudent.email)
        .then(({ count, error }) => {
          if (!error) setQueryCount(count || 0);
        });
    } else {
      const mockHistory = JSON.parse(localStorage.getItem(`mock_queries_${loggedStudent.email}`) || '[]');
      setQueryCount(mockHistory.length);
    }
  }, [loggedStudent]);

  const categories = [
    { 
      id: 'info', 
      title: 'Campus Information', 
      description: 'Stay updated with official schedules and helpline directories.' 
    },
    { 
      id: 'accommodations', 
      title: 'Stay & Accommodations', 
      description: 'Find hostels, PGs, and shared rooms near CUSAT.' 
    },
    { 
      id: 'dining', 
      title: 'Dining & Food Joints', 
      description: 'Explore campus canteens, tea joints, and local dining hubs.' 
    },
    { 
      id: 'campus_life', 
      title: 'Campus Life & Conveniences', 
      description: 'Discover student clubs, convenience shops, and campus amenities.' 
    }
  ];

  const features = [
    {
      id: 'calendar',
      category: 'info',
      title: 'Academic Calendar',
      icon: 'ti-calendar',
      key: 'C',
      description: 'Check crucial dates including semester registrations, mid-term examinations, and official university holidays.'
    },
    {
      id: 'contacts',
      category: 'info',
      title: 'Campus Departments',
      icon: 'ti-building',
      description: 'Find administrative department details, university office locations, and google map directions instantly.'
    },
    {
      id: 'boysPgs',
      category: 'accommodations',
      title: "Boys PG's",
      icon: 'ti-building-community',
      key: 'B',
      description: 'Explore verified boys PG and hostel listings near Kalamassery campus with mess options, rent details, and room types.'
    },
    {
      id: 'girlsPgs',
      category: 'accommodations',
      title: "Girls PG's",
      icon: 'ti-home-2',
      key: 'G',
      description: 'Browse girls-only PG accommodations and hostels around CUSAT with food availability, rent ranges, and contact details.'
    },
    {
      id: 'hostels',
      category: 'accommodations',
      title: 'College Hostels',
      icon: 'ti-building',
      key: 'H',
      description: 'Browse official CUSAT university/college hostels with warden details, secretaries contacts, fee structures, and mess details.'
    },
    {
      id: 'food',
      category: 'dining',
      title: 'Evening Tea Spots',
      icon: 'ti-coffee',
      key: 'T',
      description: 'Locate local student canteens, tea joints, and evening fast food outlets around the CUSAT road corridor.'
    },
    {
      id: 'restaurants',
      category: 'dining',
      title: 'Restaurants',
      icon: 'ti-tools-kitchen-2',
      key: 'R',
      description: 'Browse local lunch tables, biryani counters, arabic kitchens, and vegetarian dining centers near the Metro link.'
    },
    {
      id: 'amenities',
      category: 'campus_life',
      title: 'Amenities & Shops',
      icon: 'ti-map-pin',
      key: 'A',
      description: 'Quickly find critical campus amenities such as laundry services, stationery/xerox hubs, and medical stores.'
    },
    {
      id: 'clubs',
      category: 'campus_life',
      title: 'Campus Clubs',
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
          <div className="hero-content">
            <h2 className="hero-title">
              Welcome back, {loggedStudent.full_name}!
            </h2>
            <p className="hero-subtitle">
              Your student dashboard is active. You have submitted{' '}
              <strong>{queryCount} support ticket(s)</strong>. Use the
              navbar tabs to search accommodations, check holidays, or file new inquiries.
            </p>
          </div>
        ) : (
          <div className="hero-content">
            <h2 className="hero-title">KSU Students Portal</h2>
            <p className="hero-subtitle">
              Your ultimate campus assistant for staying, dining, and navigating CUSAT. Find boys and girls PG
              accommodations, tea spots, and key campus contacts.
            </p>
          </div>
        )}
      </div>

      {/* Quick statistics (Floating over hero) */}
      <div className="quick-stats-container">
        <div className="quick-stats">
          <div className="stat-item">
            <div className="stat-icon"><i className="ti ti-calendar-event"></i></div>
            <div className="stat-val">{academicEvents.length}</div>
            <div className="stat-lbl">Events</div>
          </div>
          <div className="stat-item">
            <div className="stat-icon"><i className="ti ti-bed"></i></div>
            <div className="stat-val">{boysPgs.length + girlsPgs.length + hostels.length}</div>
            <div className="stat-lbl">PG Accommodations</div>
          </div>
          <div className="stat-item">
            <div className="stat-icon"><i className="ti ti-coffee"></i></div>
            <div className="stat-val">{foodSpots.length + restaurants.length}</div>
            <div className="stat-lbl">Dining</div>
          </div>
          <div className="stat-item">
            <div className="stat-icon"><i className="ti ti-shopping-cart"></i></div>
            <div className="stat-val">{amenities.length}</div>
            <div className="stat-lbl">Amenities</div>
          </div>
          <div className="stat-item">
            <div className="stat-icon"><i className="ti ti-users-group"></i></div>
            <div className="stat-val">{clubs.length}</div>
            <div className="stat-lbl">Clubs</div>
          </div>
        </div>
      </div>

      {/* Join KSU Banner */}
      <div className="card" style={{ display: 'flex', gap: '20px', alignItems: 'center', background: 'linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%)', border: '1px solid #7dd3fc', flexWrap: 'wrap', marginBottom: '24px' }}>
        <div style={{ flex: 1, minWidth: '260px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <i className="ti ti-users-group" style={{ fontSize: '20px', color: '#0369a1' }}></i>
            <h3 style={{ color: '#0369a1', fontSize: '18px', fontWeight: '800', margin: 0 }}>
              Become a part of KSU
            </h3>
          </div>
          <p style={{ color: '#0c4a6e', fontSize: '14.5px', lineHeight: '1.5', margin: 0, fontWeight: '500' }}>
            Stand for student rights, welfare, and progressive values on campus. Join the movement today!
          </p>
        </div>
        <button 
          className="btn-primary" 
          style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#0284c7', padding: '10px 20px', fontSize: '15px' }} 
          onClick={() => setActiveModule('join_ksu')}
        >
          Join KSU <i className="ti ti-arrow-right"></i>
        </button>
      </div>

      {/* Guest Call to Action */}
      {!loggedStudent && (
        <div className="card" style={{ display: 'flex', gap: '20px', alignItems: 'center', background: 'var(--bg-hover)', border: '1px solid var(--border-color)', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '260px' }}>
            <h3 style={{ color: 'var(--text-primary)', fontSize: '18px', fontWeight: '700', marginBottom: '6px' }}>
              File Inquiries and Track complaints
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: '1.5' }}>
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
        <div className="card" style={{ display: 'flex', gap: '20px', alignItems: 'center', background: 'var(--bg-hover)', border: '1px solid var(--border-color)', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '260px' }}>
            <h3 style={{ color: 'var(--text-primary)', fontSize: '18px', fontWeight: '700', marginBottom: '6px' }}>
              Need Help? File a Complaint
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: '1.5' }}>
              File an official request or complaint regarding hostels, dining, or amenities and get a formal response letter back.
            </p>
          </div>
          <button className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }} onClick={() => setActiveModule('queries')}>
            <i className="ti ti-mail"></i> File Complaint
          </button>
        </div>
      )}

      {/* Grouped Feature Grids */}
      <div style={{ marginTop: '24px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '8px', letterSpacing: '-0.02em' }}>
          Portal Features & Resources
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '14.5px', marginBottom: '16px' }}>
          Explore CUSAT portal categories and student service hubs.
        </p>

        {categories.map((cat) => {
          const catFeatures = features.filter((feat) => feat.category === cat.id);
          if (catFeatures.length === 0) return null;

          return (
            <div key={cat.id} style={{ marginBottom: '32px' }}>
              <h3 className="home-category-title">{cat.title}</h3>
              <p className="home-category-desc">{cat.description}</p>
              
              <div className="preview-grid">
                {catFeatures.map((feat) => (
                  <div className="preview-card" key={feat.id} onClick={() => setActiveModule(feat.id)}>
                    <div>
                      <div className="preview-header">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                          <div className="preview-icon-box">
                            <i className={`ti ${feat.icon}`}></i>
                          </div>
                          <h4 className="preview-title" style={{ fontSize: '16px', margin: 0 }}>{feat.title}</h4>
                        </div>
                      </div>
                      <p className="preview-content" style={{ fontSize: '13.5px', marginTop: '8px' }}>
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
        })}
      </div>
    </div>
  );
}
