import React, { useState, useRef, useEffect } from 'react';
import { supabase, hasSupabaseConfig } from '../../utils/supabaseClient';
import { firebaseAuth, isFirebaseConfigured } from '../../utils/firebaseClient';
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';

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
  setShowAuthModal,
  initialMode = 'login',
  contacts = []
}) {
  const [activeTab, setActiveTab] = useState('student'); // 'student' or 'admin'
  const [isSignUp, setIsSignUp] = useState(initialMode === 'register');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [department, setDepartment] = useState('');
  
  // OTP Verification state
  const [verificationMode, setVerificationMode] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [verificationType, setVerificationType] = useState('email'); // 'email' or 'phone'
  const confirmationResultRef = useRef(null);
  const recaptchaVerifierRef = useRef(null);


  // Lock background body scroll when AuthModal is mounted
  useEffect(() => {
    document.body.classList.add('modal-open');
    return () => {
      document.body.classList.remove('modal-open');
    };
  }, []);

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
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            phone_number: trimmedPhone,
            department: department,
            phone_verified: true
          }
        }
      });
      if (error) throw error;

      if (data.session) {
        const studentData = {
          email: data.user.email,
          fullName: data.user.user_metadata?.full_name || fullName,
          phone_number: data.user.user_metadata?.phone_number || trimmedPhone,
          id: data.user.id,
          department: data.user.user_metadata?.department || department
        };
        setLoggedStudent(studentData);
        setShowAuthModal(false);
        alert('Account created successfully! You are now logged in.');
      } else {
        alert('Account created! Please check your email inbox to confirm your account.');
        setIsSignUp(false);
        setPassword('');
      }
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifySignUp = async (e) => {
    e.preventDefault();
    if (!otpCode.trim()) {
      setErrorMsg('Please enter the 6-digit code.');
      return;
    }
    setIsLoading(true);
    setErrorMsg('');
    try {
      // Firebase Phone OTP path
      if (verificationType === 'phone' && confirmationResultRef.current) {
        // Verify the 6-digit code via Firebase
        const result = await confirmationResultRef.current.confirm(otpCode);

        // Get the cryptographically signed Firebase ID Token
        const firebaseToken = await result.user.getIdToken();

        // Sign out of the temporary Firebase session immediately
        await firebaseAuth.signOut();
        confirmationResultRef.current = null;

        // Register the user securely via the Supabase Edge Function
        const trimmedPhone = phone.trim();
        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/firebase-otp-signup`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY
            },
            body: JSON.stringify({
              email,
              password,
              fullName,
              department,
              phone: trimmedPhone,
              firebaseToken
            })
          }
        );
        const responseData = await response.json();
        if (!responseData.success) {
          throw new Error(responseData.error || 'Registration failed. Please try again.');
        }

        // Account created server-side. Now log in via standard Supabase email/password.
        const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        if (loginError) throw loginError;

        const studentData = {
          email: loginData.user.email,
          full_name: loginData.user.user_metadata?.full_name || fullName,
          phone_number: loginData.user.user_metadata?.phone_number || trimmedPhone,
          id: loginData.user.id,
          department: ''
        };
        setLoggedStudent(studentData);
        setShowAuthModal(false);
        alert('Account created and mobile number verified successfully! You are now logged in.');

      } else if (verificationType === 'phone') {
        // Supabase-native phone OTP fallback
        const trimmedPhone = phone.trim();
        const { data, error } = await supabase.auth.verifyOtp({
          phone: `+91${trimmedPhone}`,
          token: otpCode,
          type: 'phone_change'
        });
        if (error) throw error;

        setLoggedStudent(data.user);
        setShowAuthModal(false);
        alert('Account created and mobile number verified successfully! You are now logged in.');
      } else {
        // Email OTP verification
        const { data, error } = await supabase.auth.verifyOtp({
          email,
          token: otpCode,
          type: 'signup'
        });
        if (error) throw error;

        alert('Email verified successfully! You can now log in.');
        setVerificationMode(false);
        setIsSignUp(false);
        setPassword('');
        setPhone('');
        setOtpCode('');
      }
    } catch (err) {
      setErrorMsg(
        err.code === 'auth/invalid-verification-code'
          ? 'Invalid verification code. Please check and try again.'
          : err.message
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleStudentLogin = async (e) => {
    e.preventDefault();
    if (isRateLimited()) return;
    if (!hasSupabaseConfig) {
      alert('Supabase is not configured yet. Please configure it in .env');
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
      alert('Supabase is not configured yet. Please configure it in .env');
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

      if (data.user && data.user.email) {
        // Dynamically check the master_admins table
        const { data: adminData, error: adminError } = await supabase
          .from('master_admins')
          .select('email')
          .eq('email', data.user.email.toLowerCase())
          .single();

        if (adminData) {
          setUserRole('admin');
          setLoggedStudent({ email: data.user.email.toLowerCase(), full_name: 'Master Admin' });
          setShowAuthModal(false);
          alert('Master Admin Logged In.');
          return;
        }
      }

      // If they are not in the master_admins table, sign them out and throw error
      await supabase.auth.signOut();
      throw new Error('This account does not have Master Admin access.');
    } catch (err) {
      recordFailedAttempt();
      setErrorMsg(`Login failed: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={() => setShowAuthModal(false)}>
      <div id="recaptcha-container"></div>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Portal Login</h2>
          <button className="close-btn" onClick={() => setShowAuthModal(false)}>&times;</button>
        </div>

        {errorMsg && (
          <div style={{ color: '#ef4444', backgroundColor: 'var(--bg-hover)', padding: '10px', borderRadius: '8px', fontSize: '13px', marginBottom: '14px', border: '1px solid var(--border-color)' }}>
            {errorMsg}
          </div>
        )}

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
              /* Student signup, login, or OTP verification form */
              verificationMode ? (
                <form onSubmit={handleVerifySignUp}>
                  <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                    <i className={verificationType === 'phone' ? "ti ti-device-mobile-message" : "ti ti-mail-opened"} style={{ fontSize: '48px', color: '#0284c7', marginBottom: '12px' }}></i>
                    <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--text-primary)', marginBottom: '8px' }}>
                      {verificationType === 'phone' ? 'Verify Your Mobile Number' : 'Verify Your Email'}
                    </h3>
                    <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                      {verificationType === 'phone' ? (
                        <>We just sent a 6-digit SMS code to your phone number <strong>{phone}</strong>.</>
                      ) : (
                        <>We just sent a 6-digit code to <strong>{email}</strong>.</>
                      )}
                    </p>
                  </div>
                  <div className="form-group">
                    <label>6-Digit Code *</label>
                    <input
                      type="text"
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value)}
                      placeholder="Enter the code"
                      maxLength={6}
                      required
                      style={{ fontSize: '20px', letterSpacing: '4px', textAlign: 'center' }}
                    />
                  </div>
                  <button type="submit" className="login-btn" style={{ width: '100%', padding: '12px' }} disabled={isLoading}>
                    {isLoading ? 'Verifying...' : 'Verify and Create Account'}
                  </button>
                  <button
                    type="button"
                    style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '13px', cursor: 'pointer', textDecoration: 'underline', marginTop: '16px', width: '100%', textAlign: 'center' }}
                    onClick={() => { setVerificationMode(false); setOtpCode(''); }}
                    disabled={isLoading}
                  >
                    Cancel
                  </button>
                </form>
              ) : (
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
                      <div className="form-group">
                        <label>Your Department *</label>
                        <select
                          value={department}
                          onChange={(e) => setDepartment(e.target.value)}
                          required
                        >
                          <option value="" disabled>Select your department</option>
                          {contacts.map((contact, idx) => (
                            <option key={idx} value={contact.name}>{contact.name}</option>
                          ))}
                          <option value="Other">Other / Not Listed</option>
                        </select>
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
              )
            ) : (
              /* Admin login credentials form */
              <form onSubmit={handleAdminLogin}>
                <div className="form-group">
                  <label>Admin Email *</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@ksucusat.com"
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
      </div>
    </div>
  );
}
