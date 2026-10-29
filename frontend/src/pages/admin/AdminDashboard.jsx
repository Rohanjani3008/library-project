import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/Navbar';

export default function AdminDashboard() {
  const { user } = useAuth();

  return (
    <div className="dashboard-layout">
      <Navbar />

      <main className="dashboard-content">
        <section className="hero-greeting">
          <h1 className="hero-title">
            Admin Control Center - {user?.first_name || user?.username}
          </h1>
          <p style={{ color: 'var(--text-muted)' }}>
            System configuration, user management, and college academic structure control.
          </p>

          <div className="hero-meta">
            <div className="meta-item">
              <span className="meta-label">Role:</span>
              <span className="meta-value">Superuser / Administrator</span>
            </div>
            <div className="meta-item">
              <span className="meta-label">Username:</span>
              <span className="meta-value">{user?.username}</span>
            </div>
            <div className="meta-item">
              <span className="meta-label">Email:</span>
              <span className="meta-value">{user?.email || 'N/A'}</span>
            </div>
            <div className="meta-item">
              <span className="meta-label">Backend API:</span>
              <span className="meta-value" style={{ color: 'var(--accent-emerald)' }}>Connected (JWT Auth)</span>
            </div>
          </div>
        </section>

        <h2 className="section-title">Administrative Modules</h2>
        <div className="cards-grid">
          <div className="feature-card">
            <div className="card-icon-bubble">UM</div>
            <h3 className="card-title">User Management</h3>
            <p className="card-desc">
              Manage accounts, assign roles (Student, Librarian, Admin), and oversee student enrollment credentials.
            </p>
            <span className="card-status">Next Feature</span>
          </div>

          <div className="feature-card">
            <div className="card-icon-bubble">AA</div>
            <h3 className="card-title">Academic Architecture</h3>
            <p className="card-desc">
              Configure Courses, Semesters, Branches, and map curriculum syllabus subjects to academic terms.
            </p>
            <span className="card-status">Next Feature</span>
          </div>

          <div className="feature-card">
            <div className="card-icon-bubble">AU</div>
            <h3 className="card-title">Analytics &amp; Usage</h3>
            <p className="card-desc">
              Monitor peak library circulation hours, book checkouts, and student engagement statistics.
            </p>
            <span className="card-status">Next Feature</span>
          </div>

          <div className="feature-card">
            <div className="card-icon-bubble">SS</div>
            <h3 className="card-title">System Settings</h3>
            <p className="card-desc">
              Configure fine policies, maximum borrow periods, Cloudinary integration, and email alert triggers.
            </p>
            <span className="card-status">Next Feature</span>
          </div>
        </div>
      </main>
    </div>
  );
}
