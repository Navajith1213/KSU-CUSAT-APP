import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../utils/supabaseClient';

const CUSAT_DEPARTMENTS = [
  'Centre for Budget Studies',
  'CUCEK',
  'DDU Kaushal Kendra (DDUKK)',
  'Department of Applied Economics',
  'Department of Atmospheric Sciences',
  'Department of Biotechnology',
  'Department of Chemical Oceanography',
  'Department of Chemistry',
  'Department of Civil Engineering',
  'Department of Computer Applications (DCA)',
  'Department of Computer Science',
  'Department of Computer Science and Engineering (SOE)',
  'Department of Electrical and Electronics Engineering',
  'Department of Electronics',
  'Department of Electronics and Communication Engineering',
  'Department of Information Technology',
  'Department of Instrumentation and Control',
  'Department of Marine Biology, Microbiology and Biochemistry',
  'Department of Marine Geology and Geophysics',
  'Department of Mathematics',
  'Department of Mechanical Engineering',
  'Department of Physical Oceanography',
  'Department of Physics',
  'Department of Polymer Science and Rubber Technology',
  'Department of Safety and Fire Engineering',
  'Department of Statistics',
  'ICREP',
  'International School of Photonics',
  'School of Engineering (SOE)',
  'School for Environmental Studies',
  'School of Industrial Fisheries',
  'School of Legal Studies (SLS)',
  'School of Management Studies (SMS)'
];

const getFacultyMeta = (deptName) => {
  const n = (deptName || '').toLowerCase();
  if (n.includes('ocean') || n.includes('marine') || n.includes('atmospher') || n.includes('aquatic') || n.includes('fisher')) {
    return { id: 'marine', label: 'Marine Sciences', icon: 'ti-droplet', color: '#0284c7', bg: 'rgba(2, 132, 199, 0.12)' };
  }
  if (n.includes('legal') || n.includes('law')) {
    return { id: 'law', label: 'Law & Legal Studies', icon: 'ti-scale', color: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.12)' };
  }
  if (n.includes('engineer') || n.includes('soe') || n.includes('cucek') || n.includes('ship') || n.includes('polymer') || n.includes('safety') || n.includes('fire')) {
    return { id: 'engineering', label: 'Engineering & Tech', icon: 'ti-cpu', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.12)' };
  }
  if (n.includes('management') || n.includes('sms') || n.includes('economic') || n.includes('commerce') || n.includes('budget')) {
    return { id: 'management', label: 'Management & Economics', icon: 'ti-briefcase', color: '#10b981', bg: 'rgba(16, 185, 129, 0.12)' };
  }
  if (n.includes('computer') || n.includes('application') || n.includes('information technology') || n.includes(' dca') || n.includes(' dcs')) {
    return { id: 'computer', label: 'Computer & IT', icon: 'ti-device-laptop', color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.12)' };
  }
  if (n.includes('physics') || n.includes('chemistry') || n.includes('math') || n.includes('statistic') || n.includes('biotech') || n.includes('photonics')) {
    return { id: 'science', label: 'Basic Sciences', icon: 'ti-atom', color: '#ec4899', bg: 'rgba(236, 72, 153, 0.12)' };
  }
  return { id: 'centres', label: 'Centres & Others', icon: 'ti-building-bank', color: '#6366f1', bg: 'rgba(99, 102, 241, 0.12)' };
};

export default function DepartmentDashboard({ loggedStudent, userRole }) {
  const [resources, setResources] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [syncStatus, setSyncStatus] = useState('');
  
  // Form State
  const [driveLink, setDriveLink] = useState('');
  const [customDepartment, setCustomDepartment] = useState(loggedStudent?.department || '');
  const [departmentsList, setDepartmentsList] = useState(CUSAT_DEPARTMENTS);
  const [filterDept, setFilterDept] = useState('all');

  // Searchable Dropdown State
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [deptSearchQuery, setDeptSearchQuery] = useState('');
  const dropdownRef = useRef(null);

  const isMasterAdmin = userRole === 'admin' || loggedStudent?.email === 'navajith1122@gmail.com';
  const DRIVE_API_KEY = import.meta.env.VITE_GOOGLE_DRIVE_API_KEY;

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);

  const fetchDepartments = async () => {
    try {
      const [contactsRes, resourcesRes] = await Promise.all([
        supabase.from('contacts').select('data'),
        supabase.from('academic_resources').select('department')
      ]);

      const contactDepts = (contactsRes.data || [])
        .map(c => c.data?.name)
        .filter(Boolean)
        .map(n => n.trim());

      const resourceDepts = (resourcesRes.data || [])
        .map(r => r.department)
        .filter(Boolean)
        .map(n => n.trim());

      const combined = [
        ...CUSAT_DEPARTMENTS,
        ...contactDepts,
        ...resourceDepts
      ];

      const uniqueDepts = Array.from(new Set(combined.map(d => d.trim()))).filter(Boolean).sort((a, b) => a.localeCompare(b));
      setDepartmentsList(uniqueDepts);
    } catch (err) {
      console.error('Error fetching departments list:', err);
      setDepartmentsList(CUSAT_DEPARTMENTS.sort());
    }
  };

  useEffect(() => {
    if (loggedStudent?.department || isMasterAdmin) {
      fetchMyResources();
    }
    fetchDepartments();
  }, [loggedStudent, isMasterAdmin]);

  const fetchMyResources = async () => {
    try {
      let query = supabase
        .from('academic_resources')
        .select('*')
        .order('created_at', { ascending: false });

      if (!isMasterAdmin) {
        query = query.eq('department', loggedStudent.department);
      }

      const { data, error } = await query;

      if (error) throw error;
      setResources(data || []);
    } catch (error) {
      console.error('Error fetching resources:', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDriveFiles = async (folderId) => {
    const response = await fetch(`https://www.googleapis.com/drive/v3/files?q='${folderId}'+in+parents+and+trashed=false&fields=files(id,name,mimeType,webViewLink)&key=${DRIVE_API_KEY}`);
    const data = await response.json();
    if (data.error) throw new Error(data.error.message);
    return data.files || [];
  };

  const handleBulkSync = async (e) => {
    e.preventDefault();
    if (!DRIVE_API_KEY) {
      alert("Google Drive API Key is missing. Please add VITE_GOOGLE_DRIVE_API_KEY to your .env file.");
      return;
    }

    const finalDepartment = isMasterAdmin 
      ? customDepartment.trim() 
      : (customDepartment.trim() || loggedStudent?.department?.trim());

    if (!finalDepartment) {
      alert("Please select a target department for this course.");
      return;
    }

    const folderIdMatch = driveLink.match(/folders\/([a-zA-Z0-9-_]+)/);
    if (!folderIdMatch) {
      alert("Invalid Google Drive folder link. Must contain /folders/ID. Ensure you are copying the link of the ROOT folder.");
      return;
    }
    const rootFolderId = folderIdMatch[1];

    setIsSubmitting(true);
    setSyncStatus("Connecting to Google Drive...");

    try {
      let totalSynced = 0;
      
      const { data: existingData } = await supabase
        .from('academic_resources')
        .select('drive_link')
        .eq('department', finalDepartment);
      const existingLinks = new Set((existingData || []).map(r => r.drive_link));

      // Fetch Root Folder Name
      const rootMetaResponse = await fetch(`https://www.googleapis.com/drive/v3/files/${rootFolderId}?fields=name&key=${DRIVE_API_KEY}`);
      const rootMeta = await rootMetaResponse.json();
      if (rootMeta.error) throw new Error(rootMeta.error.message);
      const rootFolderName = rootMeta.name || 'General';

      const rootChildren = await fetchDriveFiles(rootFolderId);
      
      // Auto-detect if root children contain semesters (e.g. SEM 1, SEM 2, Syllabus)
      const hasSemesterChildren = rootChildren.some(child => 
        child.mimeType === 'application/vnd.google-apps.folder' && 
        (child.name.toLowerCase().includes('sem') || child.name.toLowerCase().includes('syllabus'))
      );

      let scanTarget = [];
      if (hasSemesterChildren) {
        // Course-level Root (e.g. root is "MSc Oceanography")
        scanTarget.push({
          courseName: rootFolderName.trim(),
          semesters: rootChildren.filter(c => c.mimeType === 'application/vnd.google-apps.folder')
        });
      } else {
        // Department-level Root (e.g. root is "Department of Physical Oceanography")
        for (const courseFolder of rootChildren) {
          if (courseFolder.mimeType !== 'application/vnd.google-apps.folder') continue;
          setSyncStatus(`Scanning Course: ${courseFolder.name}...`);
          const semesters = await fetchDriveFiles(courseFolder.id);
          scanTarget.push({
            courseName: courseFolder.name.trim(),
            semesters: semesters.filter(c => c.mimeType === 'application/vnd.google-apps.folder')
          });
        }
      }

      for (const target of scanTarget) {
        const courseName = target.courseName;
        for (const sem of target.semesters) {
          setSyncStatus(`Scanning ${courseName} > ${sem.name}...`);

          if (sem.name.trim().toLowerCase() === 'syllabus') {
            // SYLLABUS MODE
            // Expected: Course > Syllabus > Admission Year > Files
            const admissionYears = await fetchDriveFiles(sem.id);
            for (const adYear of admissionYears) {
              if (adYear.mimeType !== 'application/vnd.google-apps.folder') continue;
              setSyncStatus(`Scanning Syllabus > ${adYear.name}...`);

              const files = await fetchDriveFiles(adYear.id);
              if (files.length === 0) continue;

              const resourcesToInsert = files
                .filter(f => f.mimeType !== 'application/vnd.google-apps.folder')
                .filter(f => !existingLinks.has(f.webViewLink))
                .map(file => ({
                  department: finalDepartment,
                  course: courseName,
                  year_semester: 'Syllabus',
                  subject: adYear.name.trim(), // We store the Admission Year in the subject column
                  resource_type: 'Syllabus',
                  topic: file.name.replace(/\.[^/.]+$/, "").trim(), // Strip extension for topic
                  drive_link: file.webViewLink,
                  added_by: loggedStudent?.email || 'admin@ksucusat.com'
                }));

              if (resourcesToInsert.length > 0) {
                const { error } = await supabase.from('academic_resources').insert(resourcesToInsert);
                if (error) throw error;
                totalSynced += resourcesToInsert.length;
                resourcesToInsert.forEach(r => existingLinks.add(r.drive_link));
              }
            }
          } else {
            // REGULAR MODE
            // Expected: Course > Semester > Subject > Category > Files
            // OR: Course > Semester > Subject > Files (direct files)
            const subjects = await fetchDriveFiles(sem.id);
            for (const sub of subjects) {
              if (sub.mimeType !== 'application/vnd.google-apps.folder') continue;
              setSyncStatus(`Scanning Subject: ${sub.name}...`);

              const subContents = await fetchDriveFiles(sub.id);
              const folders = subContents.filter(item => item.mimeType === 'application/vnd.google-apps.folder');
              const directFiles = subContents.filter(item => item.mimeType !== 'application/vnd.google-apps.folder');

              // 1. Process files nested under subfolders (Category folders)
              for (const cat of folders) {
                const files = await fetchDriveFiles(cat.id);
                const resourcesToInsert = files
                  .filter(f => f.mimeType !== 'application/vnd.google-apps.folder')
                  .filter(f => !existingLinks.has(f.webViewLink))
                  .map(file => ({
                    department: finalDepartment,
                    course: courseName,
                    year_semester: sem.name.trim(),
                    subject: sub.name.trim(),
                    resource_type: cat.name.trim(),
                    topic: file.name.replace(/\.[^/.]+$/, "").trim(), // Strip extension for topic
                    drive_link: file.webViewLink,
                    added_by: loggedStudent?.email || 'admin@ksucusat.com'
                  }));

                if (resourcesToInsert.length > 0) {
                  const { error } = await supabase.from('academic_resources').insert(resourcesToInsert);
                  if (error) throw error;
                  totalSynced += resourcesToInsert.length;
                  resourcesToInsert.forEach(r => existingLinks.add(r.drive_link));
                }
              }

              // 2. Process files placed directly under the Subject folder
              if (directFiles.length > 0) {
                const resourcesToInsert = directFiles
                  .filter(f => !existingLinks.has(f.webViewLink))
                  .map(file => ({
                    department: finalDepartment,
                    course: courseName,
                    year_semester: sem.name.trim(),
                    subject: sub.name.trim(),
                    resource_type: 'General', // Default category for direct files
                    topic: file.name.replace(/\.[^/.]+$/, "").trim(), // Strip extension for topic
                    drive_link: file.webViewLink,
                    added_by: loggedStudent?.email || 'admin@ksucusat.com'
                  }));

                if (resourcesToInsert.length > 0) {
                  const { error } = await supabase.from('academic_resources').insert(resourcesToInsert);
                  if (error) throw error;
                  totalSynced += resourcesToInsert.length;
                  resourcesToInsert.forEach(r => existingLinks.add(r.drive_link));
                }
              }
            }
          }
        }
      }

      setSyncStatus(`Success! Synced ${totalSynced} new files.`);
      setDriveLink('');
      fetchMyResources(); 
    } catch (err) {
      alert("Error syncing: " + err.message);
      setSyncStatus("Sync failed. Check permissions.");
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setSyncStatus(""), 6000);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this resource from the dashboard?")) return;
    if (!window.confirm("IMPORTANT: Because of Bulk Sync, if this file is still in your Google Drive folder, the next sync will just add it right back!\n\nTo permanently delete it, you must also delete the file from your Google Drive.\n\nContinue with deletion?")) return;

    try {
      let query = supabase.from('academic_resources').delete().eq('id', id);
      if (!isMasterAdmin) {
        query = query.eq('department', loggedStudent.department);
      }
      
      const { data, error } = await query.select();
      
      if (error) throw error;
      
      if (!data || data.length === 0) {
        throw new Error("You do not have permission to delete this file, or it does not exist.");
      }

      setResources(resources.filter(r => r.id !== id));
    } catch (error) {
      alert('Error deleting resource: ' + error.message);
    }
  };

  const handleDeleteAll = async () => {
    if (!window.confirm("WARNING: Are you sure you want to delete ALL your uploaded resources? This cannot be undone.")) return;
    if (!window.confirm("IMPORTANT: If you run Bulk Sync again, all of these files will just be instantly re-downloaded from Google Drive!\n\nTo permanently remove them, you must delete the folders from your Google Drive.\n\nContinue?")) return;

    try {
      let query = supabase.from('academic_resources').delete();
      if (!isMasterAdmin) {
        query = query.eq('department', loggedStudent.department);
      } else if (customDepartment) {
        query = query.eq('department', customDepartment);
      } else {
        // Master Admin deleting all resources: use a dummy filter to satisfy Supabase's safety check requiring a WHERE clause
        query = query.neq('id', '00000000-0000-0000-0000-000000000000');
      }
      
      const { error } = await query;
      if (error) throw error;
      setResources([]);
      alert("All resources deleted successfully.");
    } catch (error) {
      alert('Error deleting resources: ' + error.message);
    }
  };

  if (!loggedStudent?.department && !isMasterAdmin) {
    return <div className="content"><p>Error: You are not assigned to a department.</p></div>;
  }

  return (
    <div className="fade-in-section">
      <div className="hero-section" style={{ padding: '32px 24px', marginBottom: '24px', background: 'linear-gradient(135deg, rgba(13, 148, 136, 0.05), rgba(30, 58, 138, 0.05))' }}>
        <h1 className="hero-title" style={{ fontSize: '24px', color: '#0f766e' }}>
          {isMasterAdmin ? 'Master Resource Manager' : 'Department Dashboard'}
        </h1>
        <p className="hero-subtitle" style={{ marginBottom: 0 }}>
          {isMasterAdmin ? 'God Mode: Bulk Syncing for any department' : `Managing resources for: ${loggedStudent.department}`}
        </p>
      </div>

      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
        
        {/* Bulk Sync Form */}
        <div className="admin-flat-card">
          <h2><i className="ti ti-cloud-upload" style={{ marginRight: '8px' }}></i> Bulk Drive Sync</h2>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px' }}>
            Paste the link to your Root Folder. It must be set to "Anyone with the link can view". The folder must follow this exact structure: <strong>Course &gt; Semester &gt; Subject &gt; Category &gt; Files</strong>.
          </p>

          <form onSubmit={handleBulkSync} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            {/* Searchable Department Dropdown */}
            <div className="form-group" style={{ marginBottom: 0, position: 'relative' }} ref={dropdownRef}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <label style={{ margin: 0, fontWeight: '600', fontSize: '13.5px', color: 'var(--text-primary)' }}>
                  Target Department <span style={{ color: '#ef4444' }}>*</span>
                </label>
                {customDepartment && (
                  <span 
                    style={{ 
                      fontSize: '11px', 
                      fontWeight: '700', 
                      color: getFacultyMeta(customDepartment).color, 
                      background: getFacultyMeta(customDepartment).bg, 
                      padding: '2px 8px', 
                      borderRadius: '6px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <i className={`ti ${getFacultyMeta(customDepartment).icon}`}></i>
                    {getFacultyMeta(customDepartment).label}
                  </span>
                )}
              </div>

              {/* Trigger Button */}
              <div
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  border: '1.5px solid',
                  borderColor: isDropdownOpen ? 'var(--primary-color)' : 'var(--border-color)',
                  background: 'var(--bg-main)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: isDropdownOpen ? '0 0 0 3px var(--primary-glow)' : 'none'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden' }}>
                  <div 
                    style={{ 
                      width: '32px', 
                      height: '32px', 
                      borderRadius: '8px', 
                      background: customDepartment ? getFacultyMeta(customDepartment).bg : 'var(--bg-hover)', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      flexShrink: 0 
                    }}
                  >
                    <i 
                      className={`ti ${customDepartment ? getFacultyMeta(customDepartment).icon : 'ti-building-bank'}`} 
                      style={{ color: customDepartment ? getFacultyMeta(customDepartment).color : 'var(--text-muted)', fontSize: '16px' }}
                    ></i>
                  </div>
                  <span 
                    style={{ 
                      fontSize: '13.5px', 
                      fontWeight: customDepartment ? '600' : '400', 
                      color: customDepartment ? 'var(--text-primary)' : 'var(--text-muted)',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}
                  >
                    {customDepartment || "Select or search a department..."}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {customDepartment && isMasterAdmin && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setCustomDepartment('');
                      }}
                      style={{
                        background: 'none',
                        border: 'none',
                        padding: '4px',
                        color: 'var(--text-muted)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        borderRadius: '4px'
                      }}
                      title="Clear department"
                    >
                      <i className="ti ti-x" style={{ fontSize: '14px' }}></i>
                    </button>
                  )}
                  <i 
                    className={`ti ti-chevron-${isDropdownOpen ? 'up' : 'down'}`} 
                    style={{ color: 'var(--text-muted)', fontSize: '15px' }}
                  ></i>
                </div>
              </div>

              {/* Dropdown Popover */}
              {isDropdownOpen && (
                <div
                  style={{
                    position: 'absolute',
                    top: 'calc(100% + 6px)',
                    left: 0,
                    right: 0,
                    background: 'var(--bg-main)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '12px',
                    boxShadow: '0 12px 30px rgba(0, 0, 0, 0.15)',
                    zIndex: 100,
                    padding: '12px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px'
                  }}
                >
                  {/* Search Input */}
                  <div style={{ position: 'relative' }}>
                    <i 
                      className="ti ti-search" 
                      style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: '14px' }}
                    ></i>
                    <input
                      type="text"
                      placeholder="Type to filter departments..."
                      value={deptSearchQuery}
                      onChange={(e) => setDeptSearchQuery(e.target.value)}
                      autoFocus
                      style={{
                        width: '100%',
                        padding: '8px 10px 8px 34px',
                        borderRadius: '8px',
                        border: '1px solid var(--border-color)',
                        background: 'var(--bg-hover)',
                        color: 'var(--text-primary)',
                        fontSize: '13px',
                        outline: 'none'
                      }}
                    />
                    {deptSearchQuery && (
                      <button
                        type="button"
                        onClick={() => setDeptSearchQuery('')}
                        style={{
                          position: 'absolute',
                          right: '10px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          background: 'none',
                          border: 'none',
                          color: 'var(--text-muted)',
                          cursor: 'pointer'
                        }}
                      >
                        <i className="ti ti-x" style={{ fontSize: '12px' }}></i>
                      </button>
                    )}
                  </div>

                  {/* Scrollable Department List */}
                  <div 
                    style={{ 
                      maxHeight: '230px', 
                      overflowY: 'auto', 
                      display: 'flex', 
                      flexDirection: 'column', 
                      gap: '4px',
                      paddingRight: '4px' 
                    }}
                  >
                    {(() => {
                      const filtered = departmentsList.filter(d => 
                        !deptSearchQuery || 
                        d.toLowerCase().includes(deptSearchQuery.toLowerCase()) ||
                        getFacultyMeta(d).label.toLowerCase().includes(deptSearchQuery.toLowerCase())
                      );

                      if (filtered.length === 0) {
                        return (
                          <div style={{ padding: '16px 12px', textAlign: 'center' }}>
                            <p style={{ margin: '0 0 8px 0', fontSize: '13px', color: 'var(--text-muted)' }}>
                              No matching department found.
                            </p>
                            {deptSearchQuery.trim() && (
                              <button
                                type="button"
                                onClick={() => {
                                  setCustomDepartment(deptSearchQuery.trim());
                                  setIsDropdownOpen(false);
                                  setDeptSearchQuery('');
                                }}
                                className="btn-secondary"
                                style={{ padding: '6px 12px', fontSize: '12px' }}
                              >
                                Use "{deptSearchQuery.trim()}"
                              </button>
                            )}
                          </div>
                        );
                      }

                      return filtered.map(dep => {
                        const meta = getFacultyMeta(dep);
                        const isSelected = customDepartment === dep;
                        return (
                          <div
                            key={dep}
                            onClick={() => {
                              setCustomDepartment(dep);
                              setIsDropdownOpen(false);
                              setDeptSearchQuery('');
                            }}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              padding: '8px 10px',
                              borderRadius: '8px',
                              background: isSelected ? 'var(--primary-glow)' : 'transparent',
                              cursor: 'pointer',
                              transition: 'all 0.15s'
                            }}
                            onMouseOver={(e) => {
                              if (!isSelected) e.currentTarget.style.background = 'var(--bg-hover)';
                            }}
                            onMouseOut={(e) => {
                              if (!isSelected) e.currentTarget.style.background = 'transparent';
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
                              <i className={`ti ${meta.icon}`} style={{ color: meta.color, fontSize: '15px', flexShrink: 0 }}></i>
                              <span 
                                style={{ 
                                  fontSize: '13px', 
                                  color: 'var(--text-primary)', 
                                  fontWeight: isSelected ? '700' : '500',
                                  whiteSpace: 'nowrap',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis'
                                }}
                              >
                                {dep}
                              </span>
                            </div>
                            {isSelected && (
                              <i className="ti ti-check" style={{ color: 'var(--primary-color)', fontWeight: 'bold' }}></i>
                            )}
                          </div>
                        );
                      });
                    })()}
                  </div>
                </div>
              )}
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label style={{ fontWeight: '600', fontSize: '13.5px' }}>Google Drive Root Folder Link <span style={{ color: '#ef4444' }}>*</span></label>
              <input 
                type="url" 
                value={driveLink} 
                onChange={(e) => setDriveLink(e.target.value)} 
                placeholder="https://drive.google.com/drive/folders/..." 
                required 
                disabled={isSubmitting}
                style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid var(--border-color)', background: 'var(--bg-main)', color: 'var(--text-primary)', fontSize: '14px' }}
              />
            </div>

            {syncStatus && (
              <div style={{ padding: '10px', background: 'var(--bg-hover)', borderRadius: '8px', fontSize: '13px', fontWeight: 'bold', color: 'var(--primary-color)' }}>
                <i className={isSubmitting ? "ti ti-loader" : "ti ti-check"} style={{ marginRight: '6px', animation: isSubmitting ? 'spin 1s linear infinite' : 'none' }}></i>
                {syncStatus}
              </div>
            )}

            <button type="submit" className="btn-primary" disabled={isSubmitting} style={{ marginTop: '8px', padding: '12px', borderRadius: '10px', fontSize: '14px', fontWeight: '600' }}>
              {isSubmitting ? 'Syncing...' : 'Start Bulk Sync'}
            </button>
          </form>
        </div>

        {/* List of Managed Resources */}
        <div className="admin-flat-card" style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <h2 style={{ margin: 0, fontSize: '18px' }}><i className="ti ti-books" style={{ marginRight: '8px' }}></i> Uploaded Files</h2>
            {resources.length > 0 && (
              <button className="btn-danger" onClick={handleDeleteAll} style={{ padding: '6px 12px', fontSize: '12px', background: 'transparent', color: '#ef4444', border: '1px solid #ef4444', borderRadius: '6px' }}>
                Delete All
              </button>
            )}
          </div>

          {/* Department Filter for Uploaded Files */}
          {resources.length > 0 && (
            <div style={{ marginBottom: '14px', display: 'flex', gap: '8px', alignItems: 'center' }}>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                <i className="ti ti-filter"></i> Filter:
              </span>
              <select
                value={filterDept}
                onChange={(e) => setFilterDept(e.target.value)}
                style={{
                  padding: '6px 10px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-color)',
                  background: 'var(--bg-main)',
                  color: 'var(--text-primary)',
                  fontSize: '12px',
                  fontWeight: '600',
                  flex: 1,
                  cursor: 'pointer'
                }}
              >
                <option value="all">All Departments ({resources.length} files)</option>
                {Array.from(new Set(resources.map(r => r.department).filter(Boolean))).sort().map(d => {
                  const count = resources.filter(r => r.department === d).length;
                  return (
                    <option key={d} value={d}>
                      {d} ({count})
                    </option>
                  );
                })}
              </select>
            </div>
          )}
          
          {isLoading ? (
            <p style={{ color: 'var(--text-muted)' }}>Loading files...</p>
          ) : resources.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '24px', background: 'var(--bg-main)', borderRadius: '10px' }}>
              <p style={{ color: 'var(--text-muted)', fontSize: '14px', margin: 0 }}>No resources synced yet.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1, maxHeight: '420px', overflowY: 'auto', paddingRight: '8px' }}>
              {resources
                .filter(r => filterDept === 'all' || r.department === filterDept)
                .map(resource => (
                  <div key={resource.id} className="event-item" style={{ padding: '12px' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', gap: '6px', alignItems: 'center', marginBottom: '4px', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '11px', background: '#e2e8f0', color: '#334155', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold' }}>
                          {resource.resource_type}
                        </span>
                        <span style={{ fontSize: '11px', background: '#dbeafe', color: '#1e40af', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold' }}>
                          {resource.course}
                        </span>
                        {resource.department && (
                          <span style={{ fontSize: '11px', background: '#fef3c7', color: '#b45309', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold' }}>
                            {resource.department}
                          </span>
                        )}
                        {resource.year_semester && <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{resource.year_semester}</span>}
                      </div>
                      <h4 style={{ margin: '4px 0', fontSize: '14px' }}>{resource.topic || resource.subject}</h4>
                      {resource.topic && <p style={{ margin: '2px 0 6px 0', fontSize: '12px', color: 'var(--text-muted)' }}>Subject: {resource.subject}</p>}
                      <a href={resource.drive_link} target="_blank" rel="noopener noreferrer" style={{ fontSize: '12px', color: '#0ea5e9', textDecoration: 'none' }}>
                        <i className="ti ti-external-link"></i> View File
                      </a>
                    </div>
                    <button 
                      className="btn-danger" 
                      onClick={() => handleDelete(resource.id)}
                      style={{ padding: '6px 10px', fontSize: '12px', height: 'fit-content' }}
                      title="Delete File"
                    >
                      <i className="ti ti-trash"></i>
                    </button>
                  </div>
                ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
