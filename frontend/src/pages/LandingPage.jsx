import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';

export default function LandingPage() {
  const { user } = useAuth();

  return (
    <div className="landing-page-layout">
      <Navbar />

      {/* Hero Section */}
      <section className="landing-hero">
        <div className="hero-badge">Next-Gen College Academic Portal</div>
        <h1 className="landing-hero-title">
          Modern Smart Library &amp; Learning Platform
        </h1>
        <p className="landing-hero-subtitle">
          Seamless syllabus integration, instant QR code checkouts, interactive video lectures, peer study insights, and gamified student progress all in one unified platform.
        </p>

        <div className="hero-cta-group">
          {user ? (
            <Link
              to={user.role === 'student' ? '/student' : user.role === 'admin' ? '/admin' : '/librarian'}
              className="btn btn-primary btn-lg"
            >
              Open Dashboard ({user.role})
            </Link>
          ) : (
            <>
              <Link to="/register" className="btn btn-primary btn-lg">
                Create Student Account
              </Link>
              <Link to="/login" className="btn btn-outline btn-lg">
                Sign In to Portal
              </Link>
            </>
          )}
        </div>

        {/* Quick Stat Highlights */}
        <div className="hero-stats-row">
          <div className="stat-highlight">
            <span className="stat-number">30+</span>
            <span className="stat-label">Syllabus Books</span>
          </div>
          <div className="stat-highlight">
            <span className="stat-number">100%</span>
            <span className="stat-label">QR Code Enabled</span>
          </div>
          <div className="stat-highlight">
            <span className="stat-number">14 Days</span>
            <span className="stat-label">Standard Loan Period</span>
          </div>
          <div className="stat-highlight">
            <span className="stat-number">24/7</span>
            <span className="stat-label">E-Resources Access</span>
          </div>
        </div>
      </section>

      {/* Core Platform Modules */}
      <section className="landing-features-section">
        <div className="section-header-centered">
          <h2 className="section-heading">Engineered for Students, Librarians &amp; Faculty</h2>
          <p className="section-subheading">
            Everything your campus needs to transition from outdated paper ledgers to an automated, intelligent ecosystem.
          </p>
        </div>

        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon-wrapper">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
              </svg>
            </div>
            <h3 className="feature-title">Syllabus-Aligned Catalog</h3>
            <p className="feature-description">
              Students instantly see prescribed textbooks grouped by their exact course, semester, and curriculum subject without searching through unrelated titles.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon-wrapper">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 7V5a2 2 0 0 1 2-2h2"/>
                <path d="M17 3h2a2 2 0 0 1 2 2v2"/>
                <path d="M21 17v2a2 2 0 0 1-2 2h-2"/>
                <path d="M7 21H5a2 2 0 0 1-2-2v-2"/>
                <rect x="7" y="7" width="10" height="10"/>
              </svg>
            </div>
            <h3 className="feature-title">Fast QR Code Circulation</h3>
            <p className="feature-description">
              Auto-generated QR labels for every book and digital student ID cards. Scan card then book with camera for sub-second checkouts and returns.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon-wrapper">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="5 3 19 12 5 21 5 3"/>
              </svg>
            </div>
            <h3 className="feature-title">Digital E-Learning Hub</h3>
            <p className="feature-description">
              Stream chapter videos with auto-saved watch progress, take knowledge check quizzes, and view course PDF lecture notes directly in the browser.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon-wrapper">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
              </svg>
            </div>
            <h3 className="feature-title">Senior's Corner &amp; Reviews</h3>
            <p className="feature-description">
              Peer advice passed down semester-to-semester. Upvote curated notes, read book reviews from batchmates, and request acquisitions from the librarian.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon-wrapper">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="8" r="7"/>
                <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/>
              </svg>
            </div>
            <h3 className="feature-title">Gamification &amp; Certificates</h3>
            <p className="feature-description">
              Earn reading streaks, unlock badges, rise on the monthly leaderboard, download annual Wrapped story cards, and earn completion certificates.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon-wrapper">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="20" x2="18" y2="10"/>
                <line x1="12" y1="20" x2="12" y2="4"/>
                <line x1="6" y1="20" x2="6" y2="14"/>
              </svg>
            </div>
            <h3 className="feature-title">Analytics &amp; Smart Recommender</h3>
            <p className="feature-description">
              "Students who borrowed this also borrowed" collaborative filtering, circulation heatmaps, busiest weekdays, and real-time overdue tracking.
            </p>
          </div>
        </div>
      </section>

      {/* Role Access Portal Cards */}
      <section className="landing-roles-section">
        <h2 className="section-heading" style={{ textAlign: 'center', marginBottom: '2rem' }}>
          Portal Access by Role
        </h2>

        <div className="roles-grid">
          <div className="role-portal-card">
            <div className="role-badge badge-student">Student Access</div>
            <h3>Undergraduate &amp; Graduate Portal</h3>
            <p>Check syllabus books, view active loans, reserve books, stream lectures, practice quizzes, and download your QR ID Card.</p>
            <div className="role-demo-cred">Demo: student1 / student123</div>
            <Link to="/login" className="btn btn-primary btn-block">Student Login</Link>
          </div>

          <div className="role-portal-card">
            <div className="role-badge badge-librarian">Circulation Desk</div>
            <h3>Librarian Operations</h3>
            <p>Scan barcode / QR checkouts, manage reserve queues, track overdue books, calculate late fees, and moderate student posts.</p>
            <div className="role-demo-cred">Demo: librarian / librarian123</div>
            <Link to="/login" className="btn btn-outline btn-block">Librarian Login</Link>
          </div>

          <div className="role-portal-card">
            <div className="role-badge badge-admin">Administration</div>
            <h3>Academic Admin Center</h3>
            <p>Configure course curricula, toggle Exam Season Mode, monitor usage trends, and manage college system settings.</p>
            <div className="role-demo-cred">Demo: admin / admin123</div>
            <Link to="/login" className="btn btn-outline btn-block">Admin Login</Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="footer-content">
          <div className="footer-brand">
            <div className="brand-name">SmartLibrary Platform</div>
            <p>Empowering higher education with automated library intelligence.</p>
          </div>
          <div className="footer-links">
            <Link to="/login">Sign In</Link>
            <Link to="/register">Student Registration</Link>
          </div>
        </div>
        <div className="footer-copyright">
          Built with React &amp; Django REST Framework. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
