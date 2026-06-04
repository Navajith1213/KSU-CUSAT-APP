import React from 'react';

export default function AuthModal({
  gitOwner,
  setGitOwner,
  gitRepo,
  setGitRepo,
  gitPat,
  setGitPat,
  isPublishing,
  handleLogin,
  setShowAuthModal
}) {
  return (
    <div className="modal-overlay" onClick={() => setShowAuthModal(false)}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>GitHub Admin Connection</h2>
          <button className="close-btn" onClick={() => setShowAuthModal(false)}>&times;</button>
        </div>

        <form onSubmit={handleLogin}>
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
              To manage data, you need a Personal Access Token with write permissions.
              <br />
              1. Go to <a href="https://github.com/settings/tokens" target="_blank" rel="noopener noreferrer">GitHub Developer Settings</a>.
              <br />
              2. Generate a token (Classic) with the <strong>repo (contents write)</strong> scope.
              <br />
              3. Enter it here to access the editor. Credentials are kept safely in-session only.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
