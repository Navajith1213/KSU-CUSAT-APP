import React, { useState } from 'react';
import { supabase, hasSupabaseConfig } from '../utils/supabaseClient';

export default function JoinKSUForm({ setActiveModule }) {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    blood_group: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.phone.trim() || !formData.blood_group) {
      setErrorMsg("Please fill in all fields.");
      return;
    }
    setErrorMsg('');
    setIsSubmitting(true);

    try {
      if (hasSupabaseConfig) {
        const { error } = await supabase
          .from('join_requests')
          .insert([
            {
              name: formData.name.trim(),
              phone: formData.phone.trim(),
              blood_group: formData.blood_group
            }
          ]);
        if (error) throw error;
      } else {
        // Fallback for demo mode
        console.log("Mock saved join request:", formData);
      }
      
      setIsSuccess(true);
      setTimeout(() => {
        setActiveModule('home');
      }, 3000);
      
    } catch (err) {
      setErrorMsg(err.message || 'An error occurred while submitting your request.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '60px 20px', maxWidth: '500px', margin: '40px auto' }}>
        <i className="ti ti-circle-check" style={{ fontSize: '64px', color: '#10b981', marginBottom: '20px' }}></i>
        <h2 style={{ fontSize: '28px', color: 'var(--text-primary)', marginBottom: '12px' }}>Thank You for Joining KSU!</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '16px', lineHeight: '1.6' }}>
          Your application has been received. Our representatives will contact you shortly.
        </p>
        <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '24px' }}>Redirecting to home...</p>
      </div>
    );
  }

  return (
    <div className="card" style={{ maxWidth: '600px', margin: '20px auto' }}>
      <button 
        className="btn-secondary" 
        onClick={() => setActiveModule('home')}
        style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '6px' }}
      >
        <i className="ti ti-arrow-left"></i> Back to Home
      </button>

      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '64px', height: '64px', borderRadius: '50%', background: '#e0f2fe', color: '#0284c7', marginBottom: '16px' }}>
          <i className="ti ti-users-group" style={{ fontSize: '32px' }}></i>
        </div>
        <h2 style={{ fontSize: '28px', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '12px' }}>Join Kerala Students Union</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '15.5px', lineHeight: '1.6' }}>
          Become a part of the largest democratic student movement. Stand for student rights, welfare, and progressive values on campus.
        </p>
      </div>

      {errorMsg && (
        <div style={{ padding: '12px 16px', background: '#fee2e2', color: '#b91c1c', borderRadius: '8px', marginBottom: '24px', fontSize: '14px', border: '1px solid #fca5a5' }}>
          <i className="ti ti-alert-circle" style={{ marginRight: '8px' }}></i>
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div className="form-group">
          <label>Full Name *</label>
          <input 
            type="text" 
            name="name"
            value={formData.name} 
            onChange={handleChange} 
            placeholder="e.g. Rahul M"
            required
            disabled={isSubmitting}
            className="input-field"
          />
        </div>

        <div className="form-group">
          <label>Phone Number *</label>
          <input 
            type="tel" 
            name="phone"
            value={formData.phone} 
            onChange={handleChange} 
            placeholder="10-digit mobile number"
            required
            disabled={isSubmitting}
            className="input-field"
          />
        </div>

        <div className="form-group">
          <label>Blood Group *</label>
          <select 
            name="blood_group"
            value={formData.blood_group}
            onChange={handleChange}
            required
            disabled={isSubmitting}
            className="input-field"
          >
            <option value="" disabled>Select your blood group</option>
            <option value="A+">A+</option>
            <option value="A-">A-</option>
            <option value="B+">B+</option>
            <option value="B-">B-</option>
            <option value="O+">O+</option>
            <option value="O-">O-</option>
            <option value="AB+">AB+</option>
            <option value="AB-">AB-</option>
          </select>
        </div>

        <button 
          type="submit" 
          className="btn-primary" 
          disabled={isSubmitting}
          style={{ padding: '14px', fontSize: '16px', fontWeight: 'bold', marginTop: '8px' }}
        >
          {isSubmitting ? 'Submitting Application...' : 'Submit Application'}
        </button>
      </form>
    </div>
  );
}
