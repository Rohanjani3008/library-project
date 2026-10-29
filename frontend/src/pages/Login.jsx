import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      setError('Please enter both username and password.');
      return;
    }

    setError('');
    setSubmitting(true);

    const result = await login(username.trim(), password);
    setSubmitting(false);

    if (result.success) {
      // Determine destination based on user role or previous route
      const destination = location.state?.from?.pathname;
      if (destination && destination !== '/login') {
        navigate(destination, { replace: true });
      } else if (result.user.role === 'admin') {
        navigate('/admin', { replace: true });
      } else if (result.user.role === 'librarian') {
        navigate('/librarian', { replace: true });
      } else {
        navigate('/student', { replace: true });
      }
    } else {
      setError(result.error);
    }
  };

  // Quick fill helper for testing & viva presentation
  const quickFill = (demoUser, demoPass) => {
    setUsername(demoUser);
    setPassword(demoPass);
    setError('');
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo-badge">SL</div>
          <h1 className="auth-title">Welcome Back</h1>
          <p className="auth-subtitle">Sign in to your library &amp; learning portal</p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="username">
              Username or Email
            </label>
            <input
              id="username"
              type="text"
              className="form-control"
              placeholder="e.g. admin or student@college.edu"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              className="form-control"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-block"
            disabled={submitting}
          >
            {submitting ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        <div className="demo-credentials-box">
          <div className="demo-title">Quick Demo Logins</div>
          <div className="demo-buttons-row">
            <button
              type="button"
              className="btn btn-secondary btn-xs"
              onClick={() => quickFill('admin', 'admin123')}
            >
              Fill Admin
            </button>
            <button
              type="button"
              className="btn btn-secondary btn-xs"
              onClick={() => quickFill('librarian', 'librarian123')}
            >
              Fill Librarian
            </button>
          </div>
        </div>

        <div className="auth-footer">
          Don't have an account?{' '}
          <Link to="/register">Register as Student</Link>
        </div>
      </div>
    </div>
  );
}
