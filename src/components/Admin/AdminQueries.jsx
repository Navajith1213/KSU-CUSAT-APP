import React, { useState, useEffect } from 'react';
import { supabase, hasSupabaseConfig } from '../../utils/supabaseClient';

export default function AdminQueries() {
  const [adminComplaints, setAdminComplaints] = useState([]);
  const [loadingQueries, setLoadingQueries] = useState(false);

  const fetchAllComplaints = async (isBackground = false) => {
    if (!isBackground) setLoadingQueries(true);
    if (!hasSupabaseConfig) {
      const allQueries = JSON.parse(localStorage.getItem('mock_all_queries') || '[]');
      setAdminComplaints(allQueries);
      if (!isBackground) setLoadingQueries(false);
      return;
    }
    try {
      const { data, error } = await supabase
        .from('complaints')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setAdminComplaints(data || []);
    } catch (err) {
      console.error('Error fetching complaints from Supabase:', err.message);
    } finally {
      if (!isBackground) setLoadingQueries(false);
    }
  };

  useEffect(() => {
    fetchAllComplaints();
    
    if (hasSupabaseConfig) {
      const subscription = supabase
        .channel('admin_complaints')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'complaints' },
          (payload) => {
            fetchAllComplaints(true);
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(subscription);
      };
    }
  }, []);

  const updateComplaintStatus = async (idx, complaintItem, newStatus) => {
    // Optimistic UI update
    const newAdminComplaints = [...adminComplaints];
    newAdminComplaints[idx] = { ...newAdminComplaints[idx], status: newStatus };
    setAdminComplaints(newAdminComplaints);

    if (hasSupabaseConfig) {
      try {
        const { error } = await supabase
          .from('complaints')
          .update({ status: newStatus })
          .eq('id', complaintItem.id);
        if (error) {
          // Revert on error
          fetchAllComplaints(true);
          throw error;
        }
      } catch (err) {
        console.error(`Failed to update status: ${err.message}`);
      }
    } else {
      // Mock update to local storage
      const allQueries = JSON.parse(localStorage.getItem('mock_all_queries') || '[]');
      const updatedQueries = allQueries.map((item, i) => {
        if (i === idx) {
          return { ...item, status: newStatus };
        }
        return item;
      });
      localStorage.setItem('mock_all_queries', JSON.stringify(updatedQueries));

      const studentEmail = complaintItem.student_email;
      const studentQueries = JSON.parse(localStorage.getItem(`mock_queries_${studentEmail}`) || '[]');
      const updatedStudentQueries = studentQueries.map((item) => {
        if (item.subject === complaintItem.subject && item.created_at === complaintItem.created_at) {
          return { ...item, status: newStatus };
        }
        return item;
      });
      localStorage.setItem(`mock_queries_${studentEmail}`, JSON.stringify(updatedStudentQueries));

      alert('Status updated successfully (Demo Mode)!');
      fetchAllComplaints();
    }
  };

  return (
    <div className="card">
      <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '16px', marginBottom: '20px' }}>
        <h2>Student Filed Queries & Complaints</h2>
        <p style={{ fontSize: '13.5px', color: 'var(--text-muted)', marginTop: '4px' }}>
          Read support tickets submitted by students and update their official resolution status below.
        </p>
      </div>

      {loadingQueries ? (
        <p style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>
          <i className="ti ti-loader" style={{ display: 'inline-block', animation: 'spin 1s linear infinite', marginRight: '8px', fontSize: '18px' }}></i>
          Loading support tickets...
        </p>
      ) : adminComplaints.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {adminComplaints.map((item, idx) => (
            <div key={idx} className="event-item" style={{ flexDirection: 'column', alignItems: 'stretch', gap: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', color: '#0284c7', backgroundColor: 'var(--bg-hover)', padding: '3px 8px', borderRadius: '12px' }}>
                  {item.category}
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '12.5px', color: 'var(--text-muted)', fontWeight: '600' }}>Status:</span>
                  <select
                    value={item.status}
                    onChange={(e) => updateComplaintStatus(idx, item, e.target.value)}
                    style={{ padding: '6px 12px', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '12px', background: 'var(--bg-card)', cursor: 'pointer' }}
                  >
                    <option value="Submitted">Submitted</option>
                    <option value="Letter Given">Letter Given</option>
                    <option value="Resolved">Resolved</option>
                  </select>
                </div>
              </div>
              <h4 style={{ fontSize: '15px', color: 'var(--text-primary)', fontWeight: '700' }}>{item.subject}</h4>
              <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', lineHeight: '1.5', whiteSpace: 'pre-wrap' }}>{item.description}</p>
              <div style={{ borderTop: '1px dashed #f1f5f9', paddingTop: '8px', marginTop: '4px', fontSize: '12px', color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                <span>Filed by: <strong>{item.student_name}</strong> ({item.student_email})</span>
                <span>Date: {new Date(item.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '48px 24px', border: '2px dashed #e2e8f0', borderRadius: '12px', color: 'var(--text-muted)' }}>
          <i className="ti ti-mail-opened" style={{ fontSize: '32px', marginBottom: '8px', color: '#cbd5e1', display: 'block' }}></i>
          <p>No complaints filed yet.</p>
        </div>
      )}
    </div>
  );
}
