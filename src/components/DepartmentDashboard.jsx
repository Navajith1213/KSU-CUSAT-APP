import React, { useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';

export default function DepartmentDashboard({ loggedStudent }) {
  const [resources, setResources] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [syncStatus, setSyncStatus] = useState('');
  
  // Form State
  const [driveLink, setDriveLink] = useState('');
  const [customDepartment, setCustomDepartment] = useState(''); // For Master Admin
  const [departmentsList, setDepartmentsList] = useState([]);

  const isMasterAdmin = loggedStudent?.email === 'navajith1122@gmail.com';
  const DRIVE_API_KEY = import.meta.env.VITE_GOOGLE_DRIVE_API_KEY;

  useEffect(() => {
    if (loggedStudent?.department || isMasterAdmin) {
      fetchMyResources();
    }
    if (isMasterAdmin) {
      supabase.from('contacts').select('data').then(({ data }) => {
        if (data) {
          const depts = data
            .map(d => d.data.name)
            .filter(n => n.toLowerCase().includes('department') || n.toLowerCase().includes('school'))
            .sort();
          setDepartmentsList(depts);
        }
      });
    }
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

    const finalDepartment = isMasterAdmin ? customDepartment : loggedStudent.department;
    if (!finalDepartment) {
      alert("Please select a department.");
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
      const courses = await fetchDriveFiles(rootFolderId);
      
      for (const course of courses) {
        if (course.mimeType !== 'application/vnd.google-apps.folder') continue;
        setSyncStatus(`Scanning Course: ${course.name}...`);
        
        const semesters = await fetchDriveFiles(course.id);
        for (const sem of semesters) {
          if (sem.mimeType !== 'application/vnd.google-apps.folder') continue;
          setSyncStatus(`Scanning ${course.name} > ${sem.name}...`);

          if (sem.name.trim().toLowerCase() === 'syllabus') {
            // SYLLABUS MODE
            // Expected: Course > Syllabus > Admission Year > Files
            const admissionYears = await fetchDriveFiles(sem.id);
            for (const adYear of admissionYears) {
              if (adYear.mimeType !== 'application/vnd.google-apps.folder') continue;
              setSyncStatus(`Scanning Syllabus > ${adYear.name}...`);

              const files = await fetchDriveFiles(adYear.id);
              if (files.length === 0) continue;

              const { data: existingData } = await supabase
                .from('academic_resources')
                .select('drive_link')
                .eq('department', finalDepartment);
              const existingLinks = new Set((existingData || []).map(r => r.drive_link));

              const resourcesToInsert = files
                .filter(f => f.mimeType !== 'application/vnd.google-apps.folder')
                .filter(f => !existingLinks.has(f.webViewLink))
                .map(file => ({
                  department: finalDepartment,
                  course: course.name.trim(),
                  year_semester: 'Syllabus',
                  subject: adYear.name.trim(), // We store the Admission Year in the subject column
                  resource_type: 'Syllabus',
                  topic: file.name.replace(/\.[^/.]+$/, "").trim(), // Strip extension for topic
                  drive_link: file.webViewLink,
                  added_by: loggedStudent.email
                }));

              if (resourcesToInsert.length > 0) {
                const { error } = await supabase.from('academic_resources').insert(resourcesToInsert);
                if (error) throw error;
                totalSynced += resourcesToInsert.length;
              }
            }
          } else {
            // REGULAR MODE
            // Expected: Course > Semester > Subject > Category > Files
            const subjects = await fetchDriveFiles(sem.id);
            for (const sub of subjects) {
              if (sub.mimeType !== 'application/vnd.google-apps.folder') continue;
              setSyncStatus(`Scanning Subject: ${sub.name}...`);

              const categories = await fetchDriveFiles(sub.id);
              for (const cat of categories) {
                if (cat.mimeType !== 'application/vnd.google-apps.folder') continue;

                const files = await fetchDriveFiles(cat.id);
                if (files.length === 0) continue;

                const { data: existingData } = await supabase
                  .from('academic_resources')
                  .select('drive_link')
                  .eq('department', finalDepartment);
                const existingLinks = new Set((existingData || []).map(r => r.drive_link));

                const resourcesToInsert = files
                  .filter(f => f.mimeType !== 'application/vnd.google-apps.folder')
                  .filter(f => !existingLinks.has(f.webViewLink))
                  .map(file => ({
                    department: finalDepartment,
                    course: course.name.trim(),
                    year_semester: sem.name.trim(),
                    subject: sub.name.trim(),
                    resource_type: cat.name.trim(),
                    topic: file.name.replace(/\.[^/.]+$/, "").trim(), // Strip extension for topic
                    drive_link: file.webViewLink,
                    added_by: loggedStudent.email
                  }));

                if (resourcesToInsert.length > 0) {
                  const { error } = await supabase.from('academic_resources').insert(resourcesToInsert);
                  if (error) throw error;
                  totalSynced += resourcesToInsert.length;
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
        query = query.eq('added_by', loggedStudent.email);
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
        query = query.eq('added_by', loggedStudent.email);
      } else {
        query = query.eq('department', customDepartment || loggedStudent.department);
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
        <div className="card">
          <h2><i className="ti ti-cloud-upload" style={{ marginRight: '8px' }}></i> Bulk Drive Sync</h2>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px' }}>
            Paste the link to your Root Folder. It must be set to "Anyone with the link can view". The folder must follow this exact structure: <strong>Course &gt; Semester &gt; Subject &gt; Category &gt; Files</strong>.
          </p>

          <form onSubmit={handleBulkSync} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            {isMasterAdmin && (
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Select Department</label>
                <input 
                  list="departments-list"
                  type="text" 
                  value={customDepartment} 
                  onChange={(e) => setCustomDepartment(e.target.value)} 
                  placeholder="Type or select a department..." 
                  required 
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-main)', color: 'var(--text-primary)' }}
                />
                <datalist id="departments-list">
                  {departmentsList.map((dep, idx) => (
                    <option key={idx} value={dep} />
                  ))}
                </datalist>
              </div>
            )}

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Google Drive Root Folder Link</label>
              <input 
                type="url" 
                value={driveLink} 
                onChange={(e) => setDriveLink(e.target.value)} 
                placeholder="https://drive.google.com/drive/folders/..." 
                required 
                disabled={isSubmitting}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-main)', color: 'var(--text-primary)' }}
              />
            </div>

            {syncStatus && (
              <div style={{ padding: '10px', background: 'var(--bg-hover)', borderRadius: '8px', fontSize: '13px', fontWeight: 'bold', color: 'var(--primary-color)' }}>
                <i className={isSubmitting ? "ti ti-loader" : "ti ti-check"} style={{ marginRight: '6px', animation: isSubmitting ? 'spin 1s linear infinite' : 'none' }}></i>
                {syncStatus}
              </div>
            )}

            <button type="submit" className="btn-primary" disabled={isSubmitting} style={{ marginTop: '8px' }}>
              {isSubmitting ? 'Syncing...' : 'Start Bulk Sync'}
            </button>
          </form>
        </div>

        {/* List of Managed Resources */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2 style={{ margin: 0 }}><i className="ti ti-books" style={{ marginRight: '8px' }}></i> Uploaded Files</h2>
            {resources.length > 0 && (
              <button className="btn-danger" onClick={handleDeleteAll} style={{ padding: '6px 12px', fontSize: '12px', background: 'transparent', color: '#ef4444', border: '1px solid #ef4444' }}>
                Delete All
              </button>
            )}
          </div>
          
          {isLoading ? (
            <p>Loading...</p>
          ) : resources.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '20px', background: 'var(--bg-main)', borderRadius: '8px' }}>
              <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>No resources synced yet.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1, maxHeight: '400px', overflowY: 'auto', paddingRight: '8px' }}>
              {resources.map(resource => (
                <div key={resource.id} className="event-item" style={{ padding: '12px' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '4px', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '11px', background: '#e2e8f0', color: '#334155', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold' }}>
                        {resource.resource_type}
                      </span>
                      <span style={{ fontSize: '11px', background: '#dbeafe', color: '#1e40af', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold' }}>
                        {resource.course}
                      </span>
                      {isMasterAdmin && (
                        <span style={{ fontSize: '11px', background: '#fef3c7', color: '#b45309', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold' }}>
                          {resource.department}
                        </span>
                      )}
                      {resource.year_semester && <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{resource.year_semester}</span>}
                    </div>
                    <h4 style={{ margin: '4px 0', fontSize: '15px' }}>{resource.subject}</h4>
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
