import React, { useState, useEffect } from 'react';
import { supabase, hasSupabaseConfig } from '../utils/supabaseClient';
import emailjs from '@emailjs/browser';
import BorderGlow from './BorderGlow';

export default function QueryPanel({ loggedStudent }) {
  const [complaints, setComplaints] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states
  const [category, setCategory] = useState('Accommodation');
  const [department, setDepartment] = useState('');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');

  const studentEmail = loggedStudent?.email || '';
  const studentName = loggedStudent?.full_name || 'CUSAT Student';

  const fetchComplaints = async (isBackground = false) => {
    if (!isBackground) setIsLoading(true);
    if (!hasSupabaseConfig) {
      // Fallback mock history using local storage if Supabase is offline
      const mockHistory = localStorage.getItem(`mock_queries_${studentEmail}`) || '[]';
      try {
        setComplaints(JSON.parse(mockHistory));
      } catch (_) {
        setComplaints([]);
      }
      if (!isBackground) setIsLoading(false);
      return;
    }

    try {
      // Supabase RLS will automatically restrict this query to only return the logged in user's complaints
      const { data, error } = await supabase
        .from('complaints')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setComplaints(data || []);
    } catch (err) {
      console.error('Error fetching complaints from Supabase:', err.message);
    } finally {
      if (!isBackground) setIsLoading(false);
    }
  };

  useEffect(() => {
    if (studentEmail) {
      fetchComplaints();

      if (hasSupabaseConfig) {
        const subscription = supabase
          .channel('public:complaints')
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'complaints', filter: `student_email=eq.${studentEmail}` },
            (payload) => {
              // Whenever a complaint is updated by admin, refetch
              fetchComplaints(true);
            }
          )
          .subscribe();

        return () => {
          supabase.removeChannel(subscription);
        };
      }
    }
  }, [studentEmail]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!subject.trim() || !description.trim()) {
      alert('Please fill out all fields.');
      return;
    }

    setIsSubmitting(true);

    try {
      const contactInfo = loggedStudent?.phone_number ? `\nStudent Contact: +91 ${loggedStudent.phone_number}` : '';
      const deptInfo = department ? `\nDepartment: ${department}` : '';
      
      const finalDescription = (contactInfo || deptInfo) 
        ? `${description}\n\n---${deptInfo}${contactInfo}`
        : description;

      const newQuery = {
        student_email: studentEmail,
        student_name: studentName,
        category,
        subject,
        description: finalDescription,
        status: 'Submitted',
        created_at: new Date().toISOString()
      };

      // 1. Save to Database
      if (hasSupabaseConfig) {
        const { error } = await supabase
          .from('complaints')
          .insert([newQuery]);
        if (error) throw error;
      } else {
        // Mock fallback to LocalStorage
        // 1. Save to student-specific history
        const mockHistory = JSON.parse(localStorage.getItem(`mock_queries_${studentEmail}`) || '[]');
        const updatedHistory = [newQuery, ...mockHistory];
        localStorage.setItem(`mock_queries_${studentEmail}`, JSON.stringify(updatedHistory));

        // 2. Save to global history for Admin Dashboard to read
        const mockAllHistory = JSON.parse(localStorage.getItem('mock_all_queries') || '[]');
        const updatedAllHistory = [newQuery, ...mockAllHistory];
        localStorage.setItem('mock_all_queries', JSON.stringify(updatedAllHistory));
      }

      // 2. Dispatch Email via EmailJS
      const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID || 'service_md0z31d';
      const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID || 'template_9k5720i';
      const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY || '5KyZs1iDc1fjlytBD';

      const isEmailJSConfigured = 
        serviceId && 
        serviceId !== 'YOUR_EMAILJS_SERVICE_ID_HERE' && 
        templateId && 
        templateId !== 'YOUR_EMAILJS_TEMPLATE_ID_HERE' && 
        publicKey && 
        publicKey !== 'YOUR_EMAILJS_PUBLIC_KEY_HERE';

      if (isEmailJSConfigured) {
        await emailjs.send(
          serviceId,
          templateId,
          {
            student_name: studentName,
            student_email: studentEmail,
            category: category,
            subject: subject,
            description: finalDescription
          },
          publicKey
        );
      } else {
        console.warn('EmailJS is not configured. The query was saved to the database but no email notification was dispatched to the admin.');
      }

      alert('Query filed successfully! The admin has been notified.');
      setSubject('');
      setDescription('');
      setDepartment('');
      fetchComplaints();
    } catch (err) {
      alert(`Failed to file complaint: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteQuery = async (queryId) => {
    if (!window.confirm("Are you sure you want to delete this query? This action cannot be undone.")) return;
    
    if (!hasSupabaseConfig) {
      // Offline fallback
      const mockComplaints = JSON.parse(localStorage.getItem(`mock_complaints_${loggedStudent?.email}`) || '[]');
      const updated = mockComplaints.filter(c => c.id !== queryId);
      localStorage.setItem(`mock_complaints_${loggedStudent?.email}`, JSON.stringify(updated));
      setComplaints(updated);
      alert('Query deleted offline.');
      return;
    }

    try {
      const { error } = await supabase.from('complaints').delete().eq('id', queryId);
      if (error) throw error;
      
      setComplaints(complaints.filter(c => c.id !== queryId));
      alert('Query deleted successfully.');
    } catch (err) {
      alert(`Failed to delete query: ${err.message}`);
    }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
      
      {/* Complaint Filing Form */}
      <BorderGlow className="card" style={{ alignSelf: 'start' }}>
        <h2>File a Query or Complaint</h2>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '18px', marginTop: '-8px' }}>
          Fill out this form to request assistance. Your query will be saved in your portal log and emailed directly to the Kerala Students Union President.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Category *</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="Accommodation">Accommodation (Hostel / PG)</option>
              <option value="Dining">Dining & Food spots</option>
              <option value="Academic">Academic Support</option>
              <option value="Campus Services">Campus Amenities</option>
              <option value="Clubs">Campus Clubs</option>
              <option value="Website Issues">Website Issues / Bug Report</option>
              <option value="Others">Others</option>
            </select>
          </div>

          <div className="form-group">
            <label>Your Department *</label>
            <input
              type="text"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              placeholder="e.g. Computer Science, Mechanical, B.Com"
              required
            />
          </div>

          <div className="form-group">
            <label>Subject *</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Brief summary of the issue"
              required
            />
          </div>

          <div className="form-group">
            <label>Detailed Description *</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide all relevant details..."
              style={{ minHeight: '140px', resize: 'vertical' }}
              required
            ></textarea>
          </div>

          <button type="submit" className="btn-secondary" style={{ width: '100%', padding: '12px' }} disabled={isSubmitting}>
            {isSubmitting ? (
              <span>
                <i className="ti ti-loader" style={{ display: 'inline-block', animation: 'spin 1s linear infinite', marginRight: '6px' }}></i>
                Filing Request...
              </span>
            ) : (
              <span>
                <i className="ti ti-mail-forward" style={{ marginRight: '6px' }}></i> Submit to Admin
              </span>
            )}
          </button>
        </form>
      </BorderGlow>

      {/* Complaints History Panel */}
      <BorderGlow className="card">
        <h2>Your Sent Queries & Status</h2>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '18px', marginTop: '-8px' }}>
          Track the status of queries you have submitted previously.
        </p>

        {isLoading ? (
          <p style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>
            <i className="ti ti-loader" style={{ display: 'inline-block', animation: 'spin 1s linear infinite', marginRight: '8px', fontSize: '18px' }}></i>
            Loading history...
          </p>
        ) : complaints.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', maxHeight: '500px', overflowY: 'auto', paddingRight: '4px' }}>
            {complaints.map((item, idx) => (
              <div key={idx} className="event-item" style={{ flexDirection: 'column', alignItems: 'stretch', gap: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', color: '#0284c7', backgroundColor: 'var(--bg-hover)', padding: '3px 8px', borderRadius: '12px' }}>
                    {item.category}
                  </span>
                  <span style={{
                    fontSize: '11px',
                    fontWeight: '600',
                    padding: '3px 8px',
                    borderRadius: '12px',
                    backgroundColor: item.status === 'Resolved' ? '#dcfce7' : item.status === 'Letter Given' ? '#fef3c7' : '#f1f5f9',
                    color: item.status === 'Resolved' ? '#15803d' : item.status === 'Letter Given' ? '#b45309' : '#475569'
                  }}>
                    {item.status}
                  </span>
                </div>
                <h4 style={{ fontSize: '15px', color: 'var(--text-primary)', fontWeight: '700' }}>{item.subject}</h4>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.4', whiteSpace: 'pre-wrap' }}>{item.description}</p>
                <div style={{ borderTop: '1px dashed #f1f5f9', paddingTop: '6px', marginTop: '4px', fontSize: '11px', color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>Submitted on: {new Date(item.created_at).toLocaleDateString()}</span>
                  
                  {/* Delete Button logic (1 hour window) */}
                  {new Date() - new Date(item.created_at) < 60 * 60 * 1000 ? (
                    <button 
                      onClick={() => handleDeleteQuery(item.id)}
                      style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                      title="You can delete this query within 1 hour of submission"
                    >
                      <i className="ti ti-trash"></i> Delete Query
                    </button>
                  ) : (
                    <span title="Deletion window has closed (1 hour limit)" style={{ color: '#94a3b8', fontSize: '10px' }}>
                      <i className="ti ti-lock" style={{ marginRight: '4px' }}></i>
                      Deletion locked
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '48px 24px', border: '2px dashed #e2e8f0', borderRadius: '12px', color: 'var(--text-muted)' }}>
            <i className="ti ti-mail-opened" style={{ fontSize: '32px', marginBottom: '8px', color: '#cbd5e1', display: 'block' }}></i>
            <p>You have not submitted any complaints yet.</p>
          </div>
        )}
      </BorderGlow>

    </div>
  );
}
