import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import LibrarianSidebar from '../../components/LibrarianSidebar';
import { useToast } from '../../context/ToastContext';
import api from '../../api/client';

export default function LibrarianOverdue() {
  const { showToast } = useToast();
  const [overdues, setOverdues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchOverdue = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/overdue/');
      setOverdues(res.data || []);
    } catch {
      showToast('Could not load overdue books', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverdue();
  }, []);

  const filtered = overdues.filter((item) => {
    const q = search.toLowerCase();
    return (
      item.user_enrollment?.toLowerCase().includes(q) ||
      item.user_username?.toLowerCase().includes(q) ||
      item.book?.title?.toLowerCase().includes(q) ||
      item.book?.book_code?.toLowerCase().includes(q)
    );
  });

  const totalOverdueFines = overdues.reduce(
    (sum, i) => sum + Number(i.fine_amount || 0),
    0
  );

  return (
    <div className="dashboard-layout">
      <Navbar />

      <div className="layout-with-sidebar">
        <LibrarianSidebar />

        <main className="dashboard-content">
          <div className="page-header">
            <div>
              <h1 className="page-title">Overdue Textbooks &amp; Fine Ledger</h1>
              <p className="page-subtitle">
                Track unreturned books beyond the 14-day loan period and collect overdue penalties.
              </p>
            </div>

            <div className="stat-pill-group">
              <div className="loan-quota-pill">
                <span className="quota-number">{overdues.length}</span>
                <span className="quota-text">Overdue Checkouts</span>
              </div>
              <div className="loan-quota-pill" style={{ borderColor: 'rgba(239, 68, 68, 0.4)' }}>
                <span className="quota-number fine-val">Rs {totalOverdueFines}</span>
                <span className="quota-text">Pending Fines</span>
              </div>
            </div>
          </div>

          <div className="filter-bar">
            <input
              type="text"
              className="search-input"
              placeholder="Filter by Student Enrollment, Name, or Book Code..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button onClick={fetchOverdue} className="btn btn-outline btn-sm">
              Refresh Overdues
            </button>
          </div>

          {loading ? (
            <div className="skeleton-card" style={{ height: '300px' }} />
          ) : filtered.length === 0 ? (
            <div className="empty-state-card">
              <div className="empty-icon">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              </div>
              <h3>No Overdue Textbooks</h3>
              <p>All active library checkouts are currently within their 14-day borrowing loan window.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="modern-table">
                <thead>
                  <tr>
                    <th>Student Info</th>
                    <th>Book Details</th>
                    <th>Issue Date</th>
                    <th>Due Date</th>
                    <th>Days Overdue</th>
                    <th>Fine Accrued</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((item) => {
                    const daysOver = Math.abs(item.days_left || 0);

                    return (
                      <tr key={item.id} className="overdue-table-row">
                        <td>
                          <div style={{ fontWeight: 600 }}>
                            {item.user_full_name || item.user_username}
                          </div>
                          <div className="text-muted text-xs">
                            Enrollment: <code>{item.user_enrollment || item.user_username}</code>
                          </div>
                        </td>
                        <td>
                          <div>
                            <Link to={`/books/${item.book?.id}`} className="table-link">
                              {item.book?.title}
                            </Link>
                          </div>
                          <div className="text-muted text-xs">
                            Code: <code>{item.book?.book_code}</code> | ISBN: {item.book?.isbn}
                          </div>
                        </td>
                        <td>{item.issue_date}</td>
                        <td style={{ fontWeight: 600, color: 'var(--accent-crimson)' }}>
                          {item.due_date}
                        </td>
                        <td>
                          <span className="status-badge badge-danger">
                            {daysOver} {daysOver === 1 ? 'day' : 'days'}
                          </span>
                        </td>
                        <td>
                          <span className="fine-val" style={{ fontWeight: 700 }}>
                            Rs {item.fine_amount}
                          </span>
                        </td>
                        <td>
                          <Link
                            to="/librarian/circulation"
                            className="btn btn-warning btn-xs"
                          >
                            Return Book
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
