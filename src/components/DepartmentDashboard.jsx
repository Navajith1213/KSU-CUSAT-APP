import React, { useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';

export default function DepartmentDashboard({ loggedStudent }) {
  const [resources, setResources] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form State
  const [subject, setSubject] = useState('');
  const [resourceType, setResourceType] = useState('Notes');
  const [yearSemester, setYearSemester] = useState('');
  const [driveLink, setDriveLink] = useState('');
  const [customDepartment, setCustomDepartment] = useState(''); // For Master Admin

  const isMasterAdmin = loggedStudent?.email === 'navajith1122@gmail.com';

  useEffect(() => {
    if (loggedStudent?.department || isMasterAdmin) {
      fetchMyResources();
    }
  }, [loggedStudent]);

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

  const handleAddResource = async (e) => {
    e.preventDefault();
    const finalDepartment = isMasterAdmin ? customDepartment.trim() : loggedStudent.department;
    
    if (!subject.trim() || !driveLink.trim() || !finalDepartment) {
      alert("Please fill all required fields.");
      return;
    }

    // Basic Google Drive link validation
    if (!driveLink.includes('drive.google.com') && !driveLink.includes('docs.google.com')) {
      alert("Please enter a valid Google Drive link.");
      return;
    }

    setIsSubmitting(true);
    try {
      const newResource = {
        department: finalDepartment,
        subject: subject.trim(),
        resource_type: resourceType,
        year_semester: yearSemester.trim(),
        drive_link: driveLink.trim(),
        added_by: loggedStudent.email
      };

      const { data, error } = await supabase
        .from('academic_resources')
        .insert([newResource])
        .select();

      if (error) throw error;

      alert('Resource added successfully!');
      setResources([data[0], ...resources]);
      
      // Reset form
      setSubject('');
      setYearSemester('');
      setDriveLink('');
      if (isMasterAdmin) setCustomDepartment('');
    } catch (error) {
      alert('Error adding resource: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this resource?")) return;
    
    try {
      let query = supabase.from('academic_resources').delete().eq('id', id);
      
      if (!isMasterAdmin) {
        query = query.eq('added_by', loggedStudent.email);
      }

      const { error } = await query;
      
      setResources(resources.filter(r => r.id !== id));
    } catch (error) {
      alert('Error deleting resource: ' + error.message);
    }
  };

  if (!loggedStudent?.department) {
    return <div className="content"><p>Error: You are not assigned to a department.</p></div>;
  }

  return (
    <div className="fade-in-section">
      <div className="hero-section" style={{ padding: '32px 24px', marginBottom: '24px', background: 'linear-gradient(135deg, rgba(13, 148, 136, 0.05), rgba(30, 58, 138, 0.05))' }}>
        <h1 className="hero-title" style={{ fontSize: '24px', color: '#0f766e' }}>
          {isMasterAdmin ? 'Master Resource Manager' : 'Department Dashboard'}
        </h1>
        <p className="hero-subtitle" style={{ marginBottom: 0 }}>
          {isMasterAdmin ? 'God Mode: Managing all departments' : `Managing resources for: ${loggedStudent.department}`}
        </p>
      </div>

      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
        
        {/* Add Resource Form */}
        <div className="card">
          <h2><i className="ti ti-file-plus" style={{ marginRight: '8px' }}></i> Add New Resource</h2>
          <form onSubmit={handleAddResource} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            {isMasterAdmin && (
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Department Name</label>
                <input 
                  type="text" 
                  value={customDepartment} 
                  onChange={(e) => setCustomDepartment(e.target.value)} 
                  placeholder="e.g. Mechanical Engineering" 
                  required 
                />
              </div>
            )}

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Subject / Topic Name</label>
              <input 
                type="text" 
                value={subject} 
                onChange={(e) => setSubject(e.target.value)} 
                placeholder="e.g. Data Structures" 
                required 
              />
            </div>
            
            <div className="form-grid">
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Resource Type</label>
                <select value={resourceType} onChange={(e) => setResourceType(e.target.value)}>
                  <option value="Notes">Notes</option>
                  <option value="PYQ">Previous Year Question</option>
                  <option value="Syllabus">Syllabus</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Year / Semester (Optional)</label>
                <input 
                  type="text" 
                  value={yearSemester} 
                  onChange={(e) => setYearSemester(e.target.value)} 
                  placeholder="e.g. Sem 3, 2024" 
                />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Google Drive Shareable Link</label>
              <input 
                type="url" 
                value={driveLink} 
                onChange={(e) => setDriveLink(e.target.value)} 
                placeholder="https://drive.google.com/file/d/..." 
                required 
              />
              <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                Make sure the link sharing setting is "Anyone with the link can view".
              </p>
            </div>

            <button type="submit" className="btn-primary" disabled={isSubmitting} style={{ marginTop: '8px' }}>
              {isSubmitting ? 'Adding...' : 'Add Resource'}
            </button>
          </form>
        </div>

        {/* List of Managed Resources */}
        <div className="card">
          <h2><i className="ti ti-books" style={{ marginRight: '8px' }}></i> Uploaded Resources</h2>
          
          {isLoading ? (
            <p>Loading...</p>
          ) : resources.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '20px', background: 'var(--bg-main)', borderRadius: '8px' }}>
              <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>No resources uploaded yet.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '400px', overflowY: 'auto', paddingRight: '8px' }}>
              {resources.map(resource => (
                <div key={resource.id} className="event-item" style={{ padding: '12px' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '4px' }}>
                      <span style={{ fontSize: '11px', background: '#e2e8f0', color: '#334155', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold' }}>
                        {resource.resource_type}
                      </span>
                      {isMasterAdmin && (
                        <span style={{ fontSize: '11px', background: '#fef3c7', color: '#b45309', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold' }}>
                          {resource.department}
                        </span>
                      )}
                      {resource.year_semester && <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{resource.year_semester}</span>}
                    </div>
                    <h4 style={{ margin: 0, fontSize: '15px' }}>{resource.subject}</h4>
                    <a href={resource.drive_link} target="_blank" rel="noopener noreferrer" style={{ fontSize: '12px', color: '#0ea5e9', textDecoration: 'none' }}>
                      <i className="ti ti-external-link"></i> View Link
                    </a>
                  </div>
                  <button 
                    className="btn-danger" 
                    onClick={() => handleDelete(resource.id)}
                    style={{ padding: '6px 10px', fontSize: '12px' }}
                    title="Delete Resource"
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
