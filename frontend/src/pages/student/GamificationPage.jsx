import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import StudentBottomNav from '../../components/StudentBottomNav';
import { useToast } from '../../context/ToastContext';
import api from '../../api/client';

export default function GamificationPage() {
  const { showToast } = useToast();
  const [profile, setProfile] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('badges'); // 'badges', 'leaderboard', 'points'

  useEffect(() => {
    fetchGamificationData();
  }, []);

  const fetchGamificationData = async () => {
    try {
      setLoading(true);
      const [profRes, leadRes] = await Promise.all([
        api.get('/api/gamification/profile/'),
        api.get('/api/gamification/leaderboard/'),
      ]);
      setProfile(profRes.data);
      setLeaderboard(leadRes.data.leaderboard || []);
    } catch {
      showToast('Could not load gamification statistics', 'error');
    } finally {
      setLoading(false);
    }
  };

  const streak = profile?.streak || { current_streak: 0, longest_streak: 0 };
  const earnedBadgeIds = new Set((profile?.earned_badges || []).map((b) => b.id || b.badge?.id));

  return (
    <div className="dashboard-layout with-bottom-nav">
      <Navbar />

      <main className="dashboard-content">
        <div className="page-header">
          <div>
            <h1 className="page-title">Achievements &amp; Leaderboard</h1>
            <p className="page-subtitle">
              Earn points for on-time book returns, video lecture completions, passing quizzes, and reviews.
            </p>
          </div>

          <Link to="/student/wrapped" className="btn btn-primary btn-sm">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '6px' }}>
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
            </svg>
            View Library Wrapped
          </Link>
        </div>

        {/* Gamification Metric Stats Cards */}
        <div className="streak-stats-row">
          <div className="streak-card">
            <div className="streak-icon-wrap">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>
              </svg>
            </div>
            <div>
              <div className="streak-big-val">{streak.current_streak} Days</div>
              <div className="streak-meta-sub">Current Reading Streak</div>
            </div>
          </div>

          <div className="streak-card">
            <div className="streak-icon-wrap" style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8' }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="12" cy="8" r="7"/>
                <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/>
              </svg>
            </div>
            <div>
              <div className="streak-big-val">{profile?.total_points || 0} Pts</div>
              <div className="streak-meta-sub">Total Learning Points</div>
            </div>
          </div>

          <div className="streak-card">
            <div className="streak-icon-wrap" style={{ background: 'rgba(168, 85, 247, 0.15)', color: '#a855f7' }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
            </div>
            <div>
              <div className="streak-big-val">
                {profile?.earned_badges?.length || 0} / {profile?.all_badges?.length || 4}
              </div>
              <div className="streak-meta-sub">Badges Unlocked</div>
            </div>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="tab-pills-row" style={{ marginTop: '1.5rem' }}>
          <button
            className={`tab-pill-btn ${tab === 'badges' ? 'active' : ''}`}
            onClick={() => setTab('badges')}
          >
            Badges &amp; Trophies
          </button>
          <button
            className={`tab-pill-btn ${tab === 'leaderboard' ? 'active' : ''}`}
            onClick={() => setTab('leaderboard')}
          >
            Monthly Leaderboard
          </button>
          <button
            className={`tab-pill-btn ${tab === 'points' ? 'active' : ''}`}
            onClick={() => setTab('points')}
          >
            Activity Points History
          </button>
        </div>

        {loading ? (
          <div className="cards-grid">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="feature-card skeleton-card">
                <div className="skeleton-line" />
              </div>
            ))}
          </div>
        ) : (
          <>
            {/* TAB 1: BADGES */}
            {tab === 'badges' && (
              <div className="cards-grid">
                {(profile?.all_badges || []).map((badge) => {
                  const isUnlocked = earnedBadgeIds.has(badge.id);

                  return (
                    <div
                      key={badge.id}
                      className={`badge-card ${isUnlocked ? 'unlocked' : 'locked'}`}
                    >
                      <div className="badge-icon-bubble">
                        {isUnlocked ? (
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path d="M12 15l-2 5l9-9l-9-9l2 5l-7 4z" />
                          </svg>
                        ) : (
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                          </svg>
                        )}
                      </div>

                      <div className="badge-info">
                        <div className="badge-name-row">
                          <h3 className="badge-title">{badge.name}</h3>
                          <span className={`status-badge ${isUnlocked ? 'badge-success' : 'badge-neutral'}`}>
                            {isUnlocked ? 'Unlocked' : 'Locked'}
                          </span>
                        </div>
                        <p className="badge-description">{badge.description}</p>
                        <div className="badge-condition-tag">
                          Requirement: {badge.rule_type?.replace(/_/g, ' ')} &gt;= {badge.threshold}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* TAB 2: MONTHLY LEADERBOARD */}
            {tab === 'leaderboard' && (
              <div className="leaderboard-card-container">
                <div className="table-responsive">
                  <table className="modern-table">
                    <thead>
                      <tr>
                        <th style={{ width: '80px' }}>Rank</th>
                        <th>Student Member</th>
                        <th>Course</th>
                        <th>Points Earned</th>
                        <th>Longest Streak</th>
                      </tr>
                    </thead>
                    <tbody>
                      {leaderboard.length === 0 ? (
                        <tr>
                          <td colSpan="5" style={{ textAlign: 'center', padding: '2rem' }}>
                            No reader scores recorded this month yet.
                          </td>
                        </tr>
                      ) : (
                        leaderboard.map((student, idx) => (
                          <tr key={student.id || idx} className={idx === 0 ? 'top-leader-row' : ''}>
                            <td>
                              <span className={`rank-badge rank-${idx + 1}`}>
                                #{idx + 1}
                              </span>
                            </td>
                            <td style={{ fontWeight: 600 }}>
                              {student.first_name ? `${student.first_name} ${student.last_name || ''}` : student.username}
                              {idx === 0 && <span className="top-reader-tag">Top Reader</span>}
                            </td>
                            <td>{student.course_name || 'BCA'}</td>
                            <td>
                              <span className="points-val-highlight">{student.monthly_points || student.total_points || 0} pts</span>
                            </td>
                            <td>{student.longest_streak || 0} days</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB 3: POINTS LOGS */}
            {tab === 'points' && (
              <div className="points-logs-list">
                {(profile?.recent_points || []).length === 0 ? (
                  <div className="empty-state-card">
                    <p>No activity points recorded yet. Borrow a book, finish a lecture, or pass a quiz to start earning!</p>
                  </div>
                ) : (
                  <div className="requests-stack">
                    {profile.recent_points.map((p) => (
                      <div key={p.id} className="point-item-row">
                        <div className="point-left">
                          <span className="point-activity-tag">{p.activity_type?.replace(/_/g, ' ')}</span>
                          <span className="point-desc">{p.description}</span>
                        </div>
                        <div className="point-right">
                          <span className="point-badge">+{p.points} Pts</span>
                          <span className="point-time">{new Date(p.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </main>

      <StudentBottomNav />
    </div>
  );
}
