import { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import LibrarianSidebar from '../../components/LibrarianSidebar';
import { useToast } from '../../context/ToastContext';
import api from '../../api/client';

export default function PrintQRSheet() {
  const { showToast } = useToast();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/books/qr-sheet/')
      .then((res) => setBooks(res.data || []))
      .catch(() => showToast('Could not load QR label sheet', 'error'))
      .finally(() => setLoading(false));
  }, []);

  const handlePrint = () => {
    window.print();
    showToast('Sent label sheets to printer', 'info');
  };

  return (
    <div className="dashboard-layout">
      <div className="no-print">
        <Navbar />
      </div>

      <div className="layout-with-sidebar">
        <div className="no-print">
          <LibrarianSidebar />
        </div>

        <main className="dashboard-content print-full-width">
          <div className="page-header no-print">
            <div>
              <h1 className="page-title">Printable QR Label Sheets</h1>
              <p className="page-subtitle">
                Print standard barcode/QR stickers to paste on textbook book spines and inside front covers.
              </p>
            </div>

            <button onClick={handlePrint} className="btn btn-primary btn-sm">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '6px' }}>
                <polyline points="6 9 6 2 18 2 18 9"/>
                <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/>
                <rect x="6" y="14" width="12" height="8"/>
              </svg>
              Print Label Sheet ({books.length} Labels)
            </button>
          </div>

          {loading ? (
            <div className="cards-grid">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div key={n} className="qr-label-sticker skeleton-card" />
              ))}
            </div>
          ) : (
            <div className="qr-labels-grid">
              {books.map((book) => {
                const qrImageSrc =
                  book.qr_code ||
                  `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
                    book.book_code || book.isbn || 'LIB-BK'
                  )}`;

                return (
                  <div key={book.id} className="qr-label-sticker">
                    <div className="label-institution">SMART CAMPUS LIBRARY</div>
                    <div className="label-qr-wrapper">
                      <img
                        src={qrImageSrc}
                        alt={`QR Code for ${book.book_code}`}
                        className="label-qr-img"
                        loading="lazy"
                      />
                    </div>
                    <div className="label-book-code">{book.book_code || 'LIB-000000'}</div>
                    <div className="label-book-title">{book.title}</div>
                    <div className="label-book-meta">
                      <span>ISBN: {book.isbn || 'N/A'}</span>
                      <span>Copies: {book.total_copies}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
