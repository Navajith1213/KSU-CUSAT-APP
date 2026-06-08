import React, { useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';

export default function AcademicResources({ userRole, setShowAuthModal }) {
  const [resources, setResources] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [activeDepartment, setActiveDepartment] = useState('');
  const [activeType, setActiveType] = useState('All');
  const [isLoading, setIsLoading] = useState(true);

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

  useEffect(() => {
    if (userRole !== 'user') {
      fetchResources();
    }
  }, [userRole]);

  const [searchQuery, setSearchQuery] = useState('');

  const types = ['All', 'Notes', 'PYQ', 'Syllabus', 'Other'];

  const filteredResources = resources.filter(r => {
    if (r.department !== activeDepartment) return false;
    if (activeType !== 'All' && r.resource_type !== activeType) return false;
    if (searchQuery && !r.subject.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  // Group filtered resources by year_semester
  const groupedResources = filteredResources.reduce((acc, resource) => {
    const sem = resource.year_semester || 'Other';
    if (!acc[sem]) {
      acc[sem] = [];
    }
    acc[sem].push(resource);
    return acc;
  }, {});

  // Sort groups alphabetically (S1, S2, etc.)
  const sortedSemesters = Object.keys(groupedResources).sort();

  const [selectedDocument, setSelectedDocument] = useState(null);

  // Convert standard Drive links to embeddable preview links
  const getDriveEmbedUrl = (url) => {
    if (!url) return '';
    try {
      // Handle standard file view URLs
      if (url.includes('drive.google.com/file/d/')) {
        return url.replace(/\/view.*$/, '/preview');
      }
      // Handle folder URLs
      if (url.includes('drive.google.com/drive/folders/')) {
        const folderIdMatch = url.match(/folders\/([a-zA-Z0-9-_]+)/);
        if (folderIdMatch && folderIdMatch[1]) {
          return `https://drive.google.com/embeddedfolderview?id=${folderIdMatch[1]}#grid`;
        }
      }
      return url; // fallback
    } catch (e) {
      return url;
    }
  };

  const getResourceIcon = (type) => {
    switch(type) {
      case 'Notes': return <i className="ti ti-file-text" style={{ fontSize: '20px', color: '#3b82f6' }}></i>;
      case 'PYQ': return <i className="ti ti-help" style={{ fontSize: '20px', color: '#f59e0b' }}></i>;
      case 'Syllabus': return <i className="ti ti-book" style={{ fontSize: '20px', color: '#10b981' }}></i>;
      default: return <i className="ti ti-file" style={{ fontSize: '20px', color: '#8b5cf6' }}></i>;
    }
  };

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
            {/* Top Toolbar: Search and Filter */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
              <div style={{ position: 'relative', flex: '1', minWidth: '250px' }}>
                <i className="ti ti-search" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}></i>
                <input 
                  type="text" 
                  placeholder={`Search ${activeDepartment} notes...`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ width: '100%', padding: '10px 10px 10px 36px', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '14px' }}
                />
              </div>
              
              {/* Type Filter */}
              <div style={{ display: 'flex', gap: '6px', background: 'var(--bg-hover)', padding: '4px', borderRadius: '10px' }}>
                {types.map(type => (
                  <button
                    key={type}
                    onClick={() => setActiveType(type)}
                    style={{
                      background: activeType === type ? '#fff' : 'transparent',
                      color: activeType === type ? '#0284c7' : '#475569',
                      border: 'none',
                      padding: '6px 14px',
                      borderRadius: '6px',
                      fontSize: '13px',
                      fontWeight: activeType === type ? '700' : '500',
                      boxShadow: activeType === type ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {filteredResources.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px' }}>
                <i className="ti ti-search" style={{ fontSize: '40px', color: '#cbd5e1', marginBottom: '12px' }}></i>
                <p style={{ color: 'var(--text-muted)' }}>No materials found matching your search.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                {sortedSemesters.map(sem => (
                  <div key={sem} className="semester-group">
                    <h3 style={{ 
                      fontSize: '18px', 
                      color: 'var(--text-primary)', 
                      borderBottom: '2px solid var(--bg-hover)', 
                      paddingBottom: '8px', 
                      marginBottom: '16px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}>
                      <i className="ti ti-folder" style={{ color: '#0284c7' }}></i>
                      {sem}
                    </h3>
                    <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
                      {groupedResources[sem].map(resource => (
                        <div key={resource.id} className="item-card" style={{ display: 'flex', flexDirection: 'column' }}>
                          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '12px' }}>
                            <div style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px',
                              background: 'var(--bg-hover)',
                              color: '#0369a1',
                              padding: '4px 10px',
                              borderRadius: '20px',
                              fontSize: '11px',
                              fontWeight: '700',
                              textTransform: 'uppercase'
                            }}>
                              {getResourceIcon(resource.resource_type)}
                              {resource.resource_type}
                            </div>
                            <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '600', padding: '4px 0' }}>
                              {new Date(resource.created_at).toLocaleDateString()}
                            </span>
                          </div>
                          
                          <h3 style={{ fontSize: '16px', margin: '0 0 8px 0', color: 'var(--text-primary)', lineHeight: '1.4' }}>{resource.subject}</h3>
                          
                          <button 
                            onClick={() => setSelectedDocument(resource)}
                            className="btn-primary"
                            style={{ width: '100%', display: 'flex', justifyContent: 'center', gap: '8px', marginTop: 'auto', padding: '10px' }}
                          >
                            <i className="ti ti-eye"></i> Read Document
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Document Viewer Modal Overlay */}
      {selectedDocument && (
        <div className="modal-overlay" onClick={() => setSelectedDocument(null)} style={{ zIndex: 9999 }}>
          <div 
            className="modal-content" 
            onClick={(e) => e.stopPropagation()} 
            style={{ 
              width: '90%', 
              maxWidth: '1000px', 
              height: '85vh', 
              display: 'flex', 
              flexDirection: 'column', 
              padding: '16px',
              backgroundColor: '#fff'
            }}
          >
            <div className="modal-header" style={{ marginBottom: '12px' }}>
              <div>
                <h2 style={{ fontSize: '20px', margin: 0 }}>{selectedDocument.subject}</h2>
                <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-muted)' }}>
                  {selectedDocument.resource_type} • {selectedDocument.year_semester}
                </p>
              </div>
              <button className="close-btn" onClick={() => setSelectedDocument(null)}>&times;</button>
            </div>
            
            <div style={{ flex: 1, borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border-color)', position: 'relative' }}>
              <iframe 
                src={getDriveEmbedUrl(selectedDocument.drive_link)} 
                style={{ width: '100%', height: '100%', border: 'none' }}
                allow="autoplay"
                title={selectedDocument.subject}
              ></iframe>
            </div>

            <div style={{ marginTop: '12px', textAlign: 'center' }}>
              <a 
                href={selectedDocument.drive_link} 
                target="_blank" 
                rel="noopener noreferrer"
                style={{ fontSize: '13px', color: '#0284c7', textDecoration: 'none' }}
              >
                Open in new tab <i className="ti ti-external-link"></i>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
