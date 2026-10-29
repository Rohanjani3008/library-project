import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/Navbar';
import BookFormModal from './BookFormModal';
import api from '../../api/client';

export default function LibrarianDashboard() {
  const { user } = useAuth();

  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [categories, setCategories] = useState([]);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);
  const [notification, setNotification] = useState('');

  // Load books catalog and categories
  const loadBooks = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search.trim()) params.append('search', search.trim());
    if (selectedCategory) params.append('category', selectedCategory);

    api.get(`/api/books/?${params.toString()}`)
      .then((res) => {
        setBooks(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load books:', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    api.get('/api/books/categories/')
      .then((res) => setCategories(res.data))
      .catch(console.error);
  }, []);

  useEffect(() => {
    loadBooks();
  }, [search, selectedCategory]);

  const handleOpenAdd = () => {
    setSelectedBook(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (book) => {
    setSelectedBook(book);
    setIsModalOpen(true);
  };

  const handleDelete = async (book) => {
    const confirmed = window.confirm(
      `Are you sure you want to permanently delete "${book.title}" from the library catalog?`
    );
    if (!confirmed) return;

    try {
      await api.delete(`/api/books/${book.id}/`);
      setNotification(`Book "${book.title}" deleted successfully.`);
      setTimeout(() => setNotification(''), 4000);
      loadBooks();
    } catch (err) {
      console.error('Delete failed:', err);
      alert('Failed to delete book. Please try again.');
    }
  };

  const handleSaved = () => {
    setNotification(
      selectedBook
        ? 'Book details updated successfully!'
        : 'New book added to library catalog!'
    );
    setTimeout(() => setNotification(''), 4000);
    loadBooks();
  };

  // Quick stats
  const totalBooksCount = books.length;
  const totalCopiesSum = books.reduce((sum, b) => sum + (b.total_copies || 0), 0);
  const totalAvailableSum = books.reduce((sum, b) => sum + (b.available_copies || 0), 0);

  return (
    <div className="dashboard-layout">
      <Navbar />

      <main className="dashboard-content">
        {/* Librarian Header */}
        <section className="hero-greeting">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
            <div>
              <h1 className="hero-title">
                Librarian Desk - {user?.first_name || user?.username}
              </h1>
              <p style={{ color: 'var(--text-muted)' }}>
                Catalog management, book acquisitions, copy tracking, and curriculum mapping.
              </p>
            </div>

            <button
              type="button"
              className="btn btn-primary"
              onClick={handleOpenAdd}
            >
              + Add New Book
            </button>
          </div>

          <div className="hero-meta">
            <div className="meta-item">
              <span className="meta-label">Catalog Titles:</span>
              <span className="meta-value">{totalBooksCount}</span>
            </div>
            <div className="meta-item">
              <span className="meta-label">Total Volume Copies:</span>
              <span className="meta-value">{totalCopiesSum}</span>
            </div>
            <div className="meta-item">
              <span className="meta-label">Available for Borrowing:</span>
              <span className="meta-value" style={{ color: 'var(--accent-emerald)' }}>
                {totalAvailableSum}
              </span>
            </div>
          </div>
        </section>

        {notification && (
          <div className="alert alert-success">
            {notification}
          </div>
        )}

        {/* Catalog Search & Filters */}
        <section className="filter-toolbar">
          <div className="filter-row">
            <div className="search-input-wrap">
              <input
                type="text"
                className="form-control"
                placeholder="Search catalog by title, author, or ISBN..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="filter-select-wrap">
              <select
                className="form-control"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="">All Categories</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {(search || selectedCategory) && (
              <button
                type="button"
                className="btn btn-secondary btn-xs"
                onClick={() => {
                  setSearch('');
                  setSelectedCategory('');
                }}
              >
                Clear
              </button>
            )}
          </div>
        </section>

        {/* Books Management Table */}
        <section>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <h2 className="section-title" style={{ margin: 0 }}>
              Library Inventory ({books.length} titles)
            </h2>
          </div>

          {loading ? (
            <div className="loading-screen" style={{ minHeight: '200px' }}>
              <div className="spinner"></div>
              <p>Loading inventory...</p>
            </div>
          ) : books.length === 0 ? (
            <div className="feature-card" style={{ textAlign: 'center', padding: '40px' }}>
              <h3>No Books Found</h3>
              <p style={{ color: 'var(--text-muted)', marginTop: 8 }}>
                No books match your search or catalog is currently empty.
              </p>
              <button
                type="button"
                className="btn btn-primary"
                style={{ marginTop: 16 }}
                onClick={handleOpenAdd}
              >
                Add First Book
              </button>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Cover</th>
                    <th>Title &amp; Author</th>
                    <th>ISBN</th>
                    <th>Subject &amp; Course</th>
                    <th>Category</th>
                    <th>Copies (Avail/Total)</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {books.map((b) => (
                    <tr key={b.id}>
                      <td style={{ width: '56px' }}>
                        {b.cover_image ? (
                          <img
                            src={b.cover_image}
                            alt=""
                            style={{
                              width: '38px',
                              height: '50px',
                              objectFit: 'cover',
                              borderRadius: '4px',
                            }}
                          />
                        ) : (
                          <div
                            style={{
                              width: '38px',
                              height: '50px',
                              background: '#1e293b',
                              borderRadius: '4px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '0.65rem',
                              fontWeight: 700,
                              color: 'var(--primary-light)',
                              border: '1px solid var(--border-subtle)',
                            }}
                          >
                            BK
                          </div>
                        )}
                      </td>

                      <td>
                        <Link
                          to={`/books/${b.id}`}
                          style={{ fontWeight: 700, color: 'var(--text-main)', display: 'block' }}
                        >
                          {b.title}
                        </Link>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          by {b.author}
                        </span>
                      </td>

                      <td style={{ fontSize: '0.82rem', color: 'var(--text-dim)', fontFamily: 'monospace' }}>
                        {b.isbn || '-'}
                      </td>

                      <td>
                        {b.subject_code ? (
                          <div>
                            <span className="subject-code-tag" style={{ fontSize: '0.72rem', padding: '2px 6px' }}>
                              {b.subject_code}
                            </span>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 2 }}>
                              {b.course_name ? `${b.course_name} (Sem ${b.semester_number})` : ''}
                            </div>
                          </div>
                        ) : (
                          <span style={{ color: 'var(--text-dim)', fontSize: '0.82rem' }}>General</span>
                        )}
                      </td>

                      <td>
                        {b.category_name ? (
                          <span className="badge-tag">{b.category_name}</span>
                        ) : (
                          '-'
                        )}
                      </td>

                      <td>
                        <span
                          className={b.available_copies > 0 ? 'badge-stock-in' : 'badge-stock-out'}
                        >
                          {b.available_copies} / {b.total_copies}
                        </span>
                      </td>

                      <td>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button
                            type="button"
                            className="btn btn-secondary btn-xs"
                            onClick={() => handleOpenEdit(b)}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            className="btn btn-danger-outline btn-xs"
                            onClick={() => handleDelete(b)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>

      {/* Add / Edit Book Modal */}
      <BookFormModal
        isOpen={isModalOpen}
        book={selectedBook}
        onClose={() => setIsModalOpen(false)}
        onSaved={handleSaved}
      />
    </div>
  );
}
