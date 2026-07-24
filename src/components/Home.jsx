import React, { useState, useEffect } from 'react';
import { supabase, hasSupabaseConfig } from '../utils/supabaseClient';
import Typewriter from './Typewriter';
import BorderGlow from './BorderGlow';
import CountUp from './CountUp';
import MagicBento from './MagicBento';
import DomeGallery from './DomeGallery';
import Marquee from './Marquee';

// Dynamically import all images placed in src/assets/gallery/
const galleryModules = import.meta.glob('../assets/gallery/*.{png,jpg,jpeg,webp}', { eager: true });
const uploadedImages = Object.values(galleryModules).map(module => module.default);

// If the folder is empty, use some beautiful CUSAT/Campus themed fallbacks so the dome is visible
const fallbackImages = [
  "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1562774053-701939374585?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1509062522246-3755977927d7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1519452314545-57cb024c0df2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
];

const galleryImages = uploadedImages.length > 0 ? uploadedImages : fallbackImages;

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
  loggedStudent,
  announcements,
  userRole
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
      id: 'helpdesk',
      category: 'info',
      title: 'Helpdesk Directory',
      icon: 'ti-headset',
      key: 'H',
      description: 'Reach out to our dedicated KSU representatives and department helpdesk teams for assistance.'
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
    },
    {
      id: 'turfs',
      category: 'campus_life',
      title: 'Turfs & Arenas',
      icon: 'ti-ball-football',
      key: 'T',
      description: 'Find football turfs, badminton courts, and sports arenas near the campus with timing and rent details.'
    }
  ];

  const handleStatClick = (moduleName, mobileTabId) => {
    if (window.innerWidth <= 768 && mobileTabId) {
      window.dispatchEvent(new CustomEvent('open-mobile-sheet', { detail: { tabId: mobileTabId } }));
    } else {
      setActiveModule(moduleName);
    }
  };

  return (
    <div className="home-container">
      <Marquee 
        announcements={announcements} 
        onNavigate={(route) => {
          if (route === 'register') {
            setShowAuthModal(true);
          } else {
            setActiveModule(route);
          }
        }} 
      />

      {/* Hero Section */}
      <div className="hero-section">
        {userRole === 'student' && loggedStudent ? (
          <div className="hero-content">
            <h2 className="hero-title">Welcome back, {loggedStudent.full_name.split(' ')[0]}!</h2>
            <p className="hero-subtitle" style={{ minHeight: '60px' }}>
              Your campus assistant is ready. Use the quick links below or 
              navbar tabs to search accommodations, check holidays, or file new inquiries.
            </p>
          </div>
        ) : (
          <div className="hero-content">
            <h2 className="hero-title">KSU Students Portal</h2>
            <p className="hero-subtitle" style={{ minHeight: '60px' }}>
              <Typewriter 
                text="Your ultimate campus assistant for staying, dining, and navigating CUSAT. Find boys and girls PG accommodations, tea spots, and key campus contacts." 
                speed={30} 
              />
            </p>
          </div>
        )}
      </div>

      {/* Quick statistics (Floating over hero) */}
      <div className="quick-stats-container">
        <div className="quick-stats">
          <BorderGlow className="stat-item" borderRadius={16} glowRadius={20}>
            <div onClick={() => handleStatClick('calendar', 'info')} style={{ cursor: 'pointer', width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div className="stat-icon"><i className="ti ti-calendar-event"></i></div>
              <div className="stat-val"><CountUp to={academicEvents.length} /></div>
              <div className="stat-lbl">EVENTS</div>
            </div>
          </BorderGlow>
          <BorderGlow className="stat-item" borderRadius={16} glowRadius={20}>
            <div onClick={() => handleStatClick('boysPgs', 'stay')} style={{ cursor: 'pointer', width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div className="stat-icon"><i className="ti ti-bed"></i></div>
              <div className="stat-val"><CountUp to={boysPgs.length + girlsPgs.length} /></div>
              <div className="stat-lbl">PG ACCOMMODATIONS</div>
            </div>
          </BorderGlow>
          <BorderGlow className="stat-item" borderRadius={16} glowRadius={20}>
            <div onClick={() => handleStatClick('food', 'food')} style={{ cursor: 'pointer', width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div className="stat-icon"><i className="ti ti-coffee"></i></div>
              <div className="stat-val"><CountUp to={foodSpots.length + restaurants.length} /></div>
              <div className="stat-lbl">DINING</div>
            </div>
          </BorderGlow>
          <BorderGlow className="stat-item" borderRadius={16} glowRadius={20}>
            <div onClick={() => handleStatClick('amenities', 'info')} style={{ cursor: 'pointer', width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div className="stat-icon"><i className="ti ti-shopping-cart"></i></div>
              <div className="stat-val"><CountUp to={amenities.length} /></div>
              <div className="stat-lbl">AMENITIES</div>
            </div>
          </BorderGlow>
          <BorderGlow className="stat-item" borderRadius={16} glowRadius={20}>
            <div onClick={() => handleStatClick('clubs', 'menu')} style={{ cursor: 'pointer', width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div className="stat-icon"><i className="ti ti-users-group"></i></div>
              <div className="stat-val"><CountUp to={clubs.length} /></div>
              <div className="stat-lbl">CLUBS</div>
            </div>
          </BorderGlow>
        </div>
      </div>

      {/* Magic Bento Features Grid */}
      <div style={{ marginTop: '40px', padding: '0 10px' }}>
        <h2 style={{ textAlign: 'center', color: 'var(--text-primary)', marginBottom: '30px', fontSize: '28px', fontWeight: '800' }}>Explore Your Campus</h2>
        <MagicBento 
          textAutoHide={false}
          enableStars={true}
          enableSpotlight={true}
          enableBorderGlow={true}
          enableTilt={true}
          enableMagnetism={true}
          clickEffect={true}
          spotlightRadius={300}
          particleCount={15}
          glowColor="59, 130, 246"
          onNavigate={(id) => setActiveModule(id)}
        />
      </div>

      {/* Join KSU Banner */}
      <BorderGlow className="card" style={{ display: 'flex', gap: '20px', alignItems: 'center', background: 'linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%)', border: '1px solid #7dd3fc', flexWrap: 'wrap', marginBottom: '24px' }}>
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
          className="btn-primary slide-in-btn" 
          style={{ background: '#0284c7', fontSize: '15px' }} 
          onClick={() => setActiveModule('join_ksu')}
        >
          <i className="ti ti-arrow-right"></i> <span className="btn-text">Join KSU</span>
        </button>
      </BorderGlow>

      {/* Guest Call to Action */}
      {!loggedStudent && (
        <BorderGlow className="card" style={{ display: 'flex', gap: '20px', alignItems: 'center', background: 'var(--bg-hover)', border: '1px solid var(--border-color)', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '260px' }}>
            <h3 style={{ color: 'var(--text-primary)', fontSize: '18px', fontWeight: '700', marginBottom: '6px' }}>
              File Inquiries and Track complaints
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: '1.5' }}>
              Log in to your student account to access the Kerala Students Union help desk. Submit issues directly to the admins
              and track their status.
            </p>
          </div>
          <button className="btn-secondary slide-in-btn" onClick={() => setShowAuthModal(true)}>
            <i className="ti ti-login"></i> <span className="btn-text">Log In to File Inquiries</span>
          </button>
        </BorderGlow>
      )}

      {/* Logged in student shortcut */}
      {loggedStudent && (
        <BorderGlow className="card" style={{ display: 'flex', gap: '20px', alignItems: 'center', background: 'var(--bg-hover)', border: '1px solid var(--border-color)', flexWrap: 'wrap' }}>
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
        </BorderGlow>
      )}

      {/* Announcements & Photo Gallery */}
      <div style={{ marginTop: '32px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', padding: '0 10px', marginBottom: '40px' }}>
        

        {/* Photo Gallery Stack Box */}
        <BorderGlow 
          className="card" 
          glowRadius={40} 
          borderRadius={20} 
          style={{ background: 'var(--bg-hover)', border: '1px solid var(--border-color)', position: 'relative', overflow: 'hidden', minHeight: '450px' }} 
        >
          <div style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
            <DomeGallery
              images={galleryImages}
              fit={0.8}
              fitBasis="width"
              minRadius={350}
              maxVerticalRotationDeg={8}
              segments={22}
              dragDampening={0.8}
              grayscale={false}
              overlayBlurColor="transparent"
            />
          </div>
        </BorderGlow>

      </div>
    </div>
  );
}
