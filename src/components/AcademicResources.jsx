import React, { useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';
import BorderGlow from './BorderGlow';

export default function AcademicResources({ userRole, setShowAuthModal }) {
  const [resources, setResources] = useState([]);
  const [departments, setDepartments] = useState([]);
  
  // Navigation State
  const [activeDepartment, setActiveDepartment] = useState('');
  const [activeCourse, setActiveCourse] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDocument, setSelectedDocument] = useState(null);

  const fetchResources = async () => {
    try {
      const { data, error } = await supabase
        .from('academic_resources')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      setResources(data || []);
      
      const deps = [...new Set((data || []).map(r => r.department))].sort();
      setDepartments(deps);
      
      if (deps.length > 0) setActiveDepartment(deps[0]);
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

  // Derived State for Drill Down
  const deptResources = resources.filter(r => r.department === activeDepartment);
  
  const courses = [...new Set(deptResources.map(r => r.course || 'General'))].sort();
  
  useEffect(() => {
    if (courses.length > 0 && !courses.includes(activeCourse)) {
      setActiveCourse(courses[0]);
    } else if (courses.length === 0) {
      setActiveCourse('');
    }
  }, [activeDepartment, courses]);

  // Apply Search and Course filters
  const filteredResources = deptResources.filter(r => {
    if ((r.course || 'General') !== activeCourse) return false;
    if (searchQuery && !r.subject.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  // Group by Semester -> Subject -> Array of Types
  const groupedData = {};
  filteredResources.forEach(res => {
    const sem = res.year_semester || 'General';
    const sub = res.subject || 'Unknown Subject';
    
    if (!groupedData[sem]) groupedData[sem] = {};
    if (!groupedData[sem][sub]) groupedData[sem][sub] = [];
    
    groupedData[sem][sub].push(res);
  });

  const sortedSemesters = Object.keys(groupedData).sort();
  const syllabusData = groupedData['Syllabus'];
  const regularSemesters = sortedSemesters.filter(s => s !== 'Syllabus');

  // Drive embed logic
  const getDriveEmbedUrl = (url) => {
    if (!url) return '';
    try {
      if (url.includes('drive.google.com/file/d/')) {
        return url.replace(/\/view.*$/, '/preview');
      }
      if (url.includes('drive.google.com/drive/folders/')) {
        const folderIdMatch = url.match(/folders\/([a-zA-Z0-9-_]+)/);
        if (folderIdMatch && folderIdMatch[1]) {
          return `https://drive.google.com/embeddedfolderview?id=${folderIdMatch[1]}#grid`;
        }
      }
      return url;
    } catch (e) {
      return url;
    }
  };

  const getResourceIcon = (type) => {
    const t = type.toLowerCase();
    if (t.includes('note')) return 'ti-file-text';
    if (t.includes('pyq') || t.includes('question')) return 'ti-help';
    if (t.includes('syllab')) return 'ti-book';
    return 'ti-file';
  };

  const getResourceColor = (type) => {
    const t = type.toLowerCase();
    if (t.includes('note')) return '#3b82f6';
    if (t.includes('pyq') || t.includes('question')) return '#f59e0b';
    if (t.includes('syllab')) return '#10b981';
    return '#8b5cf6';
  };

  if (userRole === 'user') {
    return (
      <div className="fade-in-section" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <BorderGlow className="card" style={{ textAlign: 'center', maxWidth: '420px', padding: '48px 32px', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05)' }}>
          <div style={{ width: '80px', height: '80px', background: 'var(--bg-hover)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px auto' }}>
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
        </BorderGlow>
      </div>
    );
  }

  return (
    <div className="fade-in-section">
      <div className="hero-section" style={{ padding: '32px 24px', marginBottom: '24px' }}>
        <h1 className="hero-title" style={{ fontSize: '28px' }}>Academic Resources</h1>
        <p className="hero-subtitle">Access your course materials beautifully organized by your department.</p>
      </div>

      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <i className="ti ti-loader" style={{ fontSize: '24px', animation: 'spin 1s linear infinite' }}></i>
          <p style={{ marginTop: '10px', color: 'var(--text-muted)' }}>Loading resources...</p>
        </div>
      ) : departments.length === 0 ? (
        <BorderGlow className="card" style={{ textAlign: 'center', padding: '40px' }}>
          <i className="ti ti-books" style={{ fontSize: '48px', color: '#cbd5e1', marginBottom: '16px' }}></i>
          <h3>No Resources Available</h3>
          <p style={{ color: 'var(--text-muted)', marginTop: '8px' }}>No academic resources have been synced yet.</p>
        </BorderGlow>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Level 1: Department Tabs */}
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

          <BorderGlow className="card">
            {/* Level 2: Course Selection */}
            {courses.length > 0 && (
              <div style={{ marginBottom: '24px' }}>
                <h3 style={{ fontSize: '14px', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '12px', letterSpacing: '0.5px' }}>Select Course</h3>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {courses.map(course => (
                    <button
                      key={course}
                      onClick={() => setActiveCourse(course)}
                      style={{
                        padding: '8px 16px',
                        borderRadius: '8px',
                        border: '1px solid',
                        borderColor: activeCourse === course ? 'var(--primary-color)' : 'var(--border-color)',
                        background: activeCourse === course ? 'var(--primary-color)' : 'transparent',
                        color: activeCourse === course ? '#fff' : 'var(--text-primary)',
                        fontWeight: '600',
                        fontSize: '14px',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                    >
                      {course}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Top Toolbar: Search */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
              <div style={{ position: 'relative', flex: '1' }}>
                <i className="ti ti-search" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}></i>
                <input 
                  type="text" 
                  placeholder={`Search subjects in ${activeCourse}...`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ 
                    width: '100%', 
                    padding: '12px 12px 12px 40px', 
                    borderRadius: '8px', 
                    border: '1px solid var(--border-color)', 
                    fontSize: '15px',
                    color: 'var(--text-primary)',
                    backgroundColor: 'var(--bg-main)'
                  }}
                />
              </div>
            </div>

            {filteredResources.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px' }}>
                <i className="ti ti-search" style={{ fontSize: '40px', color: '#cbd5e1', marginBottom: '12px' }}></i>
                <p style={{ color: 'var(--text-muted)' }}>No materials found for this course.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                
                {/* Level 3A: Syllabuses (Special Highlighted Section) */}
                {syllabusData && (
                  <div className="syllabus-group" style={{ background: 'var(--primary-glow)', padding: '24px', borderRadius: '16px', border: '1px solid var(--border-color)', boxShadow: '0 4px 20px var(--shadow-color)' }}>
                    <h3 style={{ fontSize: '20px', color: 'var(--primary-color)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <i className="ti ti-book"></i> Course Syllabuses
                    </h3>
                    <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
                      {Object.keys(syllabusData).sort((a,b) => b.localeCompare(a)).map(adYear => (
                        <div key={adYear} className="item-card" style={{ padding: '16px', background: 'var(--bg-main)' }}>
                          <h4 style={{ fontSize: '16px', marginBottom: '12px', color: 'var(--text-primary)' }}>{adYear}</h4>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {syllabusData[adYear].map(file => (
                              <button 
                                key={file.id}
                                onClick={() => setSelectedDocument(file)}
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'space-between',
                                  width: '100%',
                                  padding: '10px 14px',
                                  background: 'var(--bg-hover)',
                                  border: '1px solid var(--border-color)',
                                  borderRadius: '8px',
                                  cursor: 'pointer',
                                  transition: 'all 0.2s',
                                  textAlign: 'left'
                                }}
                                onMouseOver={(e) => Object.assign(e.currentTarget.style, { borderColor: getResourceColor('Syllabus'), transform: 'translateX(4px)' })}
                                onMouseOut={(e) => Object.assign(e.currentTarget.style, { borderColor: 'var(--border-color)', transform: 'translateX(0)' })}
                              >
                                <span style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
                                  <i className="ti ti-file-text" style={{ color: getResourceColor('Syllabus'), fontSize: '18px' }}></i>
                                  <span style={{ fontSize: '14px', color: 'var(--text-primary)', fontWeight: '600' }}>{file.topic || file.resource_type}</span>
                                </span>
                                <i className="ti ti-external-link" style={{ color: 'var(--text-muted)' }}></i>
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Level 3B: Regular Semester Loop */}
                {regularSemesters.map(sem => (
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
                      <i className="ti ti-folder-open" style={{ color: 'var(--primary-color)' }}></i>
                      {sem}
                    </h3>
                    
                    {/* Level 4: Subject Cards Grid */}
                    <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
                      {Object.keys(groupedData[sem]).sort().map(sub => (
                        <div key={sub} className="item-card" style={{ display: 'flex', flexDirection: 'column', padding: '20px' }}>
                          <h4 style={{ fontSize: '18px', margin: '0 0 16px 0', color: 'var(--text-primary)', lineHeight: '1.4' }}>{sub}</h4>
                          
                          {/* Level 5: Categories / Topics inside the Subject */}
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: 'auto' }}>
                            {groupedData[sem][sub].map(file => (
                              <button 
                                key={file.id}
                                onClick={() => setSelectedDocument(file)}
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'space-between',
                                  width: '100%',
                                  padding: '10px 14px',
                                  background: 'var(--bg-hover)',
                                  border: '1px solid var(--border-color)',
                                  borderRadius: '8px',
                                  cursor: 'pointer',
                                  transition: 'all 0.2s',
                                  textAlign: 'left'
                                }}
                                onMouseOver={(e) => Object.assign(e.currentTarget.style, { borderColor: getResourceColor(file.resource_type), transform: 'translateX(4px)' })}
                                onMouseOut={(e) => Object.assign(e.currentTarget.style, { borderColor: 'var(--border-color)', transform: 'translateX(0)' })}
                              >
                                <span style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, overflow: 'hidden' }}>
                                  <i className={`ti ${getResourceIcon(file.resource_type)}`} style={{ color: getResourceColor(file.resource_type), fontSize: '20px', flexShrink: 0 }}></i>
                                  <span style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '700' }}>{file.resource_type}</span>
                                    <span style={{ fontSize: '14px', color: 'var(--text-primary)', fontWeight: '600', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                      {file.topic || file.resource_type}
                                    </span>
                                  </span>
                                </span>
                                <i className="ti ti-external-link" style={{ color: 'var(--text-muted)', flexShrink: 0, marginLeft: '8px' }}></i>
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </BorderGlow>
        </div>
      )}

      {/* Document Viewer Modal Overlay */}
      {selectedDocument && (
        <div className="modal-overlay" onClick={() => setSelectedDocument(null)} style={{ zIndex: 9999 }}>
          <div 
            className="modal-content slide-up" 
            onClick={(e) => e.stopPropagation()} 
            style={{ 
              width: '90%', 
              maxWidth: '1000px', 
              height: '85vh', 
              display: 'flex', 
              flexDirection: 'column', 
              padding: '16px',
              backgroundColor: '#fff',
              borderRadius: '16px'
            }}
          >
            <div className="modal-header" style={{ marginBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h2 style={{ fontSize: '20px', margin: '0 0 4px 0', color: '#0f172a' }}>{selectedDocument.subject}</h2>
                <p style={{ margin: 0, fontSize: '13px', color: '#64748b', fontWeight: '500' }}>
                  {selectedDocument.course} • {selectedDocument.year_semester} • {selectedDocument.resource_type}
                </p>
              </div>
              <button className="close-btn" onClick={() => setSelectedDocument(null)} style={{ background: '#f1f5f9', color: '#0f172a', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>&times;</button>
            </div>
            
            <div style={{ flex: 1, borderRadius: '12px', overflow: 'hidden', border: '1px solid #e2e8f0', position: 'relative', background: '#f8fafc' }}>
              <iframe 
                src={getDriveEmbedUrl(selectedDocument.drive_link)} 
                style={{ width: '100%', height: '100%', border: 'none' }}
                allow="autoplay"
                title={selectedDocument.subject}
              ></iframe>
            </div>

            <div style={{ marginTop: '16px', textAlign: 'center' }}>
              <a 
                href={selectedDocument.drive_link} 
                target="_blank" 
                rel="noopener noreferrer"
                className="btn-primary"
                style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 24px', borderRadius: '24px' }}
              >
                Open directly in Google Drive <i className="ti ti-external-link"></i>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
