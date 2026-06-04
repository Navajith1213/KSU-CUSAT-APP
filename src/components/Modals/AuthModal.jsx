import React, { useState } from 'react';
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
  const [isAdminAuthPassed, setIsAdminAuthPassed] = useState(false);

  const handleStudentSignUp = async (e) => {
    e.preventDefault();
    if (!hasSupabaseConfig) {
      alert('Supabase is not configured yet. Sign up works after setting keys in the .env file.');
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
            full_name: fullName
          }
        }
      });
      if (error) throw error;
      alert('Registration successful! You can now log in.');
      setIsSignUp(false);
      setPassword('');
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStudentLogin = async (e) => {
    e.preventDefault();
    if (!hasSupabaseConfig) {
      // Mock student login fallback for testing if Supabase isn't configured yet
      if (email === 'student@cusat.ac.in' && password === 'student123') {
        const mockStudent = { email: 'student@cusat.ac.in', full_name: 'Demo Student' };
        setLoggedStudent(mockStudent);
        setUserRole('student');
        sessionStorage.setItem('student_session', JSON.stringify(mockStudent));
        setShowAuthModal(false);
        alert('Demo Student Logged In.');
      } else {
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

      const studentData = {
        email: data.user.email,
        full_name: data.user.user_metadata?.full_name || 'CUSAT Student',
        id: data.user.id
      };

      setLoggedStudent(studentData);
      setUserRole('student');
      sessionStorage.setItem('student_session', JSON.stringify(studentData));
      setShowAuthModal(false);
      alert(`Welcome back, ${studentData.full_name}!`);
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    if (!hasSupabaseConfig) {
      // Mock admin login fallback
      if (email === 'admin@cusat.ac.in' && password === 'admin123') {
        setIsAdminAuthPassed(true);
        alert('Admin Email & Password verified (Demo Mode)! Please enter your Git repo settings next.');
      } else {
        alert(
          'Supabase is not configured yet.\n\nTo try out the Admin section right away:\nUse Email: admin@cusat.ac.in\nUse Password: admin123'
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

      if (data.user.email === 'admin@cusat.ac.in') {
        setIsAdminAuthPassed(true);
        alert('Admin email verified! Please enter your Git repo settings next.');
      } else {
        throw new Error('This account does not have Admin access.');
      }
    } catch (err) {
      setErrorMsg(err.message);
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
          <div style={{ color: '#ef4444', backgroundColor: '#fef2f2', padding: '10px', borderRadius: '8px', fontSize: '13px', marginBottom: '14px', border: '1px solid #fee2e2' }}>
            {errorMsg}
          </div>
        )}

        {!isAdminAuthPassed ? (
          <div>
            {/* Header Tabs */}
            <div className="admin-tabs" style={{ marginBottom: '18px' }}>
              <button
                type="button"
                className={`admin-tab-btn ${activeTab === 'student' ? 'active' : ''}`}
                style={{ flex: 1, padding: '10px 0', textAlign: 'center' }}
                onClick={() => { setActiveTab('student'); setErrorMsg(''); }}
              >
                Student Portal
              </button>
              <button
                type="button"
                className={`admin-tab-btn ${activeTab === 'admin' ? 'active' : ''}`}
                style={{ flex: 1, padding: '10px 0', textAlign: 'center' }}
                onClick={() => { setActiveTab('admin'); setErrorMsg(''); setIsSignUp(false); }}
              >
                Campus Admin
              </button>
            </div>

            {activeTab === 'student' ? (
              /* Student signup or login form */
              <form onSubmit={isSignUp ? handleStudentSignUp : handleStudentLogin}>
                {isSignUp && (
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

                <p style={{ textAlign: 'center', marginTop: '16px', fontSize: '13px', color: '#64748b' }}>
                  {isSignUp ? 'Already have an account?' : "Don't have an account yet?"}{' '}
                  <button
                    type="button"
                    style={{ background: 'none', border: 'none', color: '#0d9488', fontWeight: '600', cursor: 'pointer', textDecoration: 'underline' }}
                    onClick={() => { setIsSignUp(!isSignUp); setErrorMsg(''); }}
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
                    placeholder="admin@cusat.ac.in"
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
