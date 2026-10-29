import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import Navbar from '../../components/Navbar';
import StudentBottomNav from '../../components/StudentBottomNav';
import api from '../../api/client';

export default function BookDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();

  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reserving, setReserving] = useState(false);

  // Reviews State
  const [reviews, setReviews] = useState([]);
  const [userRating, setUserRating] = useState(5);
  const [userComment, setUserComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  // Recommendations
  const [recommendations, setRecommendations] = useState([]);

  useEffect(() => {
    fetchBookData();
    fetchReviews();
    fetchRecommendations();
  }, [id]);

  const fetchBookData = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/api/books/${id}/`);
      setBook(res.data);
    } catch {
      setError('Book not found or could not be loaded.');
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      const res = await api.get('/api/community/reviews/', { params: { book_id: id } });
      setReviews(res.data);
    } catch {
      // ignore
    }
  };

  const fetchRecommendations = async () => {
    try {
      const res = await api.get('/api/books/recommended/', { params: { book_id: id } });
      setRecommendations(res.data.recommendations || []);
    } catch {
      // ignore
    }
  };

  const handleReserveBook = async () => {
    try {
      setReserving(true);
      const res = await api.post('/api/reserve/', { book_id: book.id });
      showToast(res.data.message || 'Book reserved successfully! You are in the queue.', 'success');
      fetchBookData();
    } catch (err) {
      showToast(err.response?.data?.error || 'Unable to place reservation', 'error');
    } finally {
      setReserving(false);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    try {
      setSubmittingReview(true);
      await api.post('/api/community/reviews/', {
        book_id: book.id,
        rating: userRating,
        comment: userComment,
      });
      showToast('Review submitted! 10 points awarded to your profile.', 'success');
      setUserComment('');
      fetchReviews();
    } catch (err) {
      showToast(err.response?.data?.error || 'Failed to submit review', 'error');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="dashboard-layout with-bottom-nav">
        <Navbar />
        <main className="dashboard-content">
          <div className="skeleton-card" style={{ height: '420px' }} />
        </main>
      </div>
    );
  }

  if (error || !book) {
    return (
      <div className="dashboard-layout with-bottom-nav">
        <Navbar />
        <main className="dashboard-content">
          <div className="empty-state-card">
            <h3>{error || 'Book Not Found'}</h3>
            <button className="btn btn-primary btn-sm" onClick={() => navigate(-1)}>
              Go Back
            </button>
          </div>
        </main>
      </div>
    );
  }

  const isAvailable = (book.available_copies || 0) > 0;
  const isStudent = user?.role === 'student';
  const isLibrarianOrAdmin = user?.role === 'librarian' || user?.role === 'admin';

  // Compute average rating
  const avgRating =
    reviews.length > 0
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
      : null;

  return (
    <div className="dashboard-layout with-bottom-nav">
      <Navbar />

      <main className="dashboard-content">
        <div style={{ marginBottom: 16 }}>
          <button
            type="button"
            className="btn btn-outline btn-xs"
            onClick={() => navigate(-1)}
          >
            &larr; Back to Catalog
          </button>
        </div>

        <div className="details-page-card">
          <div className="details-grid">
            {/* Book Cover Column & QR Code */}
            <div>
              <div className="details-cover">
                {book.cover_image ? (
                  <img
                    src={book.cover_image}
                    alt={book.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <div className="book-cover-placeholder">
                    <span className="placeholder-spine-code">
                      {book.subject_code || 'TEXTBOOK'}
                    </span>
                    <span className="placeholder-spine-title">{book.title}</span>
                  </div>
                )}
              </div>

              {/* Status badge under cover */}
              <div style={{ marginTop: 16, textAlign: 'center' }}>
                {isAvailable ? (
                  <span className="status-badge badge-success" style={{ fontSize: '0.9rem', padding: '6px 14px' }}>
                    Available: {book.available_copies} of {book.total_copies} Copies
                  </span>
                ) : (
                  <span className="status-badge badge-danger" style={{ fontSize: '0.9rem', padding: '6px 14px' }}>
                    Out of Stock (All Borrowed)
                  </span>
                )}
              </div>

              {/* Unique Book Code & QR Code image */}
              <div className="book-qr-preview-box">
                <span className="qr-box-code">{book.book_code || 'LIB-BK001'}</span>
                {book.qr_code ? (
                  <img
                    src={book.qr_code}
                    alt={`QR Code for ${book.book_code}`}
                    className="details-qr-img"
                  />
                ) : (
                  <div className="qr-box-label">Auto-Generated QR Ready</div>
                )}
                <span className="qr-box-caption">Scan to checkout / return</span>
              </div>
            </div>

            {/* Book Details Column */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 10 }}>
                {book.category_name && (
                  <span className="badge-tag">{book.category_name}</span>
                )}
                {book.subject_code && (
                  <span className="subject-code-tag">{book.subject_code}</span>
                )}
                {avgRating && (
                  <span className="rating-pill">
                    * {avgRating} / 5 ({reviews.length} {reviews.length === 1 ? 'review' : 'reviews'})
                  </span>
                )}
              </div>

              <h1 className="details-title">{book.title}</h1>
              <div className="details-author">by {book.author}</div>

              {/* Metadata Grid */}
              <div className="details-meta-grid">
                <div className="details-meta-box">
                  <span className="meta-box-label">Subject</span>
                  <span className="meta-box-value">{book.subject_name || 'General Reference'}</span>
                </div>
                <div className="details-meta-box">
                  <span className="meta-box-label">Course &amp; Term</span>
                  <span className="meta-box-value">
                    {book.course_name ? `${book.course_name} (Sem ${book.semester_number})` : 'All Programs'}
                  </span>
                </div>
                <div className="details-meta-box">
                  <span className="meta-box-label">ISBN</span>
                  <span className="meta-box-value">{book.isbn || 'N/A'}</span>
                </div>
                <div className="details-meta-box">
                  <span className="meta-box-label">Publisher</span>
                  <span className="meta-box-value">{book.publisher || 'N/A'}</span>
                </div>
                <div className="details-meta-box">
                  <span className="meta-box-label">Publication Year</span>
                  <span className="meta-box-value">{book.year || 'N/A'}</span>
                </div>
                <div className="details-meta-box">
                  <span className="meta-box-label">Circulation Policy</span>
                  <span className="meta-box-value">14 Days Loan (Rs 2/day late fine)</span>
                </div>
              </div>

              {/* Description */}
              <div className="details-desc-box">
                <div className="desc-title">Book Overview &amp; Curriculum Coverage</div>
                <p className="desc-text">
                  {book.description || 'Standard textbook curated for academic curriculum study and syllabus reference.'}
                </p>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 24 }}>
                {isLibrarianOrAdmin ? (
                  <Link to="/librarian" className="btn btn-primary">
                    Manage in Librarian Desk
                  </Link>
                ) : isAvailable ? (
                  <div className="availability-notice">
                    <span className="notice-icon">OK</span>
                    <span>Ready for borrow! Present your Digital Library Card QR at the circulation desk.</span>
                  </div>
                ) : (
                  <button
                    type="button"
                    className="btn btn-warning"
                    disabled={reserving}
                    onClick={handleReserveBook}
                  >
                    {reserving ? 'Joining Queue...' : 'Join Reservation Queue (Hold Copy)'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Reviews and Ratings Section */}
        <section className="reviews-section-card">
          <div className="section-header-row">
            <div>
              <h2 className="section-title-sm">Student Ratings &amp; Reviews</h2>
              <p className="text-muted text-sm">
                Real student feedback on textbook difficulty, clarity, and exam relevance.
              </p>
            </div>
            {avgRating && (
              <div className="avg-rating-box">
                <span className="avg-num">{avgRating}</span>
                <span className="avg-total">/ 5.0</span>
              </div>
            )}
          </div>

          {/* Add Review Form for Students */}
          {isStudent && (
            <form onSubmit={handleSubmitReview} className="add-review-form">
              <div className="form-group">
                <label className="form-label">Your Rating (1 to 5 Stars):</label>
                <div className="star-rating-selector">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      className={`star-btn ${userRating >= star ? 'active' : ''}`}
                      onClick={() => setUserRating(star)}
                    >
                      *
                    </button>
                  ))}
                  <span className="star-rating-text">{userRating} / 5 Stars</span>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Review Comment:</label>
                <textarea
                  className="form-textarea"
                  rows="3"
                  placeholder="Share how helpful this book was for semester exams, exercises, or concepts..."
                  value={userComment}
                  onChange={(e) => setUserComment(e.target.value)}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={submittingReview}
                className="btn btn-primary btn-sm"
              >
                {submittingReview ? 'Submitting...' : 'Post Review (+10 Pts)'}
              </button>
            </form>
          )}

          {/* Reviews List */}
          <div className="reviews-list">
            {reviews.length === 0 ? (
              <div className="empty-state-card" style={{ padding: '1.5rem' }}>
                <p>No reviews posted yet. Be the first student to review this textbook!</p>
              </div>
            ) : (
              reviews.map((rev) => (
                <div key={rev.id} className="review-item-card">
                  <div className="review-top">
                    <span className="review-user">{rev.user_name || 'Verified Student'}</span>
                    <span className="review-stars">
                      {'*'.repeat(rev.rating)} ({rev.rating}/5)
                    </span>
                  </div>
                  <p className="review-comment">{rev.comment}</p>
                  <span className="review-date">
                    {new Date(rev.created_at).toLocaleDateString()}
                  </span>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Recommended For You Section */}
        {recommendations.length > 0 && (
          <section className="recommendations-section">
            <h2 className="section-heading">Students Who Borrowed This Also Borrowed</h2>
            <div className="cards-grid">
              {recommendations.map((rec) => (
                <div key={rec.id} className="book-card">
                  <div className="book-card-cover-wrapper">
                    <img
                      src={
                        rec.cover_image ||
                        'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&auto=format&fit=crop&q=60'
                      }
                      alt={rec.title}
                      className="book-card-cover"
                      loading="lazy"
                    />
                    <span className="book-card-code">{rec.book_code || 'LIB-BK'}</span>
                  </div>
                  <div className="book-card-content">
                    <h3 className="book-card-title">
                      <Link to={`/books/${rec.id}`}>{rec.title}</Link>
                    </h3>
                    <p className="book-card-author">By {rec.author}</p>
                    <div className="book-card-footer">
                      <span className="status-badge badge-info">
                        {rec.available_copies > 0 ? `${rec.available_copies} Available` : 'Queue Open'}
                      </span>
                      <Link to={`/books/${rec.id}`} className="btn btn-outline btn-xs">
                        View
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

      {isStudent && <StudentBottomNav />}
    </div>
  );
}
