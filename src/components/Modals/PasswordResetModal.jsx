import React, { useState } from 'react';
import { supabase } from '../../utils/supabaseClient';

export default function PasswordResetModal({ onClose }) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }
    
    setIsLoading(true);
    setErrorMsg('');
    try {
      const { error } = await supabase.auth.updateUser({ password });
      
      if (error) throw error;
      
      alert('Password updated successfully! You can now use your new password.');
      onClose(); // Close the modal
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '400px' }}>
        <div className="modal-header">
          <h2><i className="ti ti-lock" style={{ marginRight: '8px' }}></i> Reset Password</h2>
          <button className="close-btn" onClick={onClose}><i className="ti ti-x"></i></button>
        </div>
        
        <div className="modal-body">
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
            Please enter your new password below.
          </p>
          
          {errorMsg && (
            <div style={{ background: '#fef2f2', color: '#ef4444', padding: '10px', borderRadius: '8px', fontSize: '13px', marginBottom: '16px' }}>
              <i className="ti ti-alert-circle" style={{ marginRight: '6px' }}></i>
              {errorMsg}
            </div>
          )}
          
          <form onSubmit={handleResetPassword}>
            <div className="form-group">
              <label>New Password</label>
              <div style={{ position: 'relative' }}>
                <i className="ti ti-lock" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}></i>
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  style={{ paddingLeft: '36px' }}
                />
              </div>
            </div>
            
            <div className="form-group">
              <label>Confirm New Password</label>
              <div style={{ position: 'relative' }}>
                <i className="ti ti-lock-check" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}></i>
                <input 
                  type="password" 
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  style={{ paddingLeft: '36px' }}
                />
              </div>
            </div>
            
            <button type="submit" className="btn-primary" disabled={isLoading} style={{ width: '100%', marginTop: '8px' }}>
              {isLoading ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
