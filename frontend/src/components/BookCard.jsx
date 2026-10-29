import { Link } from 'react-router-dom';

export default function BookCard({ book }) {
  const isAvailable = (book.available_copies || 0) > 0;

  return (
    <Link to={`/books/${book.id}`} className="book-card">
      <div className="book-cover-wrap">
        {book.cover_image ? (
          <img
            src={book.cover_image}
            alt={book.title}
            className="book-cover-img"
            loading="lazy"
          />
        ) : (
          <div className="book-cover-placeholder">
            <span className="placeholder-spine-code">
              {book.subject_code || 'TEXTBOOK'}
            </span>
            <span className="placeholder-spine-title">
              {book.title}
            </span>
          </div>
        )}
      </div>

      <div className="book-card-body">
        <h4 className="book-card-title" title={book.title}>
          {book.title}
        </h4>
        <div className="book-card-author">
          by {book.author}
        </div>

        <div className="book-card-tags">
          {book.category_name && (
            <span className="badge-tag">{book.category_name}</span>
          )}

          {isAvailable ? (
            <span className="badge-stock-in">
              {book.available_copies} of {book.total_copies} Avail
            </span>
          ) : (
            <span className="badge-stock-out">Out of Stock</span>
          )}
        </div>
      </div>
    </Link>
  );
}
