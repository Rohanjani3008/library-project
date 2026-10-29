import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import StudentBottomNav from '../../components/StudentBottomNav';
import { useToast } from '../../context/ToastContext';
import api from '../../api/client';

export default function MyBooks() {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({ issues: [], reservations: [], active_count: 0 });
  const [filter, setFilter] = useState('active'); // 'active', 'reserved', 'history'

  const fetchMyBooks = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/my-books/');
      setData(res.data);
    } catch {
      showToast('Failed to load your circulation records', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyBooks();
  }, []);

  const activeIssues = data.issues.filter(
    (i) => i.status === 'issued' || i.status === 'overdue'
  );
  const returnedIssues = data.issues.filter((i) => i.status === 'returned');

  const getDaysLeftBadge = (issue) => {
    if (issue.status === 'returned') {
      return <span className="status-badge badge-success">Returned</span>;
    }
    if (issue.is_overdue || issue.status === 'overdue' || issue.days_left < 0) {
      const days = Math.abs(issue.days_left || 0);
      return (
        <span className="status-badge badge-danger">
          Overdue by {days} {days === 1 ? 'day' : 'days'}
        </span>
      );
    }
    if (issue.days_left === 0) {
      return <span className="status-badge badge-warning">Due Today!</span>;
    }
    return (
      <span className="status-badge badge-info">
        {issue.days_left} {issue.days_left === 1 ? 'day' : 'days'} left
      </span>
    );
  };

  return (
    <div className="dashboard-layout with-bottom-nav">
      <Navbar />

      <main className="dashboard-content">
        <div className="page-header">
          <div>
            <h1 className="page-title">My Borrowed Books &amp; Reservations</h1>
            <p className="page-subtitle">
              Track your borrowed titles, upcoming due dates, fines, and reservation queue status.
            </p>
          </div>

          <div className="loan-quota-pill">
            <span className="quota-number">{activeIssues.length} / 3</span>
            <span className="quota-text">Books Borrowed</span>
          </div>
        </div>

        {/* Tab Filters */}
        <div className="tab-pills-row">
          <button
            className={`tab-pill-btn ${filter === 'active' ? 'active' : ''}`}
            onClick={() => setFilter('active')}
          >
            Active Checkouts ({activeIssues.length})
          </button>
          <button
            className={`tab-pill-btn ${filter === 'reserved' ? 'active' : ''}`}
            onClick={() => setFilter('reserved')}
          >
            Reservations ({data.reservations.length})
          </button>
          <button
            className={`tab-pill-btn ${filter === 'history' ? 'active' : ''}`}
            onClick={() => setFilter('history')}
          >
            Returned History ({returnedIssues.length})
          </button>
        </div>

        {loading ? (
          <div className="cards-grid">
            {[1, 2, 3].map((n) => (
              <div key={n} className="book-card skeleton-card">
                <div className="skeleton-thumb" />
                <div className="skeleton-line" />
                <div className="skeleton-line short" />
              </div>
            ))}
          </div>
        ) : (
          <>
            {/* Active Loans */}
            {filter === 'active' && (
              <div>
                {activeIssues.length === 0 ? (
                  <div className="empty-state-card">
                    <div className="empty-icon">
                      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
                        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
                      </svg>
                    </div>
                    <h3>No Active Borrowed Books</h3>
                    <p>You do not currently have any books issued to your account. Browse your semester syllabus to borrow books!</p>
                    <Link to="/student" className="btn btn-primary btn-sm">
                      Browse Syllabus Books
                    </Link>
                  </div>
                ) : (
                  <div className="cards-grid">
                    {activeIssues.map((issue) => (
                      <div key={issue.id} className="circulation-item-card">
                        <div className="card-top-row">
                          <span className="book-code-badge">{issue.book?.book_code || 'LIB-BK'}</span>
                          {getDaysLeftBadge(issue)}
                        </div>

                        <div className="circ-book-details">
                          <h3 className="circ-book-title">
                            <Link to={`/books/${issue.book?.id}`}>
                              {issue.book?.title}
                            </Link>
                          </h3>
                          <p className="circ-book-author">By {issue.book?.author}</p>
                        </div>

                        <div className="circ-meta-grid">
                          <div className="circ-meta-cell">
                            <span className="cell-label">Issue Date</span>
                            <span className="cell-value">{issue.issue_date}</span>
                          </div>
                          <div className="circ-meta-cell">
                            <span className="cell-label">Due Date</span>
                            <span className="cell-value" style={{ fontWeight: 600 }}>{issue.due_date}</span>
                          </div>
                          <div className="circ-meta-cell">
                            <span className="cell-label">Late Fine</span>
                            <span className="cell-value fine-val">
                              {Number(issue.fine_amount) > 0 ? `Rs ${issue.fine_amount}` : 'Rs 0'}
                            </span>
                          </div>
                          <div className="circ-meta-cell">
                            <span className="cell-label">Status</span>
                            <span className="cell-value" style={{ textTransform: 'capitalize' }}>
                              {issue.status}
                            </span>
                          </div>
                        </div>

                        <div className="circ-card-actions">
                          <Link to={`/books/${issue.book?.id}`} className="btn btn-outline btn-block btn-sm">
                            View Book Details
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Reservations Queue */}
            {filter === 'reserved' && (
              <div>
                {data.reservations.length === 0 ? (
                  <div className="empty-state-card">
                    <div className="empty-icon">
                      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <circle cx="12" cy="12" r="10"/>
                        <polyline points="12 6 12 12 16 14"/>
                      </svg>
                    </div>
                    <h3>No Active Reservations</h3>
                    <p>When books are fully borrowed (0 copies available), you can join the reservation queue from the book details page.</p>
                  </div>
                ) : (
                  <div className="cards-grid">
                    {data.reservations.map((res) => (
                      <div key={res.id} className={`circulation-item-card ${res.status === 'ready' ? 'reservation-ready-border' : ''}`}>
                        <div className="card-top-row">
                          <span className="book-code-badge">{res.book?.book_code || 'LIB-BK'}</span>
                          {res.status === 'ready' ? (
                            <span className="status-badge badge-success pulse-anim">
                              READY FOR PICKUP
                            </span>
                          ) : (
                            <span className="status-badge badge-warning">
                              Queue Position: #{res.queue_position || 1}
                            </span>
                          )}
                        </div>

                        <div className="circ-book-details">
                          <h3 className="circ-book-title">
                            <Link to={`/books/${res.book?.id}`}>{res.book?.title}</Link>
                          </h3>
                          <p className="circ-book-author">By {res.book?.author}</p>
                        </div>

                        <div className="reservation-status-box">
                          {res.status === 'ready' ? (
                            <p className="ready-alert-text">
                              A copy has been returned and reserved for you! Please visit the library circulation desk to collect your book.
                            </p>
                          ) : (
                            <p className="waiting-alert-text">
                              Your request is in queue. As soon as a student returns a copy, your status will update to "Ready for Pickup".
                            </p>
                          )}
                          <div className="text-muted text-xs">
                            Requested on: {new Date(res.created_at).toLocaleDateString()}
                          </div>
                        </div>

                        <div className="circ-card-actions">
                          <Link to={`/books/${res.book?.id}`} className="btn btn-outline btn-block btn-sm">
                            Inspect Book
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* History */}
            {filter === 'history' && (
              <div>
                {returnedIssues.length === 0 ? (
                  <div className="empty-state-card">
                    <div className="empty-icon">
                      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                    </div>
                    <h3>No Return History Yet</h3>
                    <p>Past returned books and cleared fines will appear here for your records.</p>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="modern-table">
                      <thead>
                        <tr>
                          <th>Book Code</th>
                          <th>Book Title</th>
                          <th>Issue Date</th>
                          <th>Due Date</th>
                          <th>Return Date</th>
                          <th>Fine Paid</th>
                        </tr>
                      </thead>
                      <tbody>
                        {returnedIssues.map((issue) => (
                          <tr key={issue.id}>
                            <td><code>{issue.book?.book_code}</code></td>
                            <td>
                              <Link to={`/books/${issue.book?.id}`} className="table-link">
                                {issue.book?.title}
                              </Link>
                            </td>
                            <td>{issue.issue_date}</td>
                            <td>{issue.due_date}</td>
                            <td>{issue.return_date || '-'}</td>
                            <td>{Number(issue.fine_amount) > 0 ? `Rs ${issue.fine_amount}` : 'Rs 0'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
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
