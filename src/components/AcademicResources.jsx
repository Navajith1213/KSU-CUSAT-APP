import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../utils/supabaseClient';

function AutoScrollText({ text, speed = 40, style, className }) {
  const containerRef = useRef(null);
  const textRef = useRef(null);
  const [scrollDistance, setScrollDistance] = useState(0);
  const [duration, setDuration] = useState(0);

  const checkOverflow = () => {
    if (containerRef.current && textRef.current) {
      const containerWidth = containerRef.current.offsetWidth;
      const textWidth = textRef.current.scrollWidth;
      if (textWidth > containerWidth) {
        const dist = textWidth - containerWidth;
        setScrollDistance(dist);
        setDuration(dist / speed + 2.5);
      } else {
        setScrollDistance(0);
        setDuration(0);
      }
    }
  };

  useEffect(() => {
    checkOverflow();
    window.addEventListener('resize', checkOverflow);
    return () => window.removeEventListener('resize', checkOverflow);
  }, [text]);

  const hasOverflow = scrollDistance > 0;

  const inlineStyles = {
    display: 'block',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    position: 'relative',
    width: '100%',
    ...style
  };

  const textStyles = hasOverflow ? {
    display: 'inline-block',
    whiteSpace: 'nowrap',
    transform: 'translateX(0)',
    '--scroll-dist': `-${scrollDistance}px`,
    '--scroll-duration': `${duration}s`
  } : {
    display: 'inline-block',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    width: '100%'
  };

  return (
    <span 
      ref={containerRef} 
      style={inlineStyles}
      className={`scroll-text-container ${className || ''}`}
      onMouseEnter={checkOverflow}
    >
      <span 
        ref={textRef} 
        className={hasOverflow ? "marquee-scroll-text" : ""} 
        style={textStyles}
      >
        {text}
      </span>
    </span>
  );
}



export default function AcademicResources({ userRole, setShowAuthModal, loggedStudent }) {
  const [resources, setResources] = useState([]);
  const [departments, setDepartments] = useState([]);
  
  // Navigation State
  const [activeDepartment, setActiveDepartment] = useState('');
  const [activeCourse, setActiveCourse] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Department Selector Modal State
  const [isDeptModalOpen, setIsDeptModalOpen] = useState(false);
  const [deptSearchQuery, setDeptSearchQuery] = useState('');
  const [selectedFacultyFilter, setSelectedFacultyFilter] = useState('all');

  const [isLoading, setIsLoading] = useState(true);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [activeFolderSubject, setActiveFolderSubject] = useState(null);
  const [folderSearchQuery, setFolderSearchQuery] = useState('');

  // Faculty and Cluster Grouping metadata
  const FACULTY_FILTERS = [
    { id: 'all', label: 'All Schools', icon: 'ti-apps' },
    { id: 'marine', label: 'Marine Sciences', icon: 'ti-droplet' },
    { id: 'law', label: 'Law & Legal Studies', icon: 'ti-scale' },
    { id: 'engineering', label: 'Engineering & Tech', icon: 'ti-cpu' },
    { id: 'management', label: 'Management & Economics', icon: 'ti-briefcase' },
    { id: 'science', label: 'Basic Sciences', icon: 'ti-atom' },
    { id: 'centres', label: 'Centres & Interdisciplinary', icon: 'ti-building-bank' }
  ];

  const getFacultyMeta = (deptName) => {
    const n = (deptName || '').toLowerCase();
    if (n.includes('ocean') || n.includes('marine') || n.includes('atmospher') || n.includes('aquatic') || n.includes('fisher')) {
      return { id: 'marine', label: 'Marine Sciences', icon: 'ti-droplet', color: '#0284c7', bg: 'rgba(2, 132, 199, 0.12)' };
    }
    if (n.includes('legal') || n.includes('law')) {
      return { id: 'law', label: 'Law & Legal Studies', icon: 'ti-scale', color: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.12)' };
    }
    if (n.includes('engineer') || n.includes('soe') || n.includes('cucek') || n.includes('ship') || n.includes('polymer')) {
      return { id: 'engineering', label: 'Engineering & Tech', icon: 'ti-cpu', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.12)' };
    }
    if (n.includes('management') || n.includes('sms') || n.includes('economic') || n.includes('commerce')) {
      return { id: 'management', label: 'Management & Economics', icon: 'ti-briefcase', color: '#10b981', bg: 'rgba(16, 185, 129, 0.12)' };
    }
    if (n.includes('physics') || n.includes('chemistry') || n.includes('math') || n.includes('statistic') || n.includes('biotech')) {
      return { id: 'science', label: 'Basic Sciences', icon: 'ti-atom', color: '#ec4899', bg: 'rgba(236, 72, 153, 0.12)' };
    }
    return { id: 'centres', label: 'Centres & Interdisciplinary', icon: 'ti-building-bank', color: '#6366f1', bg: 'rgba(99, 102, 241, 0.12)' };
  };

  const isMatchingStudentDept = (deptName, studentDept) => {
    if (!deptName || !studentDept) return false;
    const d1 = deptName.trim().toLowerCase();
    const d2 = studentDept.trim().toLowerCase();
    return d1 === d2 || d1.includes(d2) || d2.includes(d1);
  };

  const fetchResources = async () => {
    try {
      const { data, error } = await supabase
        .from('academic_resources')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const cleaned = (data || []).map(r => ({
        ...r,
        department: (r.department || 'General').trim()
      }));
      setResources(cleaned);
      
      const deps = [...new Set(cleaned.map(r => r.department))].filter(Boolean).sort();
      setDepartments(deps);
      
      // Auto-detect department:
      let initialDept = '';
      if (loggedStudent?.department) {
        const found = deps.find(d => isMatchingStudentDept(d, loggedStudent.department));
        if (found) initialDept = found;
      }
      
      if (!initialDept) {
        const saved = localStorage.getItem('preferred_academic_dept');
        if (saved && deps.includes(saved)) {
          initialDept = saved;
        }
      }
      
      if (!initialDept && deps.length > 0) {
        initialDept = deps[0];
      }
      
      if (initialDept) {
        setActiveDepartment(initialDept);
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
  }, [userRole, loggedStudent?.department]);

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

  // Lock body scroll when popup/modal is active
  useEffect(() => {
    if (selectedDocument || activeFolderSubject || isDeptModalOpen) {
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }
    return () => {
      document.body.classList.remove('modal-open');
    };
  }, [selectedDocument, activeFolderSubject, isDeptModalOpen]);

  const handleSelectDepartment = (dep) => {
    setActiveDepartment(dep);
    localStorage.setItem('preferred_academic_dept', dep);
    setIsDeptModalOpen(false);
    setDeptSearchQuery('');
  };

  // Precomputed stats per department
  const deptStats = React.useMemo(() => {
    const stats = {};
    departments.forEach(dep => {
      const depItems = resources.filter(r => r.department === dep);
      const uniqueCourses = [...new Set(depItems.map(r => r.course || 'General'))];
      stats[dep] = {
        totalFiles: depItems.length,
        coursesCount: uniqueCourses.length,
        courses: uniqueCourses
      };
    });
    return stats;
  }, [departments, resources]);


  const containsQuery = (text, query) => (text || '').toLowerCase().includes(query.toLowerCase());

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
      let embedUrl = url;
      if (embedUrl.includes('drive.google.com/file/d/')) {
        embedUrl = embedUrl.replace(/\/view.*$/, '/preview');
      } else if (embedUrl.includes('drive.google.com/drive/folders/')) {
        const folderIdMatch = embedUrl.match(/folders\/([a-zA-Z0-9-_]+)/);
        if (folderIdMatch && folderIdMatch[1]) {
          embedUrl = `https://drive.google.com/embeddedfolderview?id=${folderIdMatch[1]}#grid`;
        }
      } else if (embedUrl.includes('docs.google.com/')) {
        embedUrl = embedUrl.replace(/\/edit.*$/, '/preview');
      }
      return embedUrl;
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
        <div className="card" style={{ textAlign: 'center', maxWidth: '420px', padding: '48px 32px', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05)' }}>
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
        </div>
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
        <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
          <i className="ti ti-books" style={{ fontSize: '48px', color: '#cbd5e1', marginBottom: '16px' }}></i>
          <h3>No Resources Available</h3>
          <p style={{ color: 'var(--text-muted)', marginTop: '8px' }}>No academic resources have been synced yet.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Level 1: Enhanced Department Navigation & Breadcrumbs Bar */}
          <div 
            style={{ 
              background: 'var(--bg-main)', 
              borderRadius: '16px', 
              padding: '16px 20px', 
              border: '1px solid var(--border-color)',
              boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}
          >
            {/* Top Row: Breadcrumbs & Auto-Detect Status */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '13px', color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <i className="ti ti-books"></i> Academics
                </span>
                <i className="ti ti-chevron-right" style={{ fontSize: '12px', color: 'var(--text-muted)' }}></i>
                
                {/* Faculty Tag */}
                <span 
                  style={{ 
                    fontSize: '11px', 
                    fontWeight: '700', 
                    textTransform: 'uppercase', 
                    letterSpacing: '0.5px',
                    color: getFacultyMeta(activeDepartment).color, 
                    background: getFacultyMeta(activeDepartment).bg, 
                    padding: '3px 8px', 
                    borderRadius: '6px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <i className={`ti ${getFacultyMeta(activeDepartment).icon}`}></i>
                  {getFacultyMeta(activeDepartment).label}
                </span>

                <i className="ti ti-chevron-right" style={{ fontSize: '12px', color: 'var(--text-muted)' }}></i>

                {/* Active Department Name */}
                <button
                  type="button"
                  onClick={() => setIsDeptModalOpen(true)}
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    margin: 0,
                    fontSize: '14px',
                    fontWeight: '700',
                    color: 'var(--text-primary)',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    textDecoration: 'underline',
                    textDecorationColor: 'transparent',
                    transition: 'text-decoration-color 0.2s'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.textDecorationColor = 'var(--text-primary)'}
                  onMouseOut={(e) => e.currentTarget.style.textDecorationColor = 'transparent'}
                  title="Click to change department"
                >
                  {activeDepartment}
                  <i className="ti ti-chevron-down" style={{ fontSize: '12px', color: 'var(--text-muted)' }}></i>
                </button>

                {activeCourse && (
                  <>
                    <i className="ti ti-chevron-right" style={{ fontSize: '12px', color: 'var(--text-muted)' }}></i>
                    <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--primary-color)' }}>
                      {activeCourse}
                    </span>
                  </>
                )}
              </div>

              {/* Status Badges & Quick Action */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {isMatchingStudentDept(activeDepartment, loggedStudent?.department) && (
                  <span 
                    style={{ 
                      fontSize: '12px', 
                      color: '#10b981', 
                      background: 'rgba(16, 185, 129, 0.12)', 
                      padding: '4px 10px', 
                      borderRadius: '12px',
                      fontWeight: '600',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <i className="ti ti-sparkles"></i> Your Department
                  </span>
                )}
                
                {loggedStudent?.department && !isMatchingStudentDept(activeDepartment, loggedStudent?.department) && (
                  <button
                    type="button"
                    onClick={() => {
                      const userDept = departments.find(d => isMatchingStudentDept(d, loggedStudent.department));
                      if (userDept) handleSelectDepartment(userDept);
                    }}
                    style={{
                      fontSize: '12px',
                      color: 'var(--primary-color)',
                      background: 'var(--bg-hover)',
                      border: '1px solid var(--border-color)',
                      padding: '4px 10px',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <i className="ti ti-arrow-back-up"></i> My Dept
                  </button>
                )}
              </div>
            </div>

            {/* Bottom Row: Quick Dropdown & "Browse All / Search" Button */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <div style={{ position: 'relative', flex: '1', minWidth: '220px' }}>
                <select
                  value={activeDepartment}
                  onChange={(e) => handleSelectDepartment(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    border: '1px solid var(--border-color)',
                    background: 'var(--bg-hover)',
                    color: 'var(--text-primary)',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    outline: 'none'
                  }}
                >
                  {FACULTY_FILTERS.filter(f => f.id !== 'all').map(faculty => {
                    const deptsInFaculty = departments.filter(d => getFacultyMeta(d).id === faculty.id);
                    if (deptsInFaculty.length === 0) return null;
                    return (
                      <optgroup key={faculty.id} label={faculty.label}>
                        {deptsInFaculty.map(dept => (
                          <option key={dept} value={dept}>
                            {dept} {deptStats[dept]?.totalFiles ? `(${deptStats[dept].totalFiles} files)` : ''}
                          </option>
                        ))}
                      </optgroup>
                    );
                  })}
                </select>
              </div>

              {/* Browse All / Search Button */}
              <button
                type="button"
                className="btn-primary"
                onClick={() => {
                  setDeptSearchQuery('');
                  setSelectedFacultyFilter('all');
                  setIsDeptModalOpen(true);
                }}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 18px',
                  borderRadius: '10px',
                  fontSize: '14px',
                  fontWeight: '600',
                  whiteSpace: 'nowrap'
                }}
              >
                <i className="ti ti-search"></i>
                Browse Departments
                <span 
                  style={{ 
                    background: 'rgba(255,255,255,0.25)', 
                    padding: '2px 8px', 
                    borderRadius: '10px', 
                    fontSize: '11px',
                    fontWeight: '700' 
                  }}
                >
                  {departments.length}
                </span>
              </button>
            </div>
          </div>

          <div className="card">
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
                        borderColor: activeCourse === course ? 'var(--primary-color)' : 'var(--border-strong)',
                        background: activeCourse === course ? 'var(--primary-color)' : 'var(--bg-hover)',
                        color: activeCourse === course ? '#fff' : 'var(--text-primary)',
                        fontWeight: '600',
                        fontSize: '14px',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        boxShadow: activeCourse !== course ? '0 2px 8px var(--shadow-color)' : 'none'
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
                  <div className="syllabus-group" style={{ background: 'var(--primary-glow)', padding: '24px', borderRadius: '16px', border: '1px solid var(--border-color)', boxShadow: '0 4px 20px var(--shadow-color)', marginBottom: '24px' }}>
                    <h3 style={{ fontSize: '20px', color: 'var(--primary-color)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <i className="ti ti-book"></i> Course Syllabuses
                    </h3>
                    <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
                      {Object.keys(syllabusData).sort((a,b) => b.localeCompare(a)).map(adYear => {
                        const files = syllabusData[adYear] || [];
                        return (
                          <div 
                            key={adYear} 
                            className="item-card" 
                            onClick={() => {
                              setActiveFolderSubject(adYear);
                              setFolderSearchQuery('');
                            }}
                            style={{ 
                              display: 'flex', 
                              flexDirection: 'column', 
                              padding: '20px', 
                              alignItems: 'center', 
                              background: 'var(--bg-main)', 
                              border: '1px solid var(--border-color)', 
                              borderRadius: '16px', 
                              boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                              cursor: 'pointer',
                              transition: 'transform 0.2s, border-color 0.2s',
                              minHeight: '140px',
                              justifyContent: 'center',
                              textAlign: 'center'
                            }}
                            onMouseOver={(e) => {
                              e.currentTarget.style.transform = 'translateY(-4px)';
                              e.currentTarget.style.borderColor = 'var(--primary-color)';
                            }}
                            onMouseOut={(e) => {
                              e.currentTarget.style.transform = 'translateY(0)';
                              e.currentTarget.style.borderColor = 'var(--border-color)';
                            }}
                          >
                            <div style={{ 
                              width: '40px', 
                              height: '40px', 
                              borderRadius: '10px', 
                              background: 'rgba(16, 185, 129, 0.1)', 
                              display: 'flex', 
                              alignItems: 'center', 
                              justifyContent: 'center', 
                              marginBottom: '10px',
                              border: '1px solid rgba(16, 185, 129, 0.2)'
                            }}>
                              <i className="ti ti-folder" style={{ fontSize: '20px', color: '#10b981' }}></i>
                            </div>
                            <h4 style={{ fontSize: '15px', margin: '0 0 4px 0', color: 'var(--text-primary)', fontWeight: '700' }}>{adYear}</h4>
                            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{files.length} Syllabus Files</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Level 3B: Regular Semester Loop */}
                {regularSemesters.map(sem => (
                  <div key={sem} className="semester-group" style={{ marginBottom: '24px' }}>
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
                      {Object.keys(groupedData[sem]).sort().map(sub => {
                        const files = groupedData[sem][sub] || [];
                        const notesCount = files.filter(f => f.resource_type.toLowerCase().includes('note')).length;
                        const pyqsCount = files.filter(f => f.resource_type.toLowerCase().includes('pyq') || f.resource_type.toLowerCase().includes('question')).length;
                        const syllabusCount = files.filter(f => f.resource_type.toLowerCase().includes('syllab')).length;
                        const otherCount = files.length - (notesCount + pyqsCount + syllabusCount);

                        const countParts = [];
                        if (notesCount > 0) countParts.push(`${notesCount} Notes`);
                        if (pyqsCount > 0) countParts.push(`${pyqsCount} PYQs`);
                        if (syllabusCount > 0) countParts.push(`${syllabusCount} Syllabus`);
                        if (otherCount > 0) countParts.push(`${otherCount} Other`);
                        const summaryText = countParts.join(' • ') || 'Empty Folder';

                        return (
                          <div 
                            key={sub} 
                            className="item-card" 
                            onClick={() => {
                              setActiveFolderSubject(sub);
                              setFolderSearchQuery('');
                            }}
                            style={{ 
                              display: 'flex', 
                              flexDirection: 'column', 
                              padding: '20px', 
                              alignItems: 'center', 
                              background: 'var(--bg-main)', 
                              border: '1px solid var(--border-color)', 
                              borderRadius: '16px', 
                              boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                              cursor: 'pointer',
                              transition: 'transform 0.2s, border-color 0.2s',
                              minHeight: '160px',
                              justifyContent: 'center',
                              textAlign: 'center'
                            }}
                            onMouseOver={(e) => {
                              e.currentTarget.style.transform = 'translateY(-4px)';
                              e.currentTarget.style.borderColor = 'var(--primary-color)';
                            }}
                            onMouseOut={(e) => {
                              e.currentTarget.style.transform = 'translateY(0)';
                              e.currentTarget.style.borderColor = 'var(--border-color)';
                            }}
                          >
                            <div style={{ 
                              width: '48px', 
                              height: '48px', 
                              borderRadius: '12px', 
                              background: 'rgba(2, 132, 199, 0.1)', 
                              display: 'flex', 
                              alignItems: 'center', 
                              justifyContent: 'center', 
                              marginBottom: '12px',
                              border: '1px solid rgba(2, 132, 199, 0.2)'
                            }}>
                              <i className="ti ti-folder" style={{ fontSize: '24px', color: 'var(--primary-color)' }}></i>
                            </div>

                            <h4 style={{ fontSize: '16px', margin: '0 0 8px 0', color: 'var(--text-primary)', lineHeight: '1.4', fontWeight: '700' }}>
                              {sub}
                            </h4>
                            
                            <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '500' }}>
                              {summaryText}
                            </span>
                          </div>
                        );
                      })}
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
                <h2 style={{ fontSize: '20px', margin: '0 0 4px 0', color: '#0f172a' }}>{selectedDocument.topic || selectedDocument.subject}</h2>
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
                title={selectedDocument.topic || selectedDocument.subject}
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

      {/* Folder Contents Modal Overlay */}
      {activeFolderSubject && (() => {
        const folderFiles = deptResources.filter(r => r.subject === activeFolderSubject && (r.course || 'General') === activeCourse);
        
        const filteredFolderFiles = folderFiles.filter(f => 
          containsQuery(f.topic, folderSearchQuery) || containsQuery(f.resource_type, folderSearchQuery)
        );

        const folderGroups = {};
        filteredFolderFiles.forEach(file => {
          const cat = file.resource_type || 'General';
          if (!folderGroups[cat]) folderGroups[cat] = [];
          folderGroups[cat].push(file);
        });

        return (
          <div className="modal-overlay" onClick={() => setActiveFolderSubject(null)} style={{ zIndex: 9998 }}>
            <div 
              className="modal-content slide-up" 
              onClick={(e) => e.stopPropagation()} 
              style={{ 
                width: '90%', 
                maxWidth: '600px', 
                height: '75vh', 
                display: 'flex', 
                flexDirection: 'column', 
                padding: '24px',
                backgroundColor: 'var(--bg-card)',
                borderRadius: '16px',
                border: '1px solid var(--border-color)',
                boxShadow: '0 10px 25px rgba(0,0,0,0.3)'
              }}
            >
              <div className="modal-header" style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h2 style={{ fontSize: '20px', margin: '0 0 4px 0', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <i className="ti ti-folder" style={{ color: 'var(--primary-color)' }}></i>
                    {activeFolderSubject}
                  </h2>
                  <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-muted)' }}>
                    {activeCourse} • {folderFiles.length} files total
                  </p>
                </div>
                <button 
                  onClick={() => setActiveFolderSubject(null)} 
                  style={{ 
                    background: 'var(--bg-hover)', 
                    color: 'var(--text-primary)', 
                    border: 'none',
                    borderRadius: '50%', 
                    width: '32px', 
                    height: '32px', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    cursor: 'pointer'
                  }}
                >
                  &times;
                </button>
              </div>

              {/* Folder Search Bar */}
              <div style={{ position: 'relative', marginBottom: '20px' }}>
                <i className="ti ti-search" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}></i>
                <input 
                  type="text" 
                  placeholder="Search files/topics in this folder..."
                  value={folderSearchQuery}
                  onChange={(e) => setFolderSearchQuery(e.target.value)}
                  style={{ 
                    width: '100%', 
                    padding: '10px 10px 10px 38px', 
                    borderRadius: '8px', 
                    border: '1px solid var(--border-color)', 
                    fontSize: '14px',
                    color: 'var(--text-primary)',
                    backgroundColor: 'var(--bg-main)',
                    outline: 'none'
                  }}
                />
              </div>

              {/* Folder File List */}
              <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '20px', paddingRight: '4px', overscrollBehavior: 'contain' }}>
                {Object.keys(folderGroups).length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '40px' }}>
                    <i className="ti ti-folder-off" style={{ fontSize: '36px', color: 'var(--text-muted)', marginBottom: '8px' }}></i>
                    <p style={{ color: 'var(--text-muted)', margin: 0 }}>No matching files found.</p>
                  </div>
                ) : (
                  Object.keys(folderGroups).sort().map(catName => (
                    <div key={catName}>
                      <h5 style={{ 
                        fontSize: '13px', 
                        textTransform: 'uppercase', 
                        color: getResourceColor(catName), 
                        marginBottom: '10px', 
                        fontWeight: 'bold',
                        letterSpacing: '0.5px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}>
                        <i className={`ti ${getResourceIcon(catName)}`}></i>
                        {catName} ({folderGroups[catName].length})
                      </h5>
                      
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {folderGroups[catName].map(file => (
                          <button 
                            key={file.id}
                            onClick={() => {
                              setSelectedDocument(file);
                            }}
                            className="scroll-container-hover-trigger"
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              width: '100%',
                              padding: '10px 12px',
                              background: 'var(--bg-hover)',
                              border: '1px solid var(--border-color)',
                              borderRadius: '8px',
                              cursor: 'pointer',
                              transition: 'all 0.2s',
                              textAlign: 'left'
                            }}
                            onMouseOver={(e) => Object.assign(e.currentTarget.style, { borderColor: getResourceColor(catName), transform: 'translateX(4px)' })}
                            onMouseOut={(e) => Object.assign(e.currentTarget.style, { borderColor: 'var(--border-color)', transform: 'translateX(0)' })}
                          >
                            <span style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: 0 }}>
                              <i className={`ti ${getResourceIcon(file.resource_type)}`} style={{ color: getResourceColor(file.resource_type), fontSize: '18px', flexShrink: 0 }}></i>
                              <AutoScrollText 
                                text={file.topic || file.subject}
                                style={{ fontSize: '13.5px', color: 'var(--text-primary)', fontWeight: '600' }}
                              />
                            </span>
                            <i className="ti ti-external-link" style={{ color: 'var(--text-muted)', flexShrink: 0, marginLeft: '8px', fontSize: '14px' }}></i>
                          </button>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        );
      })()}

      {/* Searchable Department Directory Modal */}
      {isDeptModalOpen && (
        <div className="modal-overlay" onClick={() => setIsDeptModalOpen(false)}>
          <div 
            className="modal-content" 
            onClick={(e) => e.stopPropagation()}
            style={{ 
              maxWidth: '750px', 
              width: '94%', 
              maxHeight: '85vh', 
              display: 'flex', 
              flexDirection: 'column', 
              borderRadius: '20px', 
              padding: '24px' 
            }}
          >
            {/* Header */}
            <div className="modal-header" style={{ marginBottom: '16px' }}>
              <div>
                <h2 style={{ fontSize: '20px', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <i className="ti ti-building-bank" style={{ color: 'var(--primary-color)' }}></i>
                  Select Department
                </h2>
                <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: 'var(--text-muted)' }}>
                  Browse course materials across all {departments.length} schools and departments
                </p>
              </div>
              <button className="close-btn" onClick={() => setIsDeptModalOpen(false)}>&times;</button>
            </div>

            {/* Department Search Bar */}
            <div style={{ position: 'relative', marginBottom: '14px' }}>
              <i 
                className="ti ti-search" 
                style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: '18px' }}
              ></i>
              <input
                type="text"
                placeholder="Search department (e.g. Legal, Ocean, SLS, Science)..."
                value={deptSearchQuery}
                onChange={(e) => setDeptSearchQuery(e.target.value)}
                autoFocus
                style={{
                  width: '100%',
                  padding: '12px 14px 12px 42px',
                  borderRadius: '12px',
                  border: '1px solid var(--border-color)',
                  backgroundColor: 'var(--bg-main)',
                  color: 'var(--text-primary)',
                  fontSize: '15px',
                  outline: 'none'
                }}
              />
              {deptSearchQuery && (
                <button
                  type="button"
                  onClick={() => setDeptSearchQuery('')}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    fontSize: '16px'
                  }}
                >
                  <i className="ti ti-x"></i>
                </button>
              )}
            </div>

            {/* Faculty Filter Pills */}
            <div 
              style={{ 
                display: 'flex', 
                gap: '6px', 
                overflowX: 'auto', 
                paddingBottom: '8px', 
                marginBottom: '16px',
                flexShrink: 0 
              }}
            >
              {FACULTY_FILTERS.map(f => {
                const count = f.id === 'all' 
                  ? departments.length 
                  : departments.filter(d => getFacultyMeta(d).id === f.id).length;
                if (f.id !== 'all' && count === 0) return null;
                const isActive = selectedFacultyFilter === f.id;
                return (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setSelectedFacultyFilter(f.id)}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '20px',
                      border: '1px solid',
                      borderColor: isActive ? 'var(--primary-color)' : 'var(--border-color)',
                      background: isActive ? 'var(--primary-color)' : 'var(--bg-hover)',
                      color: isActive ? '#fff' : 'var(--text-primary)',
                      fontSize: '12px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px'
                    }}
                  >
                    <i className={`ti ${f.icon}`}></i>
                    {f.label} ({count})
                  </button>
                );
              })}
            </div>

            {/* Department Grid List */}
            <div 
              style={{ 
                flex: 1, 
                overflowY: 'auto', 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
                gap: '12px', 
                paddingRight: '4px' 
              }}
            >
              {(() => {
                const filteredDepts = departments.filter(dep => {
                  const meta = getFacultyMeta(dep);
                  if (selectedFacultyFilter !== 'all' && meta.id !== selectedFacultyFilter) return false;
                  if (deptSearchQuery) {
                    const q = deptSearchQuery.toLowerCase();
                    const matchesName = dep.toLowerCase().includes(q);
                    const matchesFaculty = meta.label.toLowerCase().includes(q);
                    const matchesCourses = (deptStats[dep]?.courses || []).some(c => c.toLowerCase().includes(q));
                    if (!matchesName && !matchesFaculty && !matchesCourses) return false;
                  }
                  return true;
                });

                if (filteredDepts.length === 0) {
                  return (
                    <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px 20px' }}>
                      <i className="ti ti-search-off" style={{ fontSize: '40px', color: 'var(--text-muted)', marginBottom: '8px' }}></i>
                      <p style={{ color: 'var(--text-muted)', margin: 0 }}>No departments found matching "{deptSearchQuery}".</p>
                    </div>
                  );
                }

                return filteredDepts.map(dep => {
                  const meta = getFacultyMeta(dep);
                  const stats = deptStats[dep] || { totalFiles: 0, coursesCount: 0 };
                  const isCurrent = activeDepartment === dep;
                  const isMyDept = isMatchingStudentDept(dep, loggedStudent?.department);

                  return (
                    <div
                      key={dep}
                      onClick={() => handleSelectDepartment(dep)}
                      style={{
                        padding: '16px',
                        borderRadius: '14px',
                        border: '1.5px solid',
                        borderColor: isCurrent ? 'var(--primary-color)' : 'var(--border-color)',
                        background: isCurrent ? 'var(--primary-glow)' : 'var(--bg-main)',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        gap: '12px',
                        transition: 'all 0.2s ease',
                        boxShadow: isCurrent ? '0 4px 14px var(--shadow-color)' : '0 2px 6px rgba(0,0,0,0.02)'
                      }}
                      onMouseOver={(e) => {
                        if (!isCurrent) {
                          e.currentTarget.style.borderColor = meta.color;
                          e.currentTarget.style.transform = 'translateY(-2px)';
                        }
                      }}
                      onMouseOut={(e) => {
                        if (!isCurrent) {
                          e.currentTarget.style.borderColor = 'var(--border-color)';
                          e.currentTarget.style.transform = 'translateY(0)';
                        }
                      }}
                    >
                      {/* Top Tag & Badges */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                        <span 
                          style={{ 
                            fontSize: '11px', 
                            fontWeight: '700', 
                            color: meta.color, 
                            background: meta.bg, 
                            padding: '3px 8px', 
                            borderRadius: '6px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          <i className={`ti ${meta.icon}`}></i>
                          {meta.label}
                        </span>

                        <div style={{ display: 'flex', gap: '4px' }}>
                          {isMyDept && (
                            <span 
                              style={{ 
                                fontSize: '11px', 
                                color: '#10b981', 
                                background: 'rgba(16, 185, 129, 0.12)', 
                                padding: '2px 6px', 
                                borderRadius: '6px',
                                fontWeight: '700'
                              }}
                              title="Your registered department"
                            >
                              ⭐ My Dept
                            </span>
                          )}
                          {isCurrent && (
                            <span 
                              style={{ 
                                fontSize: '11px', 
                                color: '#fff', 
                                background: 'var(--primary-color)', 
                                padding: '2px 6px', 
                                borderRadius: '6px',
                                fontWeight: '700'
                              }}
                            >
                              ✓ Selected
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Department Title */}
                      <h4 
                        style={{ 
                          fontSize: '14.5px', 
                          fontWeight: '700', 
                          margin: 0, 
                          color: 'var(--text-primary)',
                          lineHeight: '1.4'
                        }}
                      >
                        {dep}
                      </h4>

                      {/* Footer: Stats */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-muted)', borderTop: '1px solid var(--border-color)', paddingTop: '8px' }}>
                        <span>
                          <i className="ti ti-file-text" style={{ marginRight: '4px' }}></i>
                          {stats.totalFiles} files
                        </span>
                        <span>
                          <i className="ti ti-certificate" style={{ marginRight: '4px' }}></i>
                          {stats.coursesCount} course{stats.coursesCount === 1 ? '' : 's'}
                        </span>
                      </div>
                    </div>
                  );
                });
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
