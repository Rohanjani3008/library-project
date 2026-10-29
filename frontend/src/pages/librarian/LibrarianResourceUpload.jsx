import { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import LibrarianSidebar from '../../components/LibrarianSidebar';
import { useToast } from '../../context/ToastContext';
import api from '../../api/client';

export default function LibrarianResourceUpload() {
  const { showToast } = useToast();

  const [subjects, setSubjects] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'video', // 'video', 'ebook', 'notes', 'image'
    subject: '',
    video_url: '',
    file_url: '',
    thumbnail: '',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api.get('/api/academics/subjects/')
      .then((res) => {
        setSubjects(res.data);
        if (res.data.length > 0) {
          setFormData((prev) => ({ ...prev, subject: res.data[0].id }));
        }
      })
      .catch(() => {});
  }, []);

  // Auto-generate YouTube thumbnail when YouTube URL is entered
  const handleVideoUrlChange = (url) => {
    let thumb = formData.thumbnail;
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
    if (match && match[1]) {
      thumb = `https://img.youtube.com/vi/${match[1]}/hqdefault.jpg`;
    }
    setFormData((prev) => ({
      ...prev,
      video_url: url,
      thumbnail: thumb,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.subject) {
      showToast('Please provide a resource title and subject', 'warning');
      return;
    }

    try {
      setSubmitting(true);
      await api.post('/api/resources/', formData);
      showToast('Learning resource published successfully!', 'success');
      setFormData({
        title: '',
        description: '',
        type: 'video',
        subject: subjects[0]?.id || '',
        video_url: '',
        file_url: '',
        thumbnail: '',
      });
    } catch (err) {
      showToast(err.response?.data?.error || 'Failed to publish resource', 'error');
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
              <h1 className="page-title">Upload Digital Learning Resource</h1>
              <p className="page-subtitle">
                Publish video lectures with auto-fetched YouTube thumbnails, syllabus e-books (PDF), or reference lecture notes.
              </p>
            </div>
          </div>

          <div className="circulation-desk-container">
            <div className="circulation-form-card">
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label className="form-label">Curriculum Subject *</label>
                  <select
                    className="form-input"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    required
                  >
                    {subjects.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.code} - {s.name} ({s.course_name || 'Program'})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Resource Type *</label>
                  <select
                    className="form-input"
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    required
                  >
                    <option value="video">Video Lecture (YouTube Stream)</option>
                    <option value="ebook">E-Book (Digital Textbook)</option>
                    <option value="notes">Lecture Notes / Slide Deck</option>
                    <option value="image">Diagram / Blueprint Image</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Resource Title *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Unit 2: Stack & Queue Implementation in C++"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Description / Lecture Summary</label>
                  <textarea
                    className="form-textarea"
                    rows="3"
                    placeholder="Summary of core curriculum concepts covered in this module..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>

                {formData.type === 'video' ? (
                  <>
                    <div className="form-group">
                      <label className="form-label">YouTube Video URL *</label>
                      <input
                        type="url"
                        className="form-input"
                        placeholder="https://www.youtube.com/watch?v=..."
                        value={formData.video_url}
                        onChange={(e) => handleVideoUrlChange(e.target.value)}
                        required
                      />
                      <span className="field-hint">
                        Paste any YouTube video or lecture link. High-res thumbnail is automatically extracted.
                      </span>
                    </div>

                    {formData.thumbnail && (
                      <div className="thumb-preview-group">
                        <label className="form-label">Extracted Thumbnail Preview:</label>
                        <img
                          src={formData.thumbnail}
                          alt="Thumbnail preview"
                          className="thumb-preview-img"
                        />
                      </div>
                    )}
                  </>
                ) : (
                  <div className="form-group">
                    <label className="form-label">File URL / Cloudinary Document Link *</label>
                    <input
                      type="url"
                      className="form-input"
                      placeholder="https://res.cloudinary.com/... or https://..."
                      value={formData.file_url}
                      onChange={(e) => setFormData({ ...formData, file_url: e.target.value })}
                      required
                    />
                    <span className="field-hint">
                      Direct PDF or doc link for in-browser document reading and student download.
                    </span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="btn btn-primary btn-lg btn-block"
                  style={{ marginTop: '1.5rem' }}
                >
                  {submitting ? 'Publishing Resource...' : 'Publish to Student Portal'}
                </button>
              </form>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
