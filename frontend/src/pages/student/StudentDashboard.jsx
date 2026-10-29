import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/Navbar';
import StudentBottomNav from '../../components/StudentBottomNav';
import BookCard from '../../components/BookCard';
import api from '../../api/client';

export default function StudentDashboard() {
  const { user } = useAuth();

  // Syllabus books state
  const [syllabusData, setSyllabusData] = useState([]);
  const [loadingSyllabus, setLoadingSyllabus] = useState(true);

  // Recommendations and Continue Watching
  const [recommendedBooks, setRecommendedBooks] = useState([]);
  const [continueWatching, setContinueWatching] = useState([]);
  const [readingStreak, setReadingStreak] = useState(0);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  // Dropdown options
  const [courses, setCourses] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [categories, setCategories] = useState([]);

  // Filtered books results
  const [filteredBooks, setFilteredBooks] = useState(null);
  const [loadingSearch, setLoadingSearch] = useState(false);

  useEffect(() => {
    fetchSyllabusBooks();
    loadFilterOptions();
    fetchStudentInsights();
  }, []);

  const fetchStudentInsights = async () => {
    try {
      const [recRes, watchRes, gamRes] = await Promise.all([
        api.get('/api/books/recommended/').catch(() => ({ data: { recommendations: [] } })),
        api.get('/api/resources/continue-watching/').catch(() => ({ data: [] })),
        api.get('/api/gamification/profile/').catch(() => ({ data: {} })),
      ]);
      setRecommendedBooks(recRes.data.recommendations || []);
      setContinueWatching(watchRes.data || []);
      setReadingStreak(gamRes.data?.streak?.current_streak || 0);
    } catch {
      // silent
    }
  };

  const fetchSyllabusBooks = () => {
    setLoadingSyllabus(true);
    api.get('/api/books/my-syllabus/')
      .then((res) => {
        if (Array.isArray(res.data)) {
          setSyllabusData(res.data);
        } else {
          setSyllabusData([]);
        }
        setLoadingSyllabus(false);
      })
      .catch((err) => {
        console.error('Failed to load my-syllabus books:', err);
        setSyllabusData([]);
        setLoadingSyllabus(false);
      });
  };

  const loadFilterOptions = () => {
    api.get('/api/academics/courses/')
      .then((res) => setCourses(res.data))
      .catch((err) => console.error('Failed to load courses:', err));

    api.get('/api/books/categories/')
      .then((res) => setCategories(res.data))
      .catch((err) => console.error('Failed to load categories:', err));
  };

  const handleCourseChange = (courseId) => {
    setSelectedCourse(courseId);
    setSelectedSemester('');
    setSelectedSubject('');
    if (courseId) {
      const match = courses.find((c) => String(c.id) === String(courseId));
      setSemesters(match?.semesters || []);
    } else {
      setSemesters([]);
      setSubjects([]);
    }
  };

  const handleSemesterChange = (semesterId) => {
    setSelectedSemester(semesterId);
    setSelectedSubject('');
    if (semesterId) {
      api.get(`/api/academics/subjects/?semester=${semesterId}`)
        .then((res) => setSubjects(res.data))
        .catch((err) => console.error('Failed to load subjects:', err));
    } else {
      setSubjects([]);
    }
  };

  useEffect(() => {
    const hasActiveFilter =
      searchQuery.trim() !== '' ||
      selectedCourse !== '' ||
      selectedSemester !== '' ||
      selectedSubject !== '' ||
      selectedCategory !== '';

    if (!hasActiveFilter) {
      setFilteredBooks(null);
      return;
    }

    const timer = setTimeout(() => {
      setLoadingSearch(true);
      const params = {};
      if (searchQuery.trim()) params.search = searchQuery.trim();
      if (selectedCourse) params.course = selectedCourse;
      if (selectedSemester) params.semester = selectedSemester;
      if (selectedSubject) params.subject = selectedSubject;
      if (selectedCategory) params.category = selectedCategory;

      api.get('/api/books/', { params })
        .then((res) => {
          const results = res.data.results || res.data || [];
          setFilteredBooks(results);
          setLoadingSearch(false);
        })
        .catch((err) => {
          console.error('Filter request failed:', err);
          setFilteredBooks([]);
          setLoadingSearch(false);
        });
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery, selectedCourse, selectedSemester, selectedSubject, selectedCategory]);

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCourse('');
    setSelectedSemester('');
    setSelectedSubject('');
    setSelectedCategory('');
    setFilteredBooks(null);
  };

  const isFiltering = filteredBooks !== null;

  return (
    <div className="dashboard-layout with-bottom-nav">
      <Navbar />

      <main className="dashboard-content">
        {/* Student Welcome Hero with Streak Indicator */}
        <section className="hero-greeting">
          <div className="hero-top-row">
            <div>
              <h1 className="hero-title">
                Welcome back, {user?.first_name || user?.username}!
              </h1>
              <p className="hero-subtitle">
                Academic Curriculum &amp; Library Desk &mdash;{' '}
                {user?.course_name ? `${user.course_name} (Semester ${user?.semester_number || 1})` : 'Undergraduate Scholar'}
              </p>
            </div>

            <div className="streak-badge-pill">
              <span className="streak-fire-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>
                </svg>
              </span>
              <span className="streak-text">{readingStreak} Day Streak</span>
            </div>
          </div>

          <div className="hero-meta">
            <div className="meta-item">
              <span className="meta-label">Enrollment:</span>
              <span className="meta-value"><code>{user?.enrollment_no || 'N/A'}</code></span>
            </div>
            <div className="meta-item">
              <span className="meta-label">Course:</span>
              <span className="meta-value">{user?.course_name || 'BCA'}</span>
            </div>
            <div className="meta-item">
              <span className="meta-label">Semester:</span>
              <span className="meta-value">Sem {user?.semester_number || 1}</span>
            </div>
            <div className="meta-item">
              <span className="meta-label">Digital ID:</span>
              <Link to="/student/card" className="meta-value link-accent">
                View Card QR &rarr;
              </Link>
            </div>
          </div>
        </section>

        {/* Continue Watching Video Lectures Row */}
        {continueWatching.length > 0 && !isFiltering && (
          <section className="continue-watching-section">
            <div className="section-header-row">
              <h2 className="section-title-sm">Continue Watching</h2>
              <Link to="/student/resources" className="section-link">All E-Resources &rarr;</Link>
            </div>

            <div className="continue-watching-scroll">
              {continueWatching.map((item) => (
                <div key={item.id} className="continue-video-card">
                  <div className="cw-thumb-box">
                    <img
                      src={item.resource?.thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&auto=format&fit=crop&q=60'}
                      alt={item.resource?.title}
                      className="cw-thumb-img"
                    />
                    <Link to={`/student/videos/${item.resource?.id}`} className="cw-play-btn" aria-label="Resume video">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                        <polygon points="5 3 19 12 5 21 5 3"/>
                      </svg>
                    </Link>
                  </div>
                  <div className="cw-body">
                    <h4 className="cw-title">
                      <Link to={`/student/videos/${item.resource?.id}`}>
                        {item.resource?.title}
                      </Link>
                    </h4>
                    <div className="cw-subject">{item.resource?.subject?.name}</div>
                    <div className="progress-bar-track" style={{ marginTop: '6px' }}>
                      <div
                        className="progress-bar-fill"
                        style={{ width: `${item.watched_percent || 0}%` }}
                      />
                    </div>
                    <div className="cw-percent">{item.watched_percent}% watched</div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Search & Filter Bar */}
        <section className="catalog-search-section">
          <div className="search-bar-row">
            <input
              type="text"
              className="search-input"
              placeholder="Search by book title, author, or ISBN..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="filter-controls-row">
            <select
              className="filter-select"
              value={selectedCourse}
              onChange={(e) => handleCourseChange(e.target.value)}
            >
              <option value="">All Programs / Courses</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>

            <select
              className="filter-select"
              value={selectedSemester}
              onChange={(e) => handleSemesterChange(e.target.value)}
              disabled={!selectedCourse}
            >
              <option value="">All Semesters</option>
              {semesters.map((s) => (
                <option key={s.id} value={s.id}>Semester {s.number}</option>
              ))}
            </select>

            <select
              className="filter-select"
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              disabled={!selectedSemester}
            >
              <option value="">All Subjects</option>
              {subjects.map((sub) => (
                <option key={sub.id} value={sub.id}>{sub.code} - {sub.name}</option>
              ))}
            </select>

            <select
              className="filter-select"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>

            {isFiltering && (
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={clearFilters}
              >
                Clear Filters
              </button>
            )}
          </div>
        </section>

        {/* MAIN DISPLAY: Filter Results OR Semester Syllabus Books */}
        {isFiltering ? (
          <section>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 className="section-title" style={{ margin: 0 }}>
                Search Results ({filteredBooks.length} books found)
              </h2>
              <button
                type="button"
                className="btn btn-outline btn-xs"
                onClick={clearFilters}
              >
                Back to My Syllabus
              </button>
            </div>

            {loadingSearch ? (
              <div className="cards-grid">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="book-card skeleton-card">
                    <div className="skeleton-thumb" />
                    <div className="skeleton-line" />
                  </div>
                ))}
              </div>
            ) : filteredBooks.length === 0 ? (
              <div className="empty-state-card">
                <h3>No Books Matched Your Filters</h3>
                <p>Try relaxing search terms or selecting a different subject or category.</p>
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={clearFilters}
                >
                  Clear All Filters
                </button>
              </div>
            ) : (
              <div className="cards-grid">
                {filteredBooks.map((book) => (
                  <BookCard key={book.id} book={book} />
                ))}
              </div>
            )}
          </section>
        ) : (
          <>
            {/* Recommended Books Row */}
            {recommendedBooks.length > 0 && (
              <section className="recommendations-section" style={{ marginBottom: '2.5rem' }}>
                <div className="section-header-row">
                  <div>
                    <h2 className="section-title-sm">Recommended for Your Semester</h2>
                    <p className="text-muted text-xs">Curated based on checkout patterns in your department</p>
                  </div>
                </div>

                <div className="cards-grid">
                  {recommendedBooks.slice(0, 4).map((b) => (
                    <BookCard key={b.id} book={b} />
                  ))}
                </div>
              </section>
            )}

            {/* Prescribed Syllabus Books Grouped by Subject */}
            <section>
              <div style={{ marginBottom: 24 }}>
                <h2 className="section-title" style={{ marginBottom: 4 }}>
                  Prescribed Textbooks for Your Semester
                </h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                  {user?.course_name ? `${user.course_name} - Semester ${user?.semester_number || ''}` : 'Syllabus Mapped Catalog'}
                </p>
              </div>

              {loadingSyllabus ? (
                <div className="cards-grid">
                  {[1, 2, 3].map((n) => (
                    <div key={n} className="book-card skeleton-card">
                      <div className="skeleton-thumb" />
                      <div className="skeleton-line" />
                    </div>
                  ))}
                </div>
              ) : syllabusData.length === 0 ? (
                <div className="empty-state-card">
                  <h3>No Books Found for Your Semester</h3>
                  <p>
                    {user?.semester
                      ? 'No books are currently cataloged for your semester subjects.'
                      : 'Please select your Course and Semester in your profile or use the search bar above to browse catalog.'}
                  </p>
                </div>
              ) : (
                syllabusData.map((group) => (
                  <div key={group.subject.id} className="subject-section">
                    <div className="subject-header">
                      <div className="subject-title-wrap">
                        <span className="subject-code-tag">{group.subject.code}</span>
                        <h3 className="subject-name-heading">{group.subject.name}</h3>
                      </div>
                      <span className="subject-book-count">
                        {group.books.length} {group.books.length === 1 ? 'book' : 'books'}
                      </span>
                    </div>

                    {group.books.length === 0 ? (
                      <div className="text-muted text-xs" style={{ fontStyle: 'italic', padding: '12px 0' }}>
                        No reference books listed for this subject yet.
                      </div>
                    ) : (
                      <div className="cards-grid">
                        {group.books.map((book) => (
                          <BookCard key={book.id} book={book} />
                        ))}
                      </div>
                    )}
                  </div>
                ))
              )}
            </section>
          </>
        )}
      </main>

      <StudentBottomNav />
    </div>
  );
}
