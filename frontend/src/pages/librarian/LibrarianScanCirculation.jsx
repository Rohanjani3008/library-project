import { useState, useEffect, useRef } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import Navbar from '../../components/Navbar';
import LibrarianSidebar from '../../components/LibrarianSidebar';
import { useToast } from '../../context/ToastContext';
import api from '../../api/client';

export default function LibrarianScanCirculation() {
  const { showToast } = useToast();
  const scannerRef = useRef(null);

  // Scan state: 'student', 'book', 'confirm', 'success'
  const [step, setStep] = useState('student');
  const [studentCode, setStudentCode] = useState('');
  const [bookCode, setBookCode] = useState('');
  const [actionType, setActionType] = useState('issue'); // 'issue' or 'return'
  const [studentData, setStudentData] = useState(null);
  const [bookData, setBookData] = useState(null);
  const [isCurrentlyIssued, setIsCurrentlyIssued] = useState(false);
  const [activeIssueRecord, setActiveIssueRecord] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [lastResult, setLastResult] = useState(null);

  // Initialize or restart QR scanner
  useEffect(() => {
    let scanner = null;

    if (step === 'student' || step === 'book') {
      const containerId = 'qr-reader';
      const containerEl = document.getElementById(containerId);

      if (containerEl) {
        // Clear previous instances if any
        containerEl.innerHTML = '';
        scanner = new Html5QrcodeScanner(
          containerId,
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
            rememberLastUsedCamera: true,
          },
          /* verbose= */ false
        );

        scanner.render(
          (decodedText) => {
            const trimmed = decodedText.trim();
            if (step === 'student') {
              handleStudentScanned(trimmed);
            } else if (step === 'book') {
              handleBookScanned(trimmed);
            }
            try {
              scanner.clear();
            } catch {
              // Ignore cleanup error
            }
          },
          () => {}
        );
        scannerRef.current = scanner;
      }
    }

    return () => {
      if (scannerRef.current) {
        try {
          scannerRef.current.clear();
        } catch {
          // ignore
        }
      }
    };
  }, [step]);

  const handleStudentScanned = (code) => {
    setStudentCode(code);
    showToast(`Scanned Student ID: ${code}`, 'info');
    setStep('book');
  };

  const handleBookScanned = async (code) => {
    setBookCode(code);
    showToast(`Scanned Book Code: ${code}`, 'info');
    await resolveAndConfirm(studentCode, code);
  };

  const resolveAndConfirm = async (studentIdent, bookIdent) => {
    setProcessing(true);
    try {
      // 1. Resolve book data
      const bookRes = await api.get(`/api/books/by-code/${encodeURIComponent(bookIdent)}/`);
      const bData = bookRes.data;
      setBookData(bData);

      // 2. Check if this book is already issued to this student
      // Check active loans via overdue/issue search or direct return check
      const overdueRes = await api.get('/api/overdue/').catch(() => ({ data: [] }));
      const matches = (overdueRes.data || []).filter(
        (rec) =>
          (rec.user_enrollment === studentIdent || rec.user_username === studentIdent) &&
          (rec.book_code === bData.book_code || rec.book_isbn === bData.isbn)
      );

      if (matches.length > 0) {
        setIsCurrentlyIssued(true);
        setActiveIssueRecord(matches[0]);
        setActionType('return');
      } else {
        // Default to issue
        setIsCurrentlyIssued(false);
        setActionType('issue');
      }

      setStep('confirm');
    } catch {
      showToast('Could not find book record for scanned code. Please verify QR.', 'error');
      setStep('book');
    } finally {
      setProcessing(false);
    }
  };

  const handleConfirmTransaction = async () => {
    setProcessing(true);
    try {
      if (actionType === 'return') {
        const payload = {
          enrollment_no: studentCode,
          book_code: bookCode,
        };
        if (activeIssueRecord?.id) {
          payload.issue_id = activeIssueRecord.id;
        }

        const res = await api.post('/api/return/', payload);
        setLastResult(res.data);
        showToast(res.data.message || 'Book returned successfully!', 'success');
        setStep('success');
      } else {
        // Issue
        const payload = {
          enrollment_no: studentCode,
          book_code: bookCode,
        };
        const res = await api.post('/api/issue/', payload);
        setLastResult(res.data);
        showToast(res.data.message || 'Book checked out successfully!', 'success');
        setStep('success');
      }
    } catch (err) {
      showToast(err.response?.data?.error || 'Transaction failed. Check borrow limits or availability.', 'error');
    } finally {
      setProcessing(false);
    }
  };

  const handleReset = () => {
    setStep('student');
    setStudentCode('');
    setBookCode('');
    setStudentData(null);
    setBookData(null);
    setIsCurrentlyIssued(false);
    setActiveIssueRecord(null);
    setLastResult(null);
  };

  return (
    <div className="dashboard-layout">
      <Navbar />

      <div className="layout-with-sidebar">
        <LibrarianSidebar />

        <main className="dashboard-content">
          <div className="page-header">
            <div>
              <h1 className="page-title">QR Scanner Circulation Desk</h1>
              <p className="page-subtitle">
                Two-step workflow: Scan student card QR, then scan book QR for automatic checkouts and returns.
              </p>
            </div>

            <button onClick={handleReset} className="btn btn-outline btn-sm">
              Restart Scanner
            </button>
          </div>

          {/* Stepper Progress Bar */}
          <div className="scan-stepper-bar">
            <div className={`stepper-step ${step === 'student' ? 'active' : studentCode ? 'completed' : ''}`}>
              <span className="step-circle">1</span>
              <span className="step-label">Scan Student Card</span>
            </div>
            <div className={`stepper-step ${step === 'book' ? 'active' : bookCode ? 'completed' : ''}`}>
              <span className="step-circle">2</span>
              <span className="step-label">Scan Book QR</span>
            </div>
            <div className={`stepper-step ${step === 'confirm' ? 'active' : ''}`}>
              <span className="step-circle">3</span>
              <span className="step-label">Confirm Action</span>
            </div>
          </div>

          {/* Step 1 & 2: QR Scanner Camera Box */}
          {(step === 'student' || step === 'book') && (
            <div className="scanner-container-card">
              <div className="scanner-instruction-header">
                <h2>
                  {step === 'student'
                    ? 'Step 1: Point Camera at Student ID Card QR'
                    : 'Step 2: Point Camera at Book QR Label'}
                </h2>
                <p>
                  {step === 'student'
                    ? 'Scan the student enrollment pass presented at the desk.'
                    : `Student (${studentCode}) identified. Now scan the textbook QR sticker.`}
                </p>
              </div>

              <div id="qr-reader" className="camera-viewport-box" />

              {/* Manual Input Fallback */}
              <div className="manual-scan-fallback">
                <span className="fallback-divider">OR ENTER MANUALLY</span>
                <div className="manual-input-row">
                  <input
                    type="text"
                    className="form-input"
                    placeholder={step === 'student' ? 'Enter Student Enrollment No' : 'Enter Book Code / ISBN'}
                    id="manual-input-box"
                  />
                  <button
                    className="btn btn-primary"
                    onClick={() => {
                      const val = document.getElementById('manual-input-box').value.trim();
                      if (!val) return;
                      if (step === 'student') handleStudentScanned(val);
                      else handleBookScanned(val);
                    }}
                  >
                    Submit
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Confirmation Dialog */}
          {step === 'confirm' && (
            <div className="confirm-circulation-card">
              <div className="confirm-badge-row">
                <span className={`status-badge ${actionType === 'return' ? 'badge-warning' : 'badge-success'}`}>
                  Detected Action: {actionType.toUpperCase()}
                </span>
                {isCurrentlyIssued && (
                  <span className="status-badge badge-info">
                    Book is currently on loan to this student
                  </span>
                )}
              </div>

              <div className="confirm-grid">
                <div className="confirm-col">
                  <h3 className="confirm-section-title">Student Information</h3>
                  <div className="confirm-meta-box">
                    <div className="meta-pair">
                      <span className="meta-k">Enrollment / ID:</span>
                      <span className="meta-v"><code>{studentCode}</code></span>
                    </div>
                  </div>
                </div>

                <div className="confirm-col">
                  <h3 className="confirm-section-title">Book Information</h3>
                  <div className="confirm-meta-box">
                    <div className="meta-pair">
                      <span className="meta-k">Book Code:</span>
                      <span className="meta-v"><code>{bookData?.book_code}</code></span>
                    </div>
                    <div className="meta-pair">
                      <span className="meta-k">Title:</span>
                      <span className="meta-v" style={{ fontWeight: 600 }}>{bookData?.title}</span>
                    </div>
                    <div className="meta-pair">
                      <span className="meta-k">Author:</span>
                      <span className="meta-v">{bookData?.author}</span>
                    </div>
                    <div className="meta-pair">
                      <span className="meta-k">Available Copies:</span>
                      <span className="meta-v">{bookData?.available_copies} of {bookData?.total_copies}</span>
                    </div>
                  </div>
                </div>
              </div>

              {actionType === 'issue' && (
                <div className="circ-policy-note">
                  Standard loan period: 14 days. Late return fee of Rs 2 per day applies after due date.
                </div>
              )}

              {actionType === 'return' && activeIssueRecord && (
                <div className="circ-policy-note warning-note">
                  Returning book issued on {activeIssueRecord.issue_date}.
                  Due Date was {activeIssueRecord.due_date}.
                  {activeIssueRecord.fine_amount > 0 ? (
                    <span className="fine-highlight">
                      Late Fine Accumulated: Rs {activeIssueRecord.fine_amount}
                    </span>
                  ) : (
                    <span> Returned on time! Rs 0 fine.</span>
                  )}
                </div>
              )}

              <div className="confirm-actions-row">
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={handleReset}
                  disabled={processing}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className={`btn ${actionType === 'return' ? 'btn-warning' : 'btn-primary'} btn-lg`}
                  onClick={handleConfirmTransaction}
                  disabled={processing}
                >
                  {processing
                    ? 'Processing...'
                    : actionType === 'return'
                    ? 'Confirm Book Return'
                    : 'Confirm Book Issue'}
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Success View */}
          {step === 'success' && (
            <div className="circulation-success-card">
              <div className="success-icon-wrap">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              </div>

              <h2>Transaction Completed Successfully</h2>
              <p className="success-message-text">{lastResult?.message}</p>

              {lastResult?.ready_reservation && (
                <div className="ready-reservation-alert">
                  <strong>Reservation Queue Update:</strong> A copy has become ready for{' '}
                  <code>{lastResult.ready_reservation.name}</code> ({lastResult.ready_reservation.enrollment_no}).
                  Notification has been dispatched.
                </div>
              )}

              <div className="success-actions-row">
                <button onClick={handleReset} className="btn btn-primary btn-lg">
                  Next Student / Book Scan
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
