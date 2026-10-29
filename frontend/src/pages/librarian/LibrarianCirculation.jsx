import { useState } from 'react';
import Navbar from '../../components/Navbar';
import LibrarianSidebar from '../../components/LibrarianSidebar';
import { useToast } from '../../context/ToastContext';
import api from '../../api/client';

export default function LibrarianCirculation() {
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState('issue'); // 'issue' or 'return'
  const [enrollmentNo, setEnrollmentNo] = useState('');
  const [bookIdentifier, setBookIdentifier] = useState(''); // ISBN or Book Code
  const [submitting, setSubmitting] = useState(false);
  const [resultMessage, setResultMessage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!enrollmentNo.trim() || !bookIdentifier.trim()) {
      showToast('Please enter both student enrollment number and book ISBN / Code', 'warning');
      return;
    }

    setSubmitting(true);
    setResultMessage(null);

    try {
      const endpoint = activeTab === 'issue' ? '/api/issue/' : '/api/return/';
      const payload = {
        enrollment_no: enrollmentNo.trim(),
        isbn: bookIdentifier.trim(),
      };

      const res = await api.post(endpoint, payload);
      setResultMessage({
        success: true,
        text: res.data.message || 'Operation successful',
        details: res.data,
      });
      showToast(res.data.message || 'Transaction executed', 'success');

      // Clear input on success
      setEnrollmentNo('');
      setBookIdentifier('');
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Transaction failed. Please check input values.';
      setResultMessage({
        success: false,
        text: errorMsg,
      });
      showToast(errorMsg, 'error');
    } finally {
      setSubmitting(false);
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
              <h1 className="page-title">Circulation Desk - Issue / Return</h1>
              <p className="page-subtitle">
                Issue or accept returns manually by entering the student enrollment number and book ISBN or unique book code.
              </p>
            </div>
          </div>

          <div className="circulation-desk-container">
            {/* Tab switch */}
            <div className="tab-pills-row" style={{ marginBottom: '1.5rem' }}>
              <button
                className={`tab-pill-btn ${activeTab === 'issue' ? 'active' : ''}`}
                onClick={() => {
                  setActiveTab('issue');
                  setResultMessage(null);
                }}
              >
                Issue Book (Borrow)
              </button>
              <button
                className={`tab-pill-btn ${activeTab === 'return' ? 'active' : ''}`}
                onClick={() => {
                  setActiveTab('return');
                  setResultMessage(null);
                }}
              >
                Return Book (Check-in)
              </button>
            </div>

            <div className="circulation-form-card">
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label className="form-label">Student Enrollment Number / Username *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. BCA-2024-001 or student1"
                    value={enrollmentNo}
                    onChange={(e) => setEnrollmentNo(e.target.value)}
                    required
                  />
                  <span className="field-hint">
                    Unique student ID from admission register or digital library card.
                  </span>
                </div>

                <div className="form-group">
                  <label className="form-label">Book ISBN or Unique Book Code *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. 978-0131103627 or LIB-000001"
                    value={bookIdentifier}
                    onChange={(e) => setBookIdentifier(e.target.value)}
                    required
                  />
                  <span className="field-hint">
                    Enter the printed ISBN or unique library barcode/QR label identifier.
                  </span>
                </div>

                <div className="circ-policy-note">
                  {activeTab === 'issue'
                    ? 'Policy: Standard loan period 14 days. Max 3 books per student. Available copies will be reduced by 1.'
                    : 'Policy: Return date will be recorded. Late fine calculated at Rs 2/day past due date. Available copies will increase by 1.'}
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className={`btn ${activeTab === 'issue' ? 'btn-primary' : 'btn-warning'} btn-lg btn-block`}
                >
                  {submitting
                    ? 'Executing...'
                    : activeTab === 'issue'
                    ? 'Issue Book to Student'
                    : 'Process Book Return'}
                </button>
              </form>

              {/* Result Feedback Banner */}
              {resultMessage && (
                <div
                  className={`circ-result-banner ${
                    resultMessage.success ? 'banner-pass' : 'banner-fail'
                  }`}
                  style={{ marginTop: '1.5rem' }}
                >
                  <strong>{resultMessage.success ? 'Success:' : 'Transaction Blocked:'}</strong>{' '}
                  {resultMessage.text}
                  {resultMessage.details?.ready_reservation && (
                    <div style={{ marginTop: '8px', fontSize: '0.9rem' }}>
                      Notification sent to next student in queue:{' '}
                      <code>{resultMessage.details.ready_reservation.name}</code>.
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
