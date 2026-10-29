import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';

export default function Register() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    first_name: '',
    last_name: '',
    enrollment_no: '',
    phone: '',
    course: '',
    semester: '',
  });

  const [courses, setCourses] = useState([]);
  const [availableSemesters, setAvailableSemesters] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  // Fetch courses and their semesters from academics API
  useEffect(() => {
    api.get('/api/academics/courses/')
      .then((res) => {
        setCourses(res.data);
        setLoadingCourses(false);
      })
      .catch((err) => {
        console.error('Failed to load courses:', err);
        setLoadingCourses(false);
      });
  }, []);

  // Update semester options when course selection changes
  const handleCourseChange = (e) => {
    const selectedCourseId = e.target.value;
    setFormData((prev) => ({
      ...prev,
      course: selectedCourseId,
      semester: '', // Reset semester on course change
    }));

    if (selectedCourseId) {
      const selectedCourse = courses.find((c) => String(c.id) === String(selectedCourseId));
      setAvailableSemesters(selectedCourse?.semesters || []);
    } else {
      setAvailableSemesters([]);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Client-side validations
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setSubmitting(true);

    const payload = {
      username: formData.username.trim(),
      email: formData.email.trim(),
      password: formData.password,
      first_name: formData.first_name.trim(),
      last_name: formData.last_name.trim(),
      enrollment_no: formData.enrollment_no.trim() || null,
      phone: formData.phone.trim() || null,
      course: formData.course ? Number(formData.course) : null,
      semester: formData.semester ? Number(formData.semester) : null,
    };

    const result = await register(payload);
    setSubmitting(false);

    if (result.success) {
      navigate('/student', { replace: true });
    } else {
      setError(result.error);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card wide">
        <div className="auth-header">
          <div className="auth-logo-badge">SL</div>
          <h1 className="auth-title">Student Registration</h1>
          <p className="auth-subtitle">Create an account to access syllabus-mapped books and notes</p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          {/* Username & Email */}
          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="username">
                Username *
              </label>
              <input
                id="username"
                name="username"
                type="text"
                className="form-control"
                placeholder="e.g. rahul_s"
                value={formData.username}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="email">
                Email Address *
              </label>
              <input
                id="email"
                name="email"
                type="email"
                className="form-control"
                placeholder="e.g. rahul@college.edu"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* First & Last Name */}
          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="first_name">
                First Name
              </label>
              <input
                id="first_name"
                name="first_name"
                type="text"
                className="form-control"
                placeholder="e.g. Rahul"
                value={formData.first_name}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="last_name">
                Last Name
              </label>
              <input
                id="last_name"
                name="last_name"
                type="text"
                className="form-control"
                placeholder="e.g. Sharma"
                value={formData.last_name}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Enrollment No & Phone */}
          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="enrollment_no">
                Enrollment Number
              </label>
              <input
                id="enrollment_no"
                name="enrollment_no"
                type="text"
                className="form-control"
                placeholder="e.g. EN2024CS042"
                value={formData.enrollment_no}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="phone">
                Phone Number
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                className="form-control"
                placeholder="e.g. 9876543210"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Course & Semester Dropdowns */}
          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="course">
                Course / Program
              </label>
              <select
                id="course"
                name="course"
                className="form-control"
                value={formData.course}
                onChange={handleCourseChange}
              >
                <option value="">
                  {loadingCourses ? 'Loading courses...' : '-- Select Your Course --'}
                </option>
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="semester">
                Current Semester
              </label>
              <select
                id="semester"
                name="semester"
                className="form-control"
                value={formData.semester}
                onChange={handleChange}
                disabled={!formData.course}
              >
                <option value="">
                  {!formData.course
                    ? 'Select course first'
                    : '-- Select Semester --'}
                </option>
                {availableSemesters.map((s) => (
                  <option key={s.id} value={s.id}>
                    Semester {s.number}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Password & Confirm Password */}
          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="password">
                Password *
              </label>
              <input
                id="password"
                name="password"
                type="password"
                className="form-control"
                placeholder="At least 6 characters"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="confirmPassword">
                Confirm Password *
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                className="form-control"
                placeholder="Re-enter password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-block"
            disabled={submitting}
          >
            {submitting ? 'Creating Student Account...' : 'Complete Registration'}
          </button>
        </form>

        <div className="auth-footer">
          Already registered? <Link to="/login">Sign In here</Link>
        </div>
      </div>
    </div>
  );
}
