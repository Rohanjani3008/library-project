import { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import LibrarianSidebar from '../../components/LibrarianSidebar';
import { useToast } from '../../context/ToastContext';
import api from '../../api/client';

export default function LibrarianModeration() {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState('notes'); // 'notes' or 'requests'

  // Senior Notes
  const [notes, setNotes] = useState([]);
  const [loadingNotes, setLoadingNotes] = useState(true);

  // Book Requests
  const [requests, setRequests] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(true);
  const [rejectingId, setRejectingId] = useState(null);
  const [librarianNoteText, setLibrarianNoteText] = useState('');

  useEffect(() => {
    fetchPendingNotes();
    fetchBookRequests();
  }, []);

  const fetchPendingNotes = async () => {
    try {
      setLoadingNotes(true);
      const res = await api.get('/api/community/senior-notes/', { params: { all: '1' } });
      setNotes(res.data);
    } catch {
      showToast('Could not load senior study notes', 'error');
    } finally {
      setLoadingNotes(false);
    }
  };

  const fetchBookRequests = async () => {
    try {
      setLoadingRequests(true);
      const res = await api.get('/api/community/book-requests/');
      setRequests(res.data);
    } catch {
      showToast('Could not load book requests', 'error');
    } finally {
      setLoadingRequests(false);
    }
  };

  const handleModerateNote = async (id, approved) => {
    try {
      await api.patch(`/api/community/senior-notes/${id}/moderate/`, { approved });
      showToast(`Note ${approved ? 'approved' : 'rejected'} successfully`, 'success');
      fetchPendingNotes();
    } catch {
      showToast('Failed to moderate note', 'error');
    }
  };

  const handleModerateRequest = async (id, status, librarian_note = '') => {
    try {
      await api.patch(`/api/community/book-requests/${id}/moderate/`, {
        status,
        librarian_note,
      });
      showToast(`Book request ${status} successfully`, 'success');
      setRejectingId(null);
      setLibrarianNoteText('');
      fetchBookRequests();
    } catch {
      showToast('Failed to update book request status', 'error');
    }
  };

  return (
    <div className="dashboard-layout">
      <Navbar />

      <div className="layout-with-sidebar">
        <LibrarianSidebar />

        <main className="dashboard-content">
          <div className="page-header">
            <div>
              <h1 className="page-title">Moderation &amp; Acquisition Requests</h1>
              <p className="page-subtitle">
                Review peer notes submitted by seniors and student textbook procurement requests.
              </p>
            </div>

            <div className="tab-pills-row">
              <button
                className={`tab-pill-btn ${activeTab === 'notes' ? 'active' : ''}`}
                onClick={() => setActiveTab('notes')}
              >
                Senior Study Notes ({notes.filter((n) => !n.approved).length} Pending)
              </button>
              <button
                className={`tab-pill-btn ${activeTab === 'requests' ? 'active' : ''}`}
                onClick={() => setActiveTab('requests')}
              >
                Book Requests ({requests.filter((r) => r.status === 'pending').length} Pending)
              </button>
            </div>
          </div>

          {/* TAB 1: SENIOR NOTES MODERATION */}
          {activeTab === 'notes' && (
            <div>
              {loadingNotes ? (
                <div className="skeleton-card" style={{ height: '240px' }} />
              ) : notes.length === 0 ? (
                <div className="empty-state-card">
                  <h3>No Notes to Moderate</h3>
                  <p>All student advice and notes have been reviewed.</p>
                </div>
              ) : (
                <div className="cards-grid">
                  {notes.map((note) => (
                    <div key={note.id} className="senior-note-card">
                      <div className="note-card-header">
                        <span className="note-subject-pill">
                          {note.subject_name || 'General Academic'}
                        </span>
                        <span className={`status-badge ${note.approved ? 'badge-success' : 'badge-warning'}`}>
                          {note.approved ? 'Approved' : 'Pending Approval'}
                        </span>
                      </div>

                      <h3 className="note-title">{note.title}</h3>
                      <p className="note-tip">{note.tip}</p>

                      {note.link && (
                        <a
                          href={note.link}
                          target="_blank"
                          rel="noreferrer"
                          className="note-link-tag"
                        >
                          External Link: {note.link}
                        </a>
                      )}

                      <div className="note-footer" style={{ marginBottom: '1rem' }}>
                        <span>Author: {note.user_name || 'Student'}</span>
                        <span>{new Date(note.created_at).toLocaleDateString()}</span>
                      </div>

                      <div className="confirm-actions-row">
                        {!note.approved ? (
                          <>
                            <button
                              onClick={() => handleModerateNote(note.id, false)}
                              className="btn btn-danger-outline btn-xs"
                            >
                              Reject Note
                            </button>
                            <button
                              onClick={() => handleModerateNote(note.id, true)}
                              className="btn btn-primary btn-xs"
                            >
                              Approve &amp; Publish
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => handleModerateNote(note.id, false)}
                            className="btn btn-outline btn-xs"
                          >
                            Unpublish / Revoke
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: BOOK REQUESTS MODERATION */}
          {activeTab === 'requests' && (
            <div>
              {loadingRequests ? (
                <div className="skeleton-card" style={{ height: '240px' }} />
              ) : requests.length === 0 ? (
                <div className="empty-state-card">
                  <h3>No Acquisition Requests</h3>
                  <p>Students have not submitted any book acquisition requests yet.</p>
                </div>
              ) : (
                <div className="requests-stack">
                  {requests.map((req) => (
                    <div key={req.id} className="request-item-card">
                      <div className="card-top-row">
                        <div>
                          <h3 className="req-book-title">{req.title}</h3>
                          {req.author && <span className="req-book-author">by {req.author}</span>}
                        </div>
                        <span
                          className={`status-badge ${
                            req.status === 'approved'
                              ? 'badge-success'
                              : req.status === 'rejected'
                              ? 'badge-danger'
                              : 'badge-warning'
                          }`}
                        >
                          {req.status?.toUpperCase()}
                        </span>
                      </div>

                      {req.reason && <p className="req-reason">"{req.reason}"</p>}

                      <div className="req-date">
                        Submitted by: <strong>{req.user_name || 'Student'}</strong> on{' '}
                        {new Date(req.created_at).toLocaleDateString()}
                      </div>

                      {req.librarian_note && (
                        <div className="librarian-note-box">
                          <span className="note-label">Staff Note:</span>
                          <span className="note-content">{req.librarian_note}</span>
                        </div>
                      )}

                      {/* Action buttons */}
                      {req.status === 'pending' && (
                        <div className="confirm-actions-row" style={{ marginTop: '1rem' }}>
                          <button
                            onClick={() =>
                              handleModerateRequest(req.id, 'approved', 'Approved for acquisition in next cycle.')
                            }
                            className="btn btn-primary btn-xs"
                          >
                            Approve Purchase
                          </button>
                          <button
                            onClick={() => setRejectingId(req.id)}
                            className="btn btn-danger-outline btn-xs"
                          >
                            Decline Request
                          </button>
                        </div>
                      )}

                      {rejectingId === req.id && (
                        <div className="reject-input-group" style={{ marginTop: '0.75rem' }}>
                          <input
                            type="text"
                            className="form-input"
                            placeholder="Reason for declining (e.g. Edition already available)..."
                            value={librarianNoteText}
                            onChange={(e) => setLibrarianNoteText(e.target.value)}
                          />
                          <button
                            className="btn btn-danger btn-xs"
                            onClick={() => handleModerateRequest(req.id, 'rejected', librarianNoteText)}
                          >
                            Confirm Decline
                          </button>
                          <button
                            className="btn btn-outline btn-xs"
                            onClick={() => setRejectingId(null)}
                          >
                            Cancel
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
