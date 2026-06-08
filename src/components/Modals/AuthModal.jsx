import React, { useState, useRef } from 'react';
import { supabase, hasSupabaseConfig } from '../../utils/supabaseClient';

export default function AuthModal({
  gitOwner,
  setGitOwner,
  gitRepo,
  setGitRepo,
  gitPat,
  setGitPat,
  isPublishing,
  handleGitConnect,
  setUserRole,
  setLoggedStudent,
  setShowAuthModal
}) {
  const [activeTab, setActiveTab] = useState('student'); // 'student' or 'admin'
  const [isSignUp, setIsSignUp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [isAdminAuthPassed, setIsAdminAuthPassed] = useState(false);

  // Rate limiting: lock login after 5 failed attempts within 60 seconds
  const loginAttempts = useRef([]);
  const MAX_ATTEMPTS = 5;
  const LOCKOUT_MS = 30000; // 30 second lockout

  const isRateLimited = () => {
    const now = Date.now();
    // Keep only attempts within the last 60 seconds
    loginAttempts.current = loginAttempts.current.filter(t => now - t < 60000);
    if (loginAttempts.current.length >= MAX_ATTEMPTS) {
      const oldest = loginAttempts.current[0];
      const remaining = Math.ceil((LOCKOUT_MS - (now - oldest)) / 1000);
      if (remaining > 0) {
        setErrorMsg(`Too many login attempts. Please wait ${remaining} seconds before trying again.`);
        return true;
      }
      loginAttempts.current = [];
    }
    return false;
  };

  const recordFailedAttempt = () => {
    loginAttempts.current.push(Date.now());
  };

  // Secret admin access: triple-click Student Portal within 5 seconds
  const clickTimestamps = useRef([]);
  const handleStudentTabClick = () => {
    const now = Date.now();
    clickTimestamps.current.push(now);
    // Keep only clicks within the last 5 seconds
    clickTimestamps.current = clickTimestamps.current.filter(t => now - t < 5000);
    if (clickTimestamps.current.length >= 3) {
      clickTimestamps.current = [];
      setActiveTab('admin');
      setErrorMsg('');
      setIsSignUp(false);
    } else {
      setActiveTab('student');
      setErrorMsg('');
    }
  };

  const handleStudentSignUp = async (e) => {
    e.preventDefault();
    if (!hasSupabaseConfig) {
      alert('Supabase is not configured yet. Sign up works after setting keys in the .env file.');
      return;
    }

    // Mobile number validation (Indian Mobile number standard: 10 digits starting with 6, 7, 8 or 9)
    const trimmedPhone = phone.trim();
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(trimmedPhone)) {
      setErrorMsg('Invalid Mobile Number: Must be a 10-digit number starting with 6, 7, 8, or 9.');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            phone_number: trimmedPhone
          }
        }
      });
      if (error) throw error;
      alert('Registration successful! You can now log in.');
      setIsSignUp(false);
      setPassword('');
      setPhone('');
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStudentLogin = async (e) => {
    e.preventDefault();
    if (isRateLimited()) return;
    if (!hasSupabaseConfig) {
      // Mock student login fallback for testing if Supabase isn't configured yet
      if (email === 'student@cusat.ac.in' && password === 'student123') {
        const mockStudent = { 
          email: 'student@cusat.ac.in', 
          full_name: 'Demo Student',
          phone_number: '9876543210'
        };
        setLoggedStudent(mockStudent);
        setUserRole('student');
        sessionStorage.setItem('student_session', JSON.stringify(mockStudent));
        setShowAuthModal(false);
        alert('Demo Student Logged In.');
      } else {
        recordFailedAttempt();
        alert(
          'Supabase is not configured yet.\n\nTo try out the portal right away without Supabase:\nUse Email: student@cusat.ac.in\nUse Password: student123'
        );
      }
      return;
    }
    setIsLoading(true);
    setErrorMsg('');
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      if (error) throw error;

      let managedDepartment = '';
      let finalRole = 'student';
      
      try {
        const { data: adminData } = await supabase
          .from('department_admins')
          .select('department')
          .eq('email', data.user.email)
          .maybeSingle();
          
        if (adminData) {
          finalRole = 'dept_admin';
          managedDepartment = adminData.department;
        }
      } catch (err) {
        console.error("Error checking department admin status:", err);
      }

      const studentData = {
        email: data.user.email,
        full_name: data.user.user_metadata?.full_name || 'CUSAT Student',
        phone_number: data.user.user_metadata?.phone_number || '',
        id: data.user.id,
        department: managedDepartment
      };

      setLoggedStudent(studentData);
      setUserRole(finalRole);
      sessionStorage.setItem('student_session', JSON.stringify(studentData));
      setShowAuthModal(false);
      alert(`Welcome back, ${studentData.full_name}!`);
    } catch (err) {
      recordFailedAttempt();
      setErrorMsg('Login failed. Please check your email and password.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email.trim()) {
      setErrorMsg('Please enter your email address first, then click Forgot Password.');
      return;
    }
    if (!hasSupabaseConfig) {
      alert('Supabase is not configured. Password reset is unavailable in demo mode.');
      return;
    }
    setIsLoading(true);
    setErrorMsg('');
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin
      });
      if (error) throw error;
      alert('Password reset link sent! Check your email inbox.');
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    if (isRateLimited()) return;
    if (!hasSupabaseConfig) {
      // Mock admin login fallback
      if (email === 'navajith1122@gmail.com' && password === 'admin123') {
        setIsAdminAuthPassed(true);
        alert('Admin Email & Password verified (Demo Mode)! Please enter your Git repo settings next.');
      } else {
        recordFailedAttempt();
        alert(
          'Supabase is not configured yet.\n\nTo try out the Admin section right away:\nUse Email: navajith1122@gmail.com\nUse Password: admin123'
        );
      }
      return;
    }
    setIsLoading(true);
    setErrorMsg('');
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      if (error) throw error;

      if (data.user.email === 'navajith1122@gmail.com') {
        setIsAdminAuthPassed(true);
        alert('Admin email verified! Please enter your Git repo settings next.');
      } else {
        throw new Error('This account does not have Admin access.');
      }
    } catch (err) {
      recordFailedAttempt();
      setErrorMsg('Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={() => setShowAuthModal(false)}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{isAdminAuthPassed ? 'GitHub Admin Connection' : 'Portal Login'}</h2>
          <button className="close-btn" onClick={() => setShowAuthModal(false)}>&times;</button>
        </div>

        {errorMsg && (
          <div style={{ color: '#ef4444', backgroundColor: 'var(--bg-hover)', padding: '10px', borderRadius: '8px', fontSize: '13px', marginBottom: '14px', border: '1px solid var(--border-color)' }}>
            {errorMsg}
          </div>
        )}

        {!isAdminAuthPassed ? (
          <div>
            {/* Header Tab — Admin access hidden behind triple-click */}
            <div className="admin-tabs" style={{ marginBottom: '18px' }}>
              <button
                type="button"
                className={`admin-tab-btn ${activeTab === 'student' ? 'active' : ''}`}
                style={{ width: '100%', padding: '10px 0', textAlign: 'center' }}
                onClick={handleStudentTabClick}
              >
                {activeTab === 'admin' ? 'Admin Login' : 'Student Portal'}
              </button>
            </div>

            {activeTab === 'student' ? (
              /* Student signup or login form */
              <form onSubmit={isSignUp ? handleStudentSignUp : handleStudentLogin}>
                {isSignUp && (
                  <>
                    <div className="form-group">
                      <label>Full Name *</label>
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Enter your name"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Mobile Number *</label>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                        placeholder="10-digit mobile number"
                        pattern="[6-9][0-9]{9}"
                        maxLength={10}
                        required
                      />
                      <small style={{ color: 'var(--text-muted)', fontSize: '11px', marginTop: '4px', display: 'block' }}>
                        Must be exactly 10 digits starting with 6, 7, 8, or 9 (Indian standard).
                      </small>
                    </div>
                  </>
                )}

                <div className="form-group">
                  <label>Email Address *</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="yourname@gmail.com"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Password *</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                  />
                </div>

                <button type="submit" className="login-btn" style={{ width: '100%', padding: '12px' }} disabled={isLoading}>
                  {isLoading ? 'Processing...' : isSignUp ? 'Create Student Account' : 'Student Log In'}
                </button>

                {!isSignUp && (
                  <p style={{ textAlign: 'right', marginTop: '8px', marginBottom: '0' }}>
                    <button
                      type="button"
                      style={{ background: 'none', border: 'none', color: '#6366f1', fontSize: '12px', cursor: 'pointer', textDecoration: 'underline', padding: 0 }}
                      onClick={handleForgotPassword}
                      disabled={isLoading}
                    >
                      Forgot your password?
                    </button>
                  </p>
                )}

                 <p style={{ textAlign: 'center', marginTop: '16px', fontSize: '13px', color: 'var(--text-muted)' }}>
                  {isSignUp ? 'Already have an account?' : "Don't have an account yet?"}{' '}
                  <button
                    type="button"
                    style={{ background: 'none', border: 'none', color: '#0284c7', fontWeight: '600', cursor: 'pointer', textDecoration: 'underline' }}
                    onClick={() => { setIsSignUp(!isSignUp); setErrorMsg(''); setPhone(''); }}
                  >
                    {isSignUp ? 'Log In' : 'Sign Up'}
                  </button>
                </p>
              </form>
            ) : (
              /* Admin login credentials form */
              <form onSubmit={handleAdminLogin}>
                <div className="form-group">
                  <label>Admin Email *</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="navajith1122@gmail.com"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Admin Password *</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                  />
                </div>

                <button type="submit" className="login-btn" style={{ width: '100%', padding: '12px' }} disabled={isLoading}>
                  {isLoading ? 'Verifying...' : 'Validate Admin Credentials'}
                </button>
              </form>
            )}
          </div>
        ) : (
          /* GitHub connection screen (only shown for authorized admin) */
          <form onSubmit={handleGitConnect}>
            <div className="form-group">
              <label>GitHub Username (Owner)</label>
              <input
                type="text"
                value={gitOwner}
                onChange={(e) => setGitOwner(e.target.value)}
                placeholder="GitHub username"
                required
              />
            </div>

            <div className="form-group">
              <label>Repository Name</label>
              <input
                type="text"
                value={gitRepo}
                onChange={(e) => setGitRepo(e.target.value)}
                placeholder="Repository name"
                required
              />
            </div>

            <div className="form-group">
              <label>Personal Access Token (PAT)</label>
              <input
                type="password"
                value={gitPat}
                onChange={(e) => setGitPat(e.target.value)}
                placeholder="github_pat_..."
                required
              />
            </div>

            <button type="submit" className="login-btn" style={{ width: '100%' }} disabled={isPublishing}>
              {isPublishing ? 'Verifying...' : 'Unlock Admin Panel'}
            </button>

            <div className="help-box">
              <strong>Setup Instructions:</strong>
              <p style={{ marginTop: '4px' }}>
                To manage listings, connect the app to your GitHub repository.
                <br />
                1. Go to <a href="https://github.com/settings/tokens" target="_blank" rel="noopener noreferrer">GitHub settings</a>.
                <br />
                2. Generate a token with the <strong>repo</strong> contents write scopes.
              </p>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
