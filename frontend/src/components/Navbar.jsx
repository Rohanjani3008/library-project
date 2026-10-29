import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';
import api from '../api/client';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [examSeason, setExamSeason] = useState(null);
  const notifRef = useRef(null);

  useEffect(() => {
    // Check exam season status
    api.get('/api/academics/exam-season/')
      .then((res) => {
        if (res.data?.is_active) {
          setExamSeason(res.data.season);
        }
      })
      .catch(() => {});

    // Fetch notifications if logged in
    if (user) {
      fetchNotifications();
    }
  }, [user]);

  // Click outside to close notifications dropdown
  useEffect(() => {
    function handleClickOutside(e) {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/api/auth/notifications/');
      setNotifications(res.data.notifications || []);
      setUnreadCount(res.data.unread_count || 0);
    } catch {
      // silently ignore if not accessible
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.post('/api/auth/notifications/', { mark_all_read: true });
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      showToast('All notifications marked as read', 'success');
    } catch {
      showToast('Failed to mark notifications as read', 'error');
    }
  };

  const handleLogout = () => {
    logout();
    showToast('Signed out successfully', 'info');
    navigate('/login');
  };

  const getRoleBadgeClass = (role) => {
    switch (role) {
      case 'admin':
        return 'badge-admin';
      case 'librarian':
        return 'badge-librarian';
      default:
        return 'badge-student';
    }
  };

  const isStudent = user?.role === 'student';
  const isLibrarian = user?.role === 'librarian' || user?.role === 'admin';

  return (
    <header className="navbar-wrapper">
      {examSeason && (
        <div className="exam-season-strip">
          <div className="exam-season-content">
            <span className="exam-tag">EXAM SEASON ACTIVE</span>
            <span className="exam-text">
              High demand alert: Standard loan period shortened to {examSeason.short_loan_days || 7} days. Reserve essential books early!
            </span>
          </div>
        </div>
      )}

      <nav className="dashboard-navbar">
        <div className="brand-section">
          <Link to="/" className="brand-link">
            <div className="brand-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
                <path d="M12 6v6"/>
                <path d="M9 9h6"/>
              </svg>
            </div>
            <div>
              <div className="brand-name">SmartLibrary</div>
              <div className="brand-tag">Academic Portal</div>
            </div>
          </Link>
        </div>

        {/* Desktop Student Navigation Links */}
        {isStudent && (
          <div className="desktop-nav-links">
            <Link to="/student" className={`nav-link-item ${location.pathname === '/student' ? 'active' : ''}`}>
              Syllabus Books
            </Link>
            <Link to="/student/my-books" className={`nav-link-item ${location.pathname === '/student/my-books' ? 'active' : ''}`}>
              My Books
            </Link>
            <Link to="/student/resources" className={`nav-link-item ${location.pathname.startsWith('/student/resources') ? 'active' : ''}`}>
              E-Resources
            </Link>
            <Link to="/student/community" className={`nav-link-item ${location.pathname === '/student/community' ? 'active' : ''}`}>
              Community
            </Link>
            <Link to="/student/gamification" className={`nav-link-item ${location.pathname === '/student/gamification' ? 'active' : ''}`}>
              Badges &amp; Streak
            </Link>
            <Link to="/student/wrapped" className={`nav-link-item ${location.pathname === '/student/wrapped' ? 'active' : ''}`}>
              Wrapped
            </Link>
          </div>
        )}

        {/* Right Section: Theme Toggle, Notifications, User Badge, Logout */}
        <div className="navbar-actions">
          {/* Theme Toggle Button */}
          <button
            type="button"
            className="theme-toggle-btn"
            onClick={toggleTheme}
            aria-label="Toggle Dark/Light Mode"
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
          >
            {theme === 'dark' ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="5"/>
                <line x1="12" y1="1" x2="12" y2="3"/>
                <line x1="12" y1="21" x2="12" y2="23"/>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                <line x1="1" y1="12" x2="3" y2="12"/>
                <line x1="21" y1="12" x2="23" y2="12"/>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
              </svg>
            )}
          </button>

          {/* Notifications Bell Dropdown */}
          {user && (
            <div className="notif-wrapper" ref={notifRef}>
              <button
                type="button"
                className="notif-bell-btn"
                onClick={() => setShowNotifMenu((prev) => !prev)}
                aria-label="View notifications"
                title="Notifications"
              >
                <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                  <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                </svg>
                {unreadCount > 0 && (
                  <span className="notif-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
                )}
              </button>

              {showNotifMenu && (
                <div className="notif-dropdown">
                  <div className="notif-header">
                    <span className="notif-header-title">Notifications</span>
                    {unreadCount > 0 && (
                      <button
                        className="btn-link-xs"
                        onClick={handleMarkAllRead}
                      >
                        Mark all read
                      </button>
                    )}
                  </div>
                  <div className="notif-list">
                    {notifications.length === 0 ? (
                      <div className="notif-empty">No notifications right now.</div>
                    ) : (
                      notifications.map((n) => (
                        <div key={n.id} className={`notif-card ${!n.read ? 'unread' : ''}`}>
                          <div className="notif-title">{n.title}</div>
                          <div className="notif-message">{n.message}</div>
                          <div className="notif-time">
                            {new Date(n.created_at).toLocaleDateString([], {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* User Details & Sign Out */}
          {user ? (
            <div className="user-profile-section">
              <div className="user-info-text">
                <span className="user-display-name">
                  {user.first_name ? `${user.first_name} ${user.last_name || ''}` : user.username}
                </span>
                <span className={`user-badge ${getRoleBadgeClass(user.role)}`}>
                  {user.role}
                </span>
              </div>

              {isStudent && (
                <Link
                  to="/student/card"
                  className="btn btn-outline btn-xs"
                  title="My Library QR Card"
                >
                  ID Card
                </Link>
              )}

              <button
                onClick={handleLogout}
                className="btn btn-danger-outline btn-xs"
                title="Sign out of your session"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <div className="auth-buttons-group">
              <Link to="/login" className="btn btn-outline btn-sm">Log In</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Register</Link>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
}
