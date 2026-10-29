import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import ReactPlayer from 'react-player';
import Navbar from '../../components/Navbar';
import StudentBottomNav from '../../components/StudentBottomNav';
import { useToast } from '../../context/ToastContext';
import api from '../../api/client';

export default function VideoLecture() {
  const { id } = useParams();
  const { showToast } = useToast();
  const playerRef = useRef(null);

  const [resource, setResource] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastProgressSaved, setLastProgressSaved] = useState(0);

  // Quiz state
  const [userAnswers, setUserAnswers] = useState({});
  const [quizResult, setQuizResult] = useState(null);
  const [submittingQuiz, setSubmittingQuiz] = useState(false);

  useEffect(() => {
    fetchResource();
  }, [id]);

  const fetchResource = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/api/resources/${id}/`);
      setResource(res.data);
    } catch {
      showToast('Failed to load video lecture', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Auto-save progress every 15% progression or when ended
  const handleProgress = (state) => {
    const percent = Math.floor(state.played * 100);
    const position = Math.floor(state.playedSeconds);

    if (percent - lastProgressSaved >= 10 || percent === 100) {
      setLastProgressSaved(percent);
      saveProgress(percent, position, percent >= 90);
    }
  };

  const handleEnded = () => {
    saveProgress(100, 0, true);
    showToast('Lecture completed! 20 learning points awarded.', 'success');
  };

  const saveProgress = async (watched_percent, last_position, completed) => {
    try {
      await api.post(`/api/resources/${id}/progress/`, {
        watched_percent,
        last_position,
        completed,
      });
    } catch {
      // Background auto-save, silently handle network drops
    }
  };

  const handleOptionSelect = (questionId, optionKey) => {
    setUserAnswers((prev) => ({
      ...prev,
      [questionId]: optionKey,
    }));
  };

  const handleSubmitQuiz = async () => {
    if (!resource?.quiz?.id) return;
    try {
      setSubmittingQuiz(true);
      const res = await api.post(`/api/resources/quizzes/${resource.quiz.id}/submit/`, {
        answers: userAnswers,
      });
      setQuizResult(res.data);
      if (res.data.passed) {
        showToast(`Congratulations! You passed with ${res.data.score}% score!`, 'success');
      } else {
        showToast(`You scored ${res.data.score}%. Need 60% to pass. Try reviewing again!`, 'warning');
      }
    } catch (err) {
      showToast(err.response?.data?.error || 'Failed to grade quiz', 'error');
    } finally {
      setSubmittingQuiz(false);
    }
  };

  if (loading) {
    return (
      <div className="dashboard-layout with-bottom-nav">
        <Navbar />
        <main className="dashboard-content">
          <div className="skeleton-card" style={{ height: '400px' }} />
        </main>
      </div>
    );
  }

  if (!resource) {
    return (
      <div className="dashboard-layout with-bottom-nav">
        <Navbar />
        <main className="dashboard-content">
          <div className="empty-state-card">
            <h3>Lecture Not Found</h3>
            <Link to="/student/resources" className="btn btn-primary btn-sm">
              Back to Learning Hub
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="dashboard-layout with-bottom-nav">
      <Navbar />

      <main className="dashboard-content">
        <div className="breadcrumb-nav">
          <Link to="/student/resources">Learning Hub</Link>
          <span className="breadcrumb-separator">/</span>
          <Link to={`/student/resources?subject=${resource.subject?.id || ''}`}>
            {resource.subject?.name || 'Subject'}
          </Link>
          <span className="breadcrumb-separator">/</span>
          <span className="breadcrumb-current">{resource.title}</span>
        </div>

        {/* Video Player Frame */}
        <div className="video-player-frame">
          <ReactPlayer
            ref={playerRef}
            url={resource.video_url || 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'}
            width="100%"
            height="100%"
            controls
            onProgress={handleProgress}
            onEnded={handleEnded}
            config={{
              youtube: {
                playerVars: { showinfo: 1 },
              },
            }}
          />
        </div>

        {/* Video Metadata & Notes Section */}
        <div className="video-details-section">
          <div className="page-header" style={{ marginBottom: '1rem' }}>
            <div>
              <h1 className="page-title">{resource.title}</h1>
              <div className="video-subject-tag">
                Subject: {resource.subject?.name} ({resource.subject?.code})
              </div>
            </div>

            <div className="video-status-pills">
              {resource.progress?.completed && (
                <span className="status-badge badge-success">Completed</span>
              )}
              <span className="status-badge badge-info">
                {resource.progress?.watched_percent || 0}% Watched
              </span>
            </div>
          </div>

          <div className="video-notes-box">
            <h3 className="section-title-sm">Lecture Overview &amp; Curriculum Notes</h3>
            <p className="video-notes-text">
              {resource.description || 'Comprehensive video walkthrough covering essential syllabus topics, definitions, and code walk-throughs.'}
            </p>
          </div>
        </div>

        {/* Knowledge Check Quiz Section */}
        {resource.quiz && (
          <section className="quiz-container-card">
            <div className="quiz-header">
              <div className="quiz-badge">Knowledge Check</div>
              <h2 className="quiz-title">{resource.quiz.title || 'Lesson Quiz'}</h2>
              <p className="quiz-desc">
                Test your understanding after watching the lecture. Pass with 60% or more to earn gamification points!
              </p>
            </div>

            <div className="quiz-questions-list">
              {resource.quiz.questions?.map((q, idx) => (
                <div key={q.id} className="quiz-question-card">
                  <div className="question-number-tag">Question {idx + 1}</div>
                  <h3 className="question-text">{q.question}</h3>

                  <div className="quiz-options-grid">
                    {['A', 'B', 'C', 'D'].map((optKey) => {
                      const optText = q[`option_${optKey.toLowerCase()}`];
                      if (!optText) return null;
                      const isSelected = userAnswers[q.id] === optKey;

                      let optionStateClass = '';
                      if (quizResult) {
                        const isCorrectOption = q.correct_answer?.toUpperCase() === optKey;
                        if (isCorrectOption) optionStateClass = 'correct-opt';
                        else if (isSelected && !isCorrectOption) optionStateClass = 'incorrect-opt';
                      } else if (isSelected) {
                        optionStateClass = 'selected-opt';
                      }

                      return (
                        <button
                          key={optKey}
                          type="button"
                          className={`quiz-opt-btn ${optionStateClass}`}
                          onClick={() => handleOptionSelect(q.id, optKey)}
                          disabled={!!quizResult}
                        >
                          <span className="opt-key-circle">{optKey}</span>
                          <span className="opt-text">{optText}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Quiz Result or Submit Button */}
            <div className="quiz-action-footer">
              {quizResult ? (
                <div className={`quiz-result-banner ${quizResult.passed ? 'banner-pass' : 'banner-fail'}`}>
                  <div className="result-score-title">
                    Score: {quizResult.score}% ({quizResult.correct_count} of {quizResult.total_questions} Correct)
                  </div>
                  <p>
                    {quizResult.passed
                      ? 'Great job! Points and achievements have been logged to your student profile.'
                      : 'You scored below the passing mark. Review the video lecture and test your understanding.'}
                  </p>
                </div>
              ) : (
                <button
                  onClick={handleSubmitQuiz}
                  disabled={submittingQuiz || Object.keys(userAnswers).length === 0}
                  className="btn btn-primary btn-lg"
                >
                  {submittingQuiz ? 'Grading...' : 'Submit Answers'}
                </button>
              )}
            </div>
          </section>
        )}
      </main>

      <StudentBottomNav />
    </div>
  );
}
