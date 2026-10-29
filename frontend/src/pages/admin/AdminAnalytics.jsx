import { useState, useEffect } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from 'recharts';
import Navbar from '../../components/Navbar';
import LibrarianSidebar from '../../components/LibrarianSidebar';
import { useToast } from '../../context/ToastContext';
import api from '../../api/client';

const PIE_COLORS = ['#38bdf8', '#818cf8', '#c084fc', '#34d399', '#fbbf24', '#f87171'];

export default function AdminAnalytics() {
  const { showToast } = useToast();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Exam Season Mode State
  const [examSeason, setExamSeason] = useState(null);
  const [togglingExam, setTogglingExam] = useState(false);

  useEffect(() => {
    fetchDashboard();
    fetchExamSeason();
  }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/analytics/dashboard/');
      setData(res.data);
    } catch {
      showToast('Could not load analytics metrics', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchExamSeason = async () => {
    try {
      const res = await api.get('/api/academics/exam-season/');
      setExamSeason(res.data);
    } catch {
      // ignore
    }
  };

  const handleToggleExamSeason = async () => {
    try {
      setTogglingExam(true);
      const nextActive = !examSeason?.is_active;
      const res = await api.post('/api/academics/exam-season/', {
        is_active: nextActive,
        title: 'Mid-Term Examinations 2026',
        short_loan_days: 7,
      });
      showToast(res.data.message || 'Exam Season Mode updated', 'success');
      fetchExamSeason();
    } catch (err) {
      showToast(err.response?.data?.error || 'Failed to update Exam Season Mode', 'error');
    } finally {
      setTogglingExam(false);
    }
  };

  const overview = data?.overview || {};

  return (
    <div className="dashboard-layout">
      <Navbar />

      <div className="layout-with-sidebar">
        <LibrarianSidebar />

        <main className="dashboard-content">
          <div className="page-header">
            <div>
              <h1 className="page-title">Campus Intelligence &amp; Analytics</h1>
              <p className="page-subtitle">
                Circulation frequency, catalog popularity, reading trends, and administrative exam controls.
              </p>
            </div>

            {/* Exam Season Toggle Card */}
            <div className="exam-mode-control-box">
              <div className="exam-status-indicator">
                <span className={`status-dot ${examSeason?.is_active ? 'active-pulse' : 'inactive'}`} />
                <span className="exam-status-text">
                  Exam Mode: {examSeason?.is_active ? 'ACTIVE (7-Day Loans)' : 'DISABLED (14-Day Loans)'}
                </span>
              </div>
              <button
                onClick={handleToggleExamSeason}
                disabled={togglingExam}
                className={`btn btn-xs ${examSeason?.is_active ? 'btn-danger-outline' : 'btn-primary'}`}
              >
                {togglingExam
                  ? 'Updating...'
                  : examSeason?.is_active
                  ? 'Disable Exam Mode'
                  : 'Activate Exam Mode'}
              </button>
            </div>
          </div>

          {/* Key Metric Stat Cards */}
          <div className="analytics-metrics-grid">
            <div className="analytics-metric-card">
              <div className="metric-header">
                <span className="metric-title">Total Textbooks</span>
                <span className="metric-bubble">BKS</span>
              </div>
              <div className="metric-value">{overview.total_books || 0}</div>
              <div className="metric-sub">{overview.total_copies || 0} Total Volume Copies</div>
            </div>

            <div className="analytics-metric-card">
              <div className="metric-header">
                <span className="metric-title">Active Members</span>
                <span className="metric-bubble" style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8' }}>STU</span>
              </div>
              <div className="metric-value">{overview.active_members || 0}</div>
              <div className="metric-sub">Enrolled Students &amp; Faculty</div>
            </div>

            <div className="analytics-metric-card">
              <div className="metric-header">
                <span className="metric-title">Issued Today</span>
                <span className="metric-bubble" style={{ background: 'rgba(52, 211, 153, 0.15)', color: '#34d399' }}>TOD</span>
              </div>
              <div className="metric-value">{overview.books_issued_today || 0}</div>
              <div className="metric-sub">Desk Checkouts Today</div>
            </div>

            <div className="analytics-metric-card">
              <div className="metric-header">
                <span className="metric-title">Overdue Checkouts</span>
                <span className="metric-bubble" style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#f87171' }}>OVD</span>
              </div>
              <div className="metric-value" style={{ color: 'var(--accent-crimson)' }}>
                {overview.overdue_count || 0}
              </div>
              <div className="metric-sub">Past 14-day borrowing term</div>
            </div>

            <div className="analytics-metric-card">
              <div className="metric-header">
                <span className="metric-title">Fine Collected</span>
                <span className="metric-bubble" style={{ background: 'rgba(251, 191, 36, 0.15)', color: '#fbbf24' }}>INR</span>
              </div>
              <div className="metric-value" style={{ color: 'var(--accent-amber)' }}>
                Rs {overview.fine_collected || 0}
              </div>
              <div className="metric-sub">Late Return Fees</div>
            </div>
          </div>

          {loading ? (
            <div className="cards-grid" style={{ marginTop: '2rem' }}>
              <div className="skeleton-card" style={{ height: '320px' }} />
              <div className="skeleton-card" style={{ height: '320px' }} />
            </div>
          ) : (
            <>
              {/* Charts Row: Monthly Trend Line Chart & Busiest Weekdays Bar Chart */}
              <div className="analytics-charts-grid">
                <div className="chart-container-card">
                  <h3 className="chart-card-title">Monthly Borrow Trend (Last 6 Months)</h3>
                  <div style={{ width: '100%', height: 260 }}>
                    <ResponsiveContainer>
                      <LineChart data={data?.trend_data || []}>
                        <XAxis dataKey="month" stroke="var(--text-muted)" />
                        <YAxis stroke="var(--text-muted)" />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'var(--bg-card)',
                            borderColor: 'var(--border-subtle)',
                            borderRadius: '8px',
                            color: 'var(--text-main)',
                          }}
                        />
                        <Line
                          type="monotone"
                          dataKey="issues"
                          stroke="#38bdf8"
                          strokeWidth={3}
                          dot={{ fill: '#38bdf8', r: 5 }}
                          activeDot={{ r: 7 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="chart-container-card">
                  <h3 className="chart-card-title">Busiest Weekday Circulation</h3>
                  <div style={{ width: '100%', height: 260 }}>
                    <ResponsiveContainer>
                      <BarChart data={data?.weekday_data || []}>
                        <XAxis dataKey="day" stroke="var(--text-muted)" />
                        <YAxis stroke="var(--text-muted)" />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'var(--bg-card)',
                            borderColor: 'var(--border-subtle)',
                            borderRadius: '8px',
                            color: 'var(--text-main)',
                          }}
                        />
                        <Bar dataKey="count" fill="#818cf8" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Second Row: Category Pie Chart & Most Borrowed Books */}
              <div className="analytics-charts-grid" style={{ marginTop: '1.5rem' }}>
                <div className="chart-container-card">
                  <h3 className="chart-card-title">Category-Wise Book Demand</h3>
                  <div style={{ width: '100%', height: 260 }}>
                    <ResponsiveContainer>
                      <PieChart>
                        <Pie
                          data={data?.category_data || []}
                          cx="50%"
                          cy="50%"
                          innerRadius={55}
                          outerRadius={85}
                          paddingAngle={4}
                          dataKey="value"
                        >
                          {(data?.category_data || []).map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={PIE_COLORS[index % PIE_COLORS.length]}
                            />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'var(--bg-card)',
                            borderColor: 'var(--border-subtle)',
                            borderRadius: '8px',
                            color: 'var(--text-main)',
                          }}
                        />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="chart-container-card">
                  <h3 className="chart-card-title">Top 10 Most Borrowed Textbooks</h3>
                  <div className="table-responsive" style={{ maxHeight: '260px' }}>
                    <table className="modern-table">
                      <thead>
                        <tr>
                          <th>Rank</th>
                          <th>Textbook Title</th>
                          <th>Times Borrowed</th>
                          <th>In Stock</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(data?.most_borrowed || []).map((b, idx) => (
                          <tr key={b.id}>
                            <td>
                              <span className={`rank-badge ${idx < 3 ? 'rank-1' : ''}`}>
                                #{idx + 1}
                              </span>
                            </td>
                            <td style={{ fontWeight: 600 }}>{b.title}</td>
                            <td>
                              <span className="points-val-highlight">{b.borrow_count} times</span>
                            </td>
                            <td>{b.available} copies</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
