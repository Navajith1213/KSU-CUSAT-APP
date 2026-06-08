import React, { useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';

export default function AcademicResources({ userRole, setShowAuthModal }) {
  const [resources, setResources] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [activeDepartment, setActiveDepartment] = useState('');
  const [activeType, setActiveType] = useState('All');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (userRole !== 'user') {
      fetchResources();
    }
  }, [userRole]);

  const fetchResources = async () => {
    try {
      const { data, error } = await supabase
        .from('academic_resources')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      setResources(data || []);
      
      // Extract unique departments
      const deps = [...new Set((data || []).map(r => r.department))].sort();
      setDepartments(deps);
      
      if (deps.length > 0) {
        setActiveDepartment(deps[0]);
      }
    } catch (error) {
      console.error('Error fetching academic resources:', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const types = ['All', 'Notes', 'PYQ', 'Syllabus', 'Other'];

  const filteredResources = resources.filter(r => {
    if (r.department !== activeDepartment) return false;
    if (activeType !== 'All' && r.resource_type !== activeType) return false;
    return true;
  });

  if (userRole === 'user') {
    return (
      <div className="fade-in-section" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <div className="card" style={{ textAlign: 'center', maxWidth: '420px', padding: '48px 32px', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05)' }}>
          <div style={{ 
            width: '80px', height: '80px', background: 'var(--bg-hover)', borderRadius: '50%', 
            display: 'flex', alignItems: 'center', justifyContent: 'center', 
            margin: '0 auto 20px auto' 
          }}>
            <i className="ti ti-lock" style={{ fontSize: '36px', color: '#f59e0b' }}></i>
          </div>
          <h2 style={{ fontSize: '24px', marginBottom: '12px', color: 'var(--text-primary)' }}>Locked Resources</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '28px', lineHeight: '1.6', fontSize: '15px' }}>
            Please register or log in to access free notes, previous year question papers, and other academic materials!
          </p>
          <button className="btn-primary" onClick={() => setShowAuthModal(true)} style={{ width: '100%', padding: '14px', fontSize: '15px' }}>
            <i className="ti ti-user-plus" style={{ marginRight: '8px' }}></i>
            Register / Log In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fade-in-section">
      <div className="hero-section" style={{ padding: '32px 24px', marginBottom: '24px' }}>
        <h1 className="hero-title" style={{ fontSize: '28px' }}>Academic Resources</h1>
        <p className="hero-subtitle">Access previous year question papers, notes, and study materials provided by your department.</p>
      </div>

      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <i className="ti ti-loader" style={{ fontSize: '24px', animation: 'spin 1s linear infinite' }}></i>
          <p style={{ marginTop: '10px', color: 'var(--text-muted)' }}>Loading resources...</p>
        </div>
      ) : departments.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
          <i className="ti ti-books" style={{ fontSize: '48px', color: '#cbd5e1', marginBottom: '16px' }}></i>
          <h3>No Resources Available</h3>
          <p style={{ color: 'var(--text-muted)', marginTop: '8px' }}>No academic resources have been uploaded yet.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Department Tabs */}
          <div className="filter-bar" style={{ gap: '8px', overflowX: 'auto', flexWrap: 'nowrap', paddingBottom: '4px' }}>
            {departments.map(dep => (
              <button
                key={dep}
                className={`admin-tab-btn ${activeDepartment === dep ? 'active' : ''}`}
                onClick={() => setActiveDepartment(dep)}
                style={{ borderRadius: '20px', padding: '8px 16px', whiteSpace: 'nowrap' }}
              >
                {dep}
              </button>
            ))}
          </div>

          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '16px' }}>
              <h2 style={{ margin: 0 }}>{activeDepartment} Materials</h2>
              
              {/* Type Filter */}
              <div style={{ display: 'flex', gap: '8px' }}>
                {types.map(type => (
                  <button
                    key={type}
                    onClick={() => setActiveType(type)}
                    style={{
                      background: activeType === type ? '#0d9488' : '#f1f5f9',
                      color: activeType === type ? 'white' : '#475569',
                      border: 'none',
                      padding: '6px 12px',
                      borderRadius: '8px',
                      fontSize: '13px',
                      fontWeight: '600',
                      cursor: 'pointer'
                    }}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {filteredResources.length === 0 ? (
              <p style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>No {activeType !== 'All' ? activeType : 'resources'} found for this department.</p>
            ) : (
              <div className="grid">
                {filteredResources.map(resource => (
                  <div key={resource.id} className="item-card">
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '12px' }}>
                      <div style={{
                        background: 'var(--bg-hover)',
                        color: '#0369a1',
                        padding: '4px 8px',
                        borderRadius: '6px',
                        fontSize: '11px',
                        fontWeight: '700',
                        textTransform: 'uppercase'
                      }}>
                        {resource.resource_type}
                      </div>
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '600' }}>
                        {resource.year_semester}
                      </span>
                    </div>
                    
                    <h3 style={{ fontSize: '16px', margin: '0 0 16px 0', color: 'var(--text-primary)' }}>{resource.subject}</h3>
                    
                    <a 
                      href={resource.drive_link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="btn-primary"
                      style={{ textDecoration: 'none', display: 'flex', justifyContent: 'center', gap: '8px', marginTop: 'auto' }}
                    >
                      <i className="ti ti-brand-google-drive"></i> View File
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
