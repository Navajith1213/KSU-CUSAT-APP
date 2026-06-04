import React, { useState, useEffect } from 'react';
import { supabase, hasSupabaseConfig } from '../../utils/supabaseClient';

export default function AdminQueries() {
  const [adminComplaints, setAdminComplaints] = useState([]);
  const [loadingQueries, setLoadingQueries] = useState(false);

  const fetchAllComplaints = async () => {
    setLoadingQueries(true);
    if (!hasSupabaseConfig) {
      const allQueries = JSON.parse(localStorage.getItem('mock_all_queries') || '[]');
      setAdminComplaints(allQueries);
      setLoadingQueries(false);
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
      setLoadingQueries(false);
    }
  };

  useEffect(() => {
    fetchAllComplaints();
  }, []);

  const updateComplaintStatus = async (idx, complaintItem, newStatus) => {
    if (hasSupabaseConfig) {
      try {
        const { error } = await supabase
          .from('complaints')
          .update({ status: newStatus })
          .eq('id', complaintItem.id);
        if (error) throw error;
        alert('Status updated successfully!');
        fetchAllComplaints();
      } catch (err) {
        alert(`Failed to update status: ${err.message}`);
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
      <div style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '16px', marginBottom: '20px' }}>
        <h2>Student Filed Queries & Complaints</h2>
        <p style={{ fontSize: '13.5px', color: '#64748b', marginTop: '4px' }}>
          Read support tickets submitted by students and update their official resolution status below.
        </p>
      </div>

      {loadingQueries ? (
        <p style={{ textAlign: 'center', padding: '24px', color: '#64748b' }}>
          <i className="ti ti-loader" style={{ display: 'inline-block', animation: 'spin 1s linear infinite', marginRight: '8px', fontSize: '18px' }}></i>
          Loading support tickets...
        </p>
      ) : adminComplaints.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {adminComplaints.map((item, idx) => (
            <div key={idx} className="event-item" style={{ flexDirection: 'column', alignItems: 'stretch', gap: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', color: '#0d9488', backgroundColor: '#f0fdfa', padding: '3px 8px', borderRadius: '12px' }}>
                  {item.category}
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '12.5px', color: '#64748b', fontWeight: '600' }}>Status:</span>
                  <select
                    value={item.status}
                    onChange={(e) => updateComplaintStatus(idx, item, e.target.value)}
                    style={{ padding: '6px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', background: 'white', cursor: 'pointer' }}
                  >
                    <option value="Submitted">Submitted</option>
                    <option value="Letter Given">Letter Given</option>
                    <option value="Resolved">Resolved</option>
                  </select>
                </div>
              </div>
              <h4 style={{ fontSize: '15px', color: '#0f172a', fontWeight: '700' }}>{item.subject}</h4>
              <p style={{ fontSize: '13.5px', color: '#475569', lineHeight: '1.5' }}>{item.description}</p>
              <div style={{ borderTop: '1px dashed #f1f5f9', paddingTop: '8px', marginTop: '4px', fontSize: '12px', color: '#94a3b8', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                <span>Filed by: <strong>{item.student_name}</strong> ({item.student_email})</span>
                <span>Date: {new Date(item.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '48px 24px', border: '2px dashed #e2e8f0', borderRadius: '12px', color: '#94a3b8' }}>
          <i className="ti ti-mail-opened" style={{ fontSize: '32px', marginBottom: '8px', color: '#cbd5e1', display: 'block' }}></i>
          <p>No complaints filed yet.</p>
        </div>
      )}
    </div>
  );
}
