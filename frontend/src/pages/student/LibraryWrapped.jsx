import { useState, useEffect, useRef } from 'react';
import html2canvas from 'html2canvas';
import Navbar from '../../components/Navbar';
import StudentBottomNav from '../../components/StudentBottomNav';
import { useToast } from '../../context/ToastContext';
import api from '../../api/client';

export default function LibraryWrapped() {
  const { showToast } = useToast();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const storyCardRef = useRef(null);

  useEffect(() => {
    api.get('/api/wrapped/')
      .then((res) => setData(res.data))
      .catch(() => showToast('Could not load Wrapped data', 'error'))
      .finally(() => setLoading(false));
  }, []);

  const handleDownloadImage = async () => {
    if (!storyCardRef.current) return;
    try {
      setDownloading(true);
      showToast('Rendering story card image...', 'info');
      const canvas = await html2canvas(storyCardRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#0f172a',
      });
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `Library_Wrapped_${data?.user_name || 'Scholar'}.png`;
      link.href = dataUrl;
      link.click();
      showToast('Saved Wrapped story card to your downloads!', 'success');
    } catch {
      showToast('Failed to export image', 'error');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="dashboard-layout with-bottom-nav">
      <Navbar />

      <main className="dashboard-content">
        <div className="page-header">
          <div>
            <h1 className="page-title">Library Wrapped {data?.year || 2026}</h1>
            <p className="page-subtitle">
              Your annual college learning, reading milestones, and achievement journey.
            </p>
          </div>

          <button
            onClick={handleDownloadImage}
            disabled={downloading || loading}
            className="btn btn-primary btn-sm"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '6px' }}>
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            {downloading ? 'Rendering Image...' : 'Download / Share as Image'}
          </button>
        </div>

        {loading ? (
          <div className="wrapped-container">
            <div className="skeleton-card" style={{ height: '560px', maxWidth: '420px', margin: '0 auto' }} />
          </div>
        ) : (
          <div className="wrapped-container">
            {/* Story Card Target for html2canvas */}
            <div className="wrapped-story-card" ref={storyCardRef}>
              <div className="wrapped-glow-orb orb-1" />
              <div className="wrapped-glow-orb orb-2" />

              <div className="wrapped-header">
                <div className="wrapped-brand">
                  <span className="wrapped-dot" />
                  <span>SMART CAMPUS LIBRARY</span>
                </div>
                <span className="wrapped-year-pill">{data?.year || 2026} WRAPPED</span>
              </div>

              <div className="wrapped-user-block">
                <h2 className="wrapped-name">{data?.user_name}</h2>
                <div className="wrapped-course">{data?.course_name}</div>
              </div>

              <div className="wrapped-metrics-grid">
                <div className="wrapped-stat-box">
                  <div className="wrapped-num-big">{data?.books_read}</div>
                  <div className="wrapped-label">Textbooks Finished</div>
                </div>

                <div className="wrapped-stat-box">
                  <div className="wrapped-num-big">{data?.total_videos_watched}</div>
                  <div className="wrapped-label">Lectures Completed</div>
                </div>

                <div className="wrapped-stat-box">
                  <div className="wrapped-num-big">{data?.longest_streak}</div>
                  <div className="wrapped-label">Day Longest Streak</div>
                </div>

                <div className="wrapped-stat-box">
                  <div className="wrapped-num-big">{data?.total_points}</div>
                  <div className="wrapped-label">Total Points Earned</div>
                </div>
              </div>

              <div className="wrapped-highlight-card">
                <div className="highlight-subtitle">TOP ACADEMIC SUBJECT</div>
                <div className="highlight-title">{data?.top_subject}</div>
              </div>

              <div className="wrapped-highlight-card">
                <div className="highlight-subtitle">FAVOURITE GENRE</div>
                <div className="highlight-title">{data?.favourite_category}</div>
              </div>

              {data?.badges_earned && data.badges_earned.length > 0 && (
                <div className="wrapped-badges-section">
                  <div className="highlight-subtitle" style={{ marginBottom: '6px' }}>BADGES UNLOCKED</div>
                  <div className="wrapped-badge-pills">
                    {data.badges_earned.map((bName, i) => (
                      <span key={i} className="wrapped-badge-tag">
                        * {bName}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="wrapped-footer">
                <span>Verified by Campus Library Circulation System</span>
              </div>
            </div>
          </div>
        )}
      </main>

      <StudentBottomNav />
    </div>
  );
}
