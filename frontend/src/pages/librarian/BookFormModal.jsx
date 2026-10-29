import { useState, useEffect } from 'react';
import api from '../../api/client';

export default function BookFormModal({ book, isOpen, onClose, onSaved }) {
  const isEditing = Boolean(book && book.id);

  const [formData, setFormData] = useState({
    title: '',
    author: '',
    isbn: '',
    category: '',
    course: '',
    semester: '',
    subject: '',
    total_copies: 1,
    available_copies: 1,
    publisher: '',
    year: '',
    description: '',
  });

  const [coverFile, setCoverFile] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);

  // Dropdowns
  const [categories, setCategories] = useState([]);
  const [courses, setCourses] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [subjects, setSubjects] = useState([]);

  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Load dropdown options
  useEffect(() => {
    if (isOpen) {
      api.get('/api/books/categories/').then((res) => setCategories(res.data)).catch(console.error);
      api.get('/api/academics/courses/').then((res) => setCourses(res.data)).catch(console.error);
    }
  }, [isOpen]);

  // Populate data when editing an existing book
  useEffect(() => {
    if (book && isOpen) {
      setFormData({
        title: book.title || '',
        author: book.author || '',
        isbn: book.isbn || '',
        category: book.category || '',
        course: book.course_id || '',
        semester: book.semester_id || '',
        subject: book.subject || '',
        total_copies: book.total_copies || 1,
        available_copies: book.available_copies ?? 1,
        publisher: book.publisher || '',
        year: book.year || '',
        description: book.description || '',
      });
      setCoverPreview(book.cover_image || null);
      setCoverFile(null);

      // Populate semesters if course is known
      if (book.course_id) {
        api.get('/api/academics/courses/').then((res) => {
          const match = res.data.find((c) => String(c.id) === String(book.course_id));
          setSemesters(match?.semesters || []);
        });
      }

      // Populate subjects if semester is known
      if (book.semester_id) {
        api.get(`/api/academics/subjects/?semester=${book.semester_id}`)
          .then((res) => setSubjects(res.data))
          .catch(console.error);
      }
    } else if (!book && isOpen) {
      // Reset form for fresh create
      setFormData({
        title: '',
        author: '',
        isbn: '',
        category: '',
        course: '',
        semester: '',
        subject: '',
        total_copies: 1,
        available_copies: 1,
        publisher: '',
        year: '',
        description: '',
      });
      setCoverFile(null);
      setCoverPreview(null);
      setSemesters([]);
      setSubjects([]);
      setError('');
    }
  }, [book, isOpen]);

  if (!isOpen) return null;

  const handleCourseChange = (courseId) => {
    setFormData((prev) => ({
      ...prev,
      course: courseId,
      semester: '',
      subject: '',
    }));
    if (courseId) {
      const match = courses.find((c) => String(c.id) === String(courseId));
      setSemesters(match?.semesters || []);
    } else {
      setSemesters([]);
      setSubjects([]);
    }
  };

  const handleSemesterChange = (semesterId) => {
    setFormData((prev) => ({
      ...prev,
      semester: semesterId,
      subject: '',
    }));
    if (semesterId) {
      api.get(`/api/academics/subjects/?semester=${semesterId}`)
        .then((res) => setSubjects(res.data))
        .catch(console.error);
    } else {
      setSubjects([]);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCoverFile(file);
      setCoverPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.title.trim() || !formData.author.trim()) {
      setError('Title and Author are required.');
      return;
    }

    if (Number(formData.available_copies) > Number(formData.total_copies)) {
      setError('Available copies cannot exceed total copies.');
      return;
    }

    setSubmitting(true);

    const data = new FormData();
    data.append('title', formData.title.trim());
    data.append('author', formData.author.trim());
    if (formData.isbn.trim()) data.append('isbn', formData.isbn.trim());
    if (formData.category) data.append('category', formData.category);
    if (formData.subject) data.append('subject', formData.subject);
    data.append('total_copies', formData.total_copies);
    data.append('available_copies', formData.available_copies);
    if (formData.publisher.trim()) data.append('publisher', formData.publisher.trim());
    if (formData.year) data.append('year', formData.year);
    if (formData.description.trim()) data.append('description', formData.description.trim());

    if (coverFile) {
      data.append('cover_image', coverFile);
    }

    try {
      if (isEditing) {
        await api.patch(`/api/books/${book.id}/`, data, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      } else {
        await api.post('/api/books/', data, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }

      setSubmitting(false);
      onSaved();
      onClose();
    } catch (err) {
      setSubmitting(false);
      console.error('Save failed:', err);
      let msg = 'Failed to save book. Please review the details.';
      if (err.response?.data) {
        const errorData = err.response.data;
        const firstKey = Object.keys(errorData)[0];
        const firstVal = errorData[firstKey];
        msg = `${firstKey}: ${Array.isArray(firstVal) ? firstVal[0] : firstVal}`;
      }
      setError(msg);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">
            {isEditing ? `Edit Book: ${book.title}` : 'Add New Book to Catalog'}
          </h2>
          <button
            type="button"
            className="btn btn-secondary btn-xs"
            onClick={onClose}
          >
            Close
          </button>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          {/* Title and Author */}
          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="title">
                Book Title *
              </label>
              <input
                id="title"
                name="title"
                type="text"
                className="form-control"
                placeholder="e.g. Programming in ANSI C"
                value={formData.title}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="author">
                Author(s) *
              </label>
              <input
                id="author"
                name="author"
                type="text"
                className="form-control"
                placeholder="e.g. E. Balagurusamy"
                value={formData.author}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* ISBN and Category */}
          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="isbn">
                ISBN Number
              </label>
              <input
                id="isbn"
                name="isbn"
                type="text"
                className="form-control"
                placeholder="e.g. 978-0131103627"
                value={formData.isbn}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="category">
                Category
              </label>
              <select
                id="category"
                name="category"
                className="form-control"
                value={formData.category}
                onChange={handleChange}
              >
                <option value="">-- Select Category --</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Academic Mapping: Course -> Semester -> Subject */}
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Course</label>
              <select
                className="form-control"
                value={formData.course}
                onChange={(e) => handleCourseChange(e.target.value)}
              >
                <option value="">-- Filter by Course --</option>
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Semester</label>
              <select
                className="form-control"
                value={formData.semester}
                onChange={(e) => handleSemesterChange(e.target.value)}
                disabled={!formData.course}
              >
                <option value="">-- Semester --</option>
                {semesters.map((s) => (
                  <option key={s.id} value={s.id}>
                    Semester {s.number}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Subject</label>
              <select
                name="subject"
                className="form-control"
                value={formData.subject}
                onChange={handleChange}
                disabled={!formData.semester}
              >
                <option value="">-- Mapped Subject --</option>
                {subjects.map((sub) => (
                  <option key={sub.id} value={sub.id}>
                    {sub.code} - {sub.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Copies: Total and Available */}
          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="total_copies">
                Total Copies *
              </label>
              <input
                id="total_copies"
                name="total_copies"
                type="number"
                min="1"
                className="form-control"
                value={formData.total_copies}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="available_copies">
                Available Copies *
              </label>
              <input
                id="available_copies"
                name="available_copies"
                type="number"
                min="0"
                className="form-control"
                value={formData.available_copies}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="year">
                Publication Year
              </label>
              <input
                id="year"
                name="year"
                type="number"
                min="1900"
                max="2100"
                className="form-control"
                placeholder="e.g. 2021"
                value={formData.year}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Publisher */}
          <div className="form-group">
            <label className="form-label" htmlFor="publisher">
              Publisher
            </label>
            <input
              id="publisher"
              name="publisher"
              type="text"
              className="form-control"
              placeholder="e.g. McGraw Hill / Pearson"
              value={formData.publisher}
              onChange={handleChange}
            />
          </div>

          {/* Description */}
          <div className="form-group">
            <label className="form-label" htmlFor="description">
              Book Description / Syllabus Summary
            </label>
            <textarea
              id="description"
              name="description"
              className="form-control"
              rows="3"
              placeholder="Key topics and chapters covered in this book..."
              value={formData.description}
              onChange={handleChange}
            ></textarea>
          </div>

          {/* Cover Image Upload with Preview */}
          <div className="form-group">
            <label className="form-label" htmlFor="cover_image">
              Cover Image Upload
            </label>
            <input
              id="cover_image"
              type="file"
              accept="image/*"
              className="form-control"
              onChange={handleFileChange}
            />
            {coverPreview && (
              <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 14 }}>
                <img
                  src={coverPreview}
                  alt="Cover preview"
                  style={{
                    width: '60px',
                    height: '80px',
                    objectFit: 'cover',
                    borderRadius: '6px',
                    border: '1px solid var(--border-highlight)',
                  }}
                />
                <span style={{ fontSize: '0.84rem', color: 'var(--text-muted)' }}>
                  Cover preview ready for upload
                </span>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 24 }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting}
            >
              {submitting
                ? isEditing
                  ? 'Saving Changes...'
                  : 'Adding Book...'
                : isEditing
                ? 'Save Changes'
                : 'Add Book'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
