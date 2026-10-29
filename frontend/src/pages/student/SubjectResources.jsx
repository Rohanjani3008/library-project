import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import StudentBottomNav from '../../components/StudentBottomNav';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import api from '../../api/client';

export default function SubjectResources() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();

  const [subjects, setSubjects] = useState([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState(
    searchParams.get('subject') || ''
  );
  const [activeTab, setActiveTab] = useState('videos'); // 'books', 'ebooks', 'videos'

  const [books, setBooks] = useState([]);
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(false);
  const [previewPdfUrl, setPreviewPdfUrl] = useState(null);
  const [certificateLoading, setCertificateLoading] = useState(false);

  // Fetch subjects for student's semester/course
  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const params = {};
        if (user?.semester) params.semester = user.semester;
        if (user?.course) params.course = user.course;
        const res = await api.get('/api/academics/subjects/', { params });
        setSubjects(res.data);
        if (res.data.length > 0 && !selectedSubjectId) {
          setSelectedSubjectId(String(res.data[0].id));
        }
      } catch {
        showToast('Could not load subjects', 'error');
      }
    };
    fetchSubjects();
  }, [user]);

  // When selected subject changes, load books and resources
  useEffect(() => {
    if (!selectedSubjectId) return;
    setSearchParams({ subject: selectedSubjectId });

    const loadData = async () => {
      setLoading(true);
      try {
        const [booksRes, resRes] = await Promise.all([
          api.get('/api/books/', { params: { subject: selectedSubjectId } }),
          api.get('/api/resources/', { params: { subject: selectedSubjectId } }),
        ]);
        setBooks(booksRes.data.results || booksRes.data || []);
        setResources(resRes.data || []);
      } catch {
        showToast('Error loading subject materials', 'error');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [selectedSubjectId]);

  const handleBookmarkToggle = async (resourceId) => {
    try {
      const res = await api.post(`/api/resources/${resourceId}/bookmark/`);
      showToast(res.data.message || 'Bookmark updated', 'success');
      // Update local bookmark state
      setResources((prev) =>
        prev.map((r) =>
          r.id === resourceId ? { ...r, is_bookmarked: res.data.bookmarked } : r
        )
      );
    } catch {
      showToast('Failed to update bookmark', 'error');
    }
  };

  const handleDownloadCertificate = async () => {
    if (!selectedSubjectId) return;
    try {
      setCertificateLoading(true);
      const token = localStorage.getItem('access_token');
      const response = await fetch(
        `http://localhost:8000/api/gamification/certificate/${selectedSubjectId}/`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        throw new Error(errJson.error || 'Failed to generate certificate');
      }
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `Certificate_Subject_${selectedSubjectId}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      showToast('Certificate generated successfully!', 'success');
    } catch (err) {
      showToast(err.message || 'Complete all video lectures to earn certificate', 'warning');
    } finally {
      setCertificateLoading(false);
    }
  };

  const currentSubject = subjects.find((s) => String(s.id) === String(selectedSubjectId));
  const ebookResources = resources.filter((r) => r.type === 'ebook' || r.type === 'notes');
  const videoResources = resources.filter((r) => r.type === 'video');

  return (
    <div className="dashboard-layout with-bottom-nav">
      <Navbar />

      <main className="dashboard-content">
        <div className="page-header">
          <div>
            <h1 className="page-title">Digital Learning Hub</h1>
            <p className="page-subtitle">
              Interactive video lectures, syllabus e-books, lecture slides, and physical library textbooks.
            </p>
          </div>

          <button
            onClick={handleDownloadCertificate}
            disabled={certificateLoading}
            className="btn btn-primary btn-sm"
            title="Download verified completion certificate"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '6px' }}>
              <path d="M12 15l-2 5l9-9l-9-9l2 5l-7 4z" />
            </svg>
            {certificateLoading ? 'Generating...' : 'Earn Subject Certificate'}
          </button>
        </div>

        {/* Subject Selector Bar */}
        <div className="subject-pills-scroll">
          {subjects.map((sub) => (
            <button
              key={sub.id}
              className={`subject-pill-btn ${String(sub.id) === String(selectedSubjectId) ? 'active' : ''}`}
              onClick={() => setSelectedSubjectId(String(sub.id))}
            >
              <span className="sub-code">{sub.code}</span>
              <span className="sub-name">{sub.name}</span>
            </button>
          ))}
        </div>

        {/* 3 Material Tabs: Books | E-books | Videos */}
        <div className="tab-pills-row" style={{ marginTop: '1.5rem' }}>
          <button
            className={`tab-pill-btn ${activeTab === 'videos' ? 'active' : ''}`}
            onClick={() => setActiveTab('videos')}
          >
            Video Lectures ({videoResources.length})
          </button>
          <button
            className={`tab-pill-btn ${activeTab === 'ebooks' ? 'active' : ''}`}
            onClick={() => setActiveTab('ebooks')}
          >
            E-Books &amp; Notes ({ebookResources.length})
          </button>
          <button
            className={`tab-pill-btn ${activeTab === 'books' ? 'active' : ''}`}
            onClick={() => setActiveTab('books')}
          >
            Physical Textbooks ({books.length})
          </button>
        </div>

        {loading ? (
          <div className="cards-grid">
            {[1, 2, 3].map((n) => (
              <div key={n} className="book-card skeleton-card">
                <div className="skeleton-thumb" />
                <div className="skeleton-line" />
              </div>
            ))}
          </div>
        ) : (
          <>
            {/* TAB 1: VIDEOS */}
            {activeTab === 'videos' && (
              <div>
                {videoResources.length === 0 ? (
                  <div className="empty-state-card">
                    <h3>No Video Lectures Available</h3>
                    <p>No video modules have been uploaded yet for {currentSubject?.name || 'this subject'}.</p>
                  </div>
                ) : (
                  <div className="cards-grid">
                    {videoResources.map((vid) => (
                      <div key={vid.id} className="resource-video-card">
                        <div className="video-thumb-container">
                          <img
                            src={
                              vid.thumbnail ||
                              'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=500&auto=format&fit=crop&q=60'
                            }
                            alt={vid.title}
                            className="video-thumb-img"
                            loading="lazy"
                          />
                          <Link to={`/student/videos/${vid.id}`} className="play-overlay-btn" aria-label="Play video">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                              <polygon points="5 3 19 12 5 21 5 3"/>
                            </svg>
                          </Link>
                          {vid.progress?.completed && (
                            <span className="video-completed-badge">Completed</span>
                          )}
                        </div>

                        <div className="video-card-body">
                          <div className="card-top-row">
                            <span className="badge-tag">Lecture</span>
                            <button
                              onClick={() => handleBookmarkToggle(vid.id)}
                              className={`bookmark-btn ${vid.is_bookmarked ? 'bookmarked' : ''}`}
                              title={vid.is_bookmarked ? 'Remove bookmark' : 'Bookmark resource'}
                            >
                              <svg width="18" height="18" viewBox="0 0 24 24" fill={vid.is_bookmarked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
                                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
                              </svg>
                            </button>
                          </div>

                          <h3 className="resource-title">
                            <Link to={`/student/videos/${vid.id}`}>{vid.title}</Link>
                          </h3>
                          <p className="resource-desc">{vid.description || 'Curated video lecture with knowledge check quiz.'}</p>

                          {/* Progress bar */}
                          <div className="progress-bar-track">
                            <div
                              className="progress-bar-fill"
                              style={{ width: `${vid.progress?.watched_percent || 0}%` }}
                            />
                          </div>
                          <div className="progress-labels">
                            <span>{vid.progress?.watched_percent || 0}% watched</span>
                            {vid.quiz && <span className="quiz-avail-pill">Quiz Included</span>}
                          </div>

                          <Link to={`/student/videos/${vid.id}`} className="btn btn-outline btn-block btn-sm" style={{ marginTop: '0.75rem' }}>
                            Watch Lecture &amp; Quiz
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: E-BOOKS & NOTES */}
            {activeTab === 'ebooks' && (
              <div>
                {ebookResources.length === 0 ? (
                  <div className="empty-state-card">
                    <h3>No Digital E-books or Notes</h3>
                    <p>No digital reading material has been published yet for this course syllabus.</p>
                  </div>
                ) : (
                  <div className="cards-grid">
                    {ebookResources.map((res) => (
                      <div key={res.id} className="resource-doc-card">
                        <div className="doc-type-icon">
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                            <polyline points="14 2 14 8 20 8"/>
                            <line x1="16" y1="13" x2="8" y2="13"/>
                            <line x1="16" y1="17" x2="8" y2="17"/>
                          </svg>
                        </div>

                        <div className="card-top-row">
                          <span className="badge-tag" style={{ textTransform: 'uppercase' }}>{res.type}</span>
                          <button
                            onClick={() => handleBookmarkToggle(res.id)}
                            className={`bookmark-btn ${res.is_bookmarked ? 'bookmarked' : ''}`}
                            title={res.is_bookmarked ? 'Remove bookmark' : 'Bookmark resource'}
                          >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill={res.is_bookmarked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
                              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
                            </svg>
                          </button>
                        </div>

                        <h3 className="resource-title">{res.title}</h3>
                        <p className="resource-desc">{res.description || 'Full syllabus reference notes and diagrams.'}</p>

                        <div className="doc-card-actions">
                          {res.file_url ? (
                            <>
                              <button
                                onClick={() => setPreviewPdfUrl(res.file_url)}
                                className="btn btn-outline btn-sm"
                              >
                                View PDF Reader
                              </button>
                              <a
                                href={res.file_url}
                                target="_blank"
                                rel="noreferrer"
                                className="btn btn-primary btn-sm"
                                download
                              >
                                Download
                              </a>
                            </>
                          ) : (
                            <span className="text-muted text-xs">Digital copy coming soon</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* In-Browser PDF Reader Modal */}
                {previewPdfUrl && (
                  <div className="modal-backdrop" onClick={() => setPreviewPdfUrl(null)}>
                    <div className="pdf-modal-container" onClick={(e) => e.stopPropagation()}>
                      <div className="pdf-modal-header">
                        <h3>In-Browser Document Reader</h3>
                        <button className="btn-close-modal" onClick={() => setPreviewPdfUrl(null)}>x</button>
                      </div>
                      <div className="pdf-iframe-container">
                        <iframe
                          src={previewPdfUrl}
                          title="PDF Reader Preview"
                          width="100%"
                          height="100%"
                          frameBorder="0"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: PHYSICAL TEXTBOOKS */}
            {activeTab === 'books' && (
              <div>
                {books.length === 0 ? (
                  <div className="empty-state-card">
                    <h3>No Textbooks Linked</h3>
                    <p>No textbooks have been categorized under this subject yet.</p>
                  </div>
                ) : (
                  <div className="cards-grid">
                    {books.map((b) => (
                      <div key={b.id} className="book-card">
                        <div className="book-card-cover-wrapper">
                          <img
                            src={
                              b.cover_image ||
                              'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&auto=format&fit=crop&q=60'
                            }
                            alt={b.title}
                            className="book-card-cover"
                            loading="lazy"
                          />
                          <span className="book-card-code">{b.book_code || 'LIB-BK'}</span>
                        </div>

                        <div className="book-card-content">
                          <h3 className="book-card-title">
                            <Link to={`/books/${b.id}`}>{b.title}</Link>
                          </h3>
                          <p className="book-card-author">By {b.author}</p>

                          <div className="book-card-footer">
                            <span
                              className={`status-pill ${
                                b.available_copies > 0 ? 'status-available' : 'status-borrowed'
                              }`}
                            >
                              {b.available_copies > 0
                                ? `${b.available_copies} of ${b.total_copies} available`
                                : 'All copies borrowed'}
                            </span>
                            <Link to={`/books/${b.id}`} className="btn btn-outline btn-xs">
                              {b.available_copies > 0 ? 'Borrow Info' : 'Reserve'}
                            </Link>
                          </div>
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
