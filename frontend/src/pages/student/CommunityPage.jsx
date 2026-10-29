import { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import StudentBottomNav from '../../components/StudentBottomNav';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import api from '../../api/client';

export default function CommunityPage() {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState('senior-notes'); // 'senior-notes', 'request-book'
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('');

  // Senior Notes State
  const [notes, setNotes] = useState([]);
  const [loadingNotes, setLoadingNotes] = useState(true);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [newNote, setNewNote] = useState({ subject: '', title: '', tip: '', link: '' });
  const [submittingNote, setSubmittingNote] = useState(false);

  // Book Requests State
  const [bookRequests, setBookRequests] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(true);
  const [newRequest, setNewRequest] = useState({ title: '', author: '', reason: '' });
  const [submittingRequest, setSubmittingRequest] = useState(false);

  useEffect(() => {
    // Load subjects for filter
    api.get('/api/academics/subjects/')
      .then((res) => setSubjects(res.data))
      .catch(() => {});

    fetchSeniorNotes();
    fetchBookRequests();
  }, []);

  const fetchSeniorNotes = async (subjectId = '') => {
    try {
      setLoadingNotes(true);
      const params = {};
      if (subjectId) params.subject = subjectId;
      else if (user?.semester) params.semester = user.semester;

      const res = await api.get('/api/community/senior-notes/', { params });
      setNotes(res.data);
    } catch {
      showToast('Could not load senior notes', 'error');
    } finally {
      setLoadingNotes(false);
    }
  };

  const fetchBookRequests = async () => {
    try {
      setLoadingRequests(true);
      const res = await api.get('/api/community/book-requests/');
      setBookRequests(res.data);
    } catch {
      showToast('Could not load book requests', 'error');
    } finally {
      setLoadingRequests(false);
    }
  };

  const handleSubjectFilter = (subId) => {
    setSelectedSubject(subId);
    fetchSeniorNotes(subId);
  };

  const handleLikeNote = async (noteId) => {
    try {
      const res = await api.post(`/api/community/senior-notes/${noteId}/like/`);
      setNotes((prev) =>
        prev.map((n) => (n.id === noteId ? { ...n, likes: res.data.likes } : n))
      );
    } catch {
      showToast('Failed to like note', 'error');
    }
  };

  const handleCreateNote = async (e) => {
    e.preventDefault();
    if (!newNote.title.trim() || !newNote.tip.trim()) {
      showToast('Please fill out the note title and advice', 'warning');
      return;
    }
    try {
      setSubmittingNote(true);
      const res = await api.post('/api/community/senior-notes/', newNote);
      showToast(res.data.message || 'Note submitted for review', 'success');
      setShowNoteModal(false);
      setNewNote({ subject: '', title: '', tip: '', link: '' });
      fetchSeniorNotes(selectedSubject);
    } catch (err) {
      showToast(err.response?.data?.error || 'Failed to submit study note', 'error');
    } finally {
      setSubmittingNote(false);
    }
  };

  const handleCreateBookRequest = async (e) => {
    e.preventDefault();
    if (!newRequest.title.trim()) {
      showToast('Please enter the book title', 'warning');
      return;
    }
    try {
      setSubmittingRequest(true);
      const res = await api.post('/api/community/book-requests/', newRequest);
      showToast(res.data.message || 'Book request submitted to library staff', 'success');
      setNewRequest({ title: '', author: '', reason: '' });
      fetchBookRequests();
    } catch (err) {
      showToast(err.response?.data?.error || 'Failed to submit request', 'error');
    } finally {
      setSubmittingRequest(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved':
        return <span className="status-badge badge-success">Approved for Purchase</span>;
      case 'rejected':
        return <span className="status-badge badge-danger">Declined</span>;
      default:
        return <span className="status-badge badge-warning">Under Review</span>;
    }
  };

  return (
    <div className="dashboard-layout with-bottom-nav">
      <Navbar />

      <main className="dashboard-content">
        <div className="page-header">
          <div>
            <h1 className="page-title">Community &amp; Student Insights</h1>
            <p className="page-subtitle">
              Seniors' study guides, curated exam tips, and textbook procurement requests.
            </p>
          </div>

          <div className="tab-pills-row">
            <button
              className={`tab-pill-btn ${activeTab === 'senior-notes' ? 'active' : ''}`}
              onClick={() => setActiveTab('senior-notes')}
            >
              Senior's Corner
            </button>
            <button
              className={`tab-pill-btn ${activeTab === 'request-book' ? 'active' : ''}`}
              onClick={() => setActiveTab('request-book')}
            >
              Request a Book ({bookRequests.length})
            </button>
          </div>
        </div>

        {/* TAB 1: SENIOR'S CORNER */}
        {activeTab === 'senior-notes' && (
          <div>
            <div className="community-actions-bar">
              <div className="filter-select-wrapper">
                <label className="filter-label">Filter by Subject:</label>
                <select
                  value={selectedSubject}
                  onChange={(e) => handleSubjectFilter(e.target.value)}
                  className="filter-select"
                >
                  <option value="">All Relevant Subjects</option>
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.code} - {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={() => setShowNoteModal(true)}
                className="btn btn-primary btn-sm"
              >
                + Post Study Tip
              </button>
            </div>

            {loadingNotes ? (
              <div className="cards-grid">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="feature-card skeleton-card">
                    <div className="skeleton-line" />
                    <div className="skeleton-line short" />
                  </div>
                ))}
              </div>
            ) : notes.length === 0 ? (
              <div className="empty-state-card">
                <h3>No Senior Notes Yet</h3>
                <p>Be the first senior to share exam strategy tips, reference links, and formulas!</p>
                <button
                  onClick={() => setShowNoteModal(true)}
                  className="btn btn-primary btn-sm"
                >
                  Post First Tip
                </button>
              </div>
            ) : (
              <div className="cards-grid">
                {notes.map((note) => (
                  <div key={note.id} className="senior-note-card">
                    <div className="note-card-header">
                      <span className="note-subject-pill">
                        {note.subject_name || 'General Academic'}
                      </span>
                      <button
                        onClick={() => handleLikeNote(note.id)}
                        className="like-btn"
                        title="Helpful tip"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/>
                        </svg>
                        <span>{note.likes}</span>
                      </button>
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
                        View External Resource
                      </a>
                    )}

                    <div className="note-footer">
                      <span className="note-author">By {note.user_name || 'Senior Student'}</span>
                      <span className="note-date">
                        {new Date(note.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Post Study Tip Modal */}
            {showNoteModal && (
              <div className="modal-backdrop" onClick={() => setShowNoteModal(false)}>
                <div className="modal-container" onClick={(e) => e.stopPropagation()}>
                  <div className="modal-header">
                    <h3>Share Senior Study Tip</h3>
                    <button className="btn-close-modal" onClick={() => setShowNoteModal(false)}>x</button>
                  </div>

                  <form onSubmit={handleCreateNote} className="modal-form">
                    <div className="form-group">
                      <label className="form-label">Subject</label>
                      <select
                        value={newNote.subject}
                        onChange={(e) => setNewNote({ ...newNote, subject: e.target.value })}
                        className="form-input"
                      >
                        <option value="">Select Curriculum Subject (Optional)</option>
                        {subjects.map((s) => (
                          <option key={s.id} value={s.id}>{s.code} - {s.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Tip Title *</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="e.g. Key pointers to score in Unit 3"
                        value={newNote.title}
                        onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Advice / Exam Strategy *</label>
                      <textarea
                        className="form-textarea"
                        rows="4"
                        placeholder="Share high-yield questions, revision methods, or warnings about tricky topics..."
                        value={newNote.tip}
                        onChange={(e) => setNewNote({ ...newNote, tip: e.target.value })}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Reference Link (Optional)</label>
                      <input
                        type="url"
                        className="form-input"
                        placeholder="https://..."
                        value={newNote.link}
                        onChange={(e) => setNewNote({ ...newNote, link: e.target.value })}
                      />
                    </div>

                    <div className="modal-actions">
                      <button
                        type="button"
                        onClick={() => setShowNoteModal(false)}
                        className="btn btn-outline"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={submittingNote}
                        className="btn btn-primary"
                      >
                        {submittingNote ? 'Submitting...' : 'Post for Review'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: REQUEST A BOOK */}
        {activeTab === 'request-book' && (
          <div className="book-requests-layout">
            <div className="request-form-card">
              <h2 className="section-title-sm">Submit New Book Acquisition Request</h2>
              <p className="text-muted text-sm" style={{ marginBottom: '1.25rem' }}>
                If an essential textbook is not in the library collection, tell us and our librarian will review it.
              </p>

              <form onSubmit={handleCreateBookRequest}>
                <div className="form-group">
                  <label className="form-label">Book Title *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Design Patterns: Elements of Reusable Object-Oriented Software"
                    value={newRequest.title}
                    onChange={(e) => setNewRequest({ ...newRequest, title: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Author / Publisher</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Erich Gamma, Richard Helm"
                    value={newRequest.author}
                    onChange={(e) => setNewRequest({ ...newRequest, author: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Reason / Academic Purpose</label>
                  <textarea
                    className="form-textarea"
                    rows="3"
                    placeholder="e.g. Needed for Semester 5 Advanced Software Engineering project..."
                    value={newRequest.reason}
                    onChange={(e) => setNewRequest({ ...newRequest, reason: e.target.value })}
                  />
                </div>

                <button
                  type="submit"
                  disabled={submittingRequest}
                  className="btn btn-primary btn-block"
                >
                  {submittingRequest ? 'Submitting...' : 'Send Request to Librarian'}
                </button>
              </form>
            </div>

            <div className="request-status-list">
              <h2 className="section-title-sm">My Book Requests ({bookRequests.length})</h2>

              {loadingRequests ? (
                <div className="skeleton-card" style={{ height: '160px' }} />
              ) : bookRequests.length === 0 ? (
                <div className="empty-state-card">
                  <p>You haven't requested any new books yet.</p>
                </div>
              ) : (
                <div className="requests-stack">
                  {bookRequests.map((req) => (
                    <div key={req.id} className="request-item-card">
                      <div className="card-top-row">
                        <span className="req-book-title">{req.title}</span>
                        {getStatusBadge(req.status)}
                      </div>

                      {req.author && (
                        <p className="req-book-author">Author: {req.author}</p>
                      )}

                      {req.reason && (
                        <p className="req-reason">"{req.reason}"</p>
                      )}

                      {req.librarian_note && (
                        <div className="librarian-note-box">
                          <span className="note-label">Librarian Response:</span>
                          <span className="note-content">{req.librarian_note}</span>
                        </div>
                      )}

                      <div className="req-date">
                        Submitted: {new Date(req.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      <StudentBottomNav />
    </div>
  );
}
