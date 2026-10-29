import { useRef } from 'react';
import Navbar from '../../components/Navbar';
import StudentBottomNav from '../../components/StudentBottomNav';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export default function LibraryCard() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const cardRef = useRef(null);

  const enrollmentCode = user?.enrollment_no || user?.username || 'STU-0001';
  // Fast, standalone QR code URL encoding student enrollment number for scanner
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&margin=8&data=${encodeURIComponent(enrollmentCode)}`;

  const handlePrint = () => {
    window.print();
    showToast('Sent library card to print dialog', 'info');
  };

  return (
    <div className="dashboard-layout with-bottom-nav">
      <Navbar />

      <main className="dashboard-content">
        <div className="page-header">
          <div>
            <h1 className="page-title">Digital Library Card</h1>
            <p className="page-subtitle">
              Show this QR code at the circulation desk for fast checkouts and returns.
            </p>
          </div>

          <button onClick={handlePrint} className="btn btn-outline btn-sm">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '6px' }}>
              <polyline points="6 9 6 2 18 2 18 9"/>
              <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/>
              <rect x="6" y="14" width="12" height="8"/>
            </svg>
            Print Card
          </button>
        </div>

        <div className="library-card-container">
          <div className="student-id-card" ref={cardRef}>
            <div className="id-card-header">
              <div className="id-card-brand">
                <span className="brand-dot" />
                <span className="id-inst-name">SMART CAMPUS LIBRARY</span>
              </div>
              <span className="id-tag">STUDENT PASS</span>
            </div>

            <div className="id-card-body">
              <div className="id-qr-box">
                <img
                  src={qrUrl}
                  alt={`Student QR Code for ${enrollmentCode}`}
                  className="id-qr-img"
                  loading="lazy"
                />
                <span className="qr-caption">SCAN AT DESK</span>
              </div>

              <div className="id-info-col">
                <h2 className="id-student-name">
                  {user?.first_name ? `${user.first_name} ${user.last_name || ''}` : user?.username}
                </h2>
                <div className="id-enrollment-label">ENROLLMENT NUMBER</div>
                <div className="id-enrollment-val">{enrollmentCode}</div>

                <div className="id-meta-grid">
                  <div>
                    <span className="meta-sub">COURSE</span>
                    <span className="meta-strong">{user?.course_name || 'BCA'}</span>
                  </div>
                  <div>
                    <span className="meta-sub">SEMESTER</span>
                    <span className="meta-strong">Semester {user?.semester_number || 1}</span>
                  </div>
                  <div>
                    <span className="meta-sub">MEMBER STATUS</span>
                    <span className="meta-strong status-active">Active</span>
                  </div>
                  <div>
                    <span className="meta-sub">VALID THRU</span>
                    <span className="meta-strong">2027 Academic</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="id-card-footer">
              <span>This credential is valid for campus library borrow &amp; digital terminal access.</span>
            </div>
          </div>
        </div>
      </main>

      <StudentBottomNav />
    </div>
  );
}
