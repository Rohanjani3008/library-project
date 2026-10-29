import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import ProtectedRoute from './routes/ProtectedRoute';

// Public Pages
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';

// Student Pages
import StudentDashboard from './pages/student/StudentDashboard';
import MyBooks from './pages/student/MyBooks';
import LibraryCard from './pages/student/LibraryCard';
import SubjectResources from './pages/student/SubjectResources';
import VideoLecture from './pages/student/VideoLecture';
import CommunityPage from './pages/student/CommunityPage';
import GamificationPage from './pages/student/GamificationPage';
import LibraryWrapped from './pages/student/LibraryWrapped';

// Librarian Pages
import LibrarianDashboard from './pages/librarian/LibrarianDashboard';
import LibrarianScanCirculation from './pages/librarian/LibrarianScanCirculation';
import LibrarianCirculation from './pages/librarian/LibrarianCirculation';
import LibrarianOverdue from './pages/librarian/LibrarianOverdue';
import LibrarianModeration from './pages/librarian/LibrarianModeration';
import LibrarianResourceUpload from './pages/librarian/LibrarianResourceUpload';
import PrintQRSheet from './pages/librarian/PrintQRSheet';

// Admin Pages
import AdminAnalytics from './pages/admin/AdminAnalytics';

// Book Details
import BookDetails from './pages/books/BookDetails';

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <ToastProvider>
          <AuthProvider>
            <div className="app-container">
              <Routes>
                {/* Public Landing & Authentication */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* Student Protected Routes */}
                <Route
                  path="/student"
                  element={
                    <ProtectedRoute allowedRoles={['student']}>
                      <StudentDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/student/my-books"
                  element={
                    <ProtectedRoute allowedRoles={['student']}>
                      <MyBooks />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/student/card"
                  element={
                    <ProtectedRoute allowedRoles={['student']}>
                      <LibraryCard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/student/resources"
                  element={
                    <ProtectedRoute allowedRoles={['student']}>
                      <SubjectResources />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/student/videos/:id"
                  element={
                    <ProtectedRoute allowedRoles={['student']}>
                      <VideoLecture />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/student/community"
                  element={
                    <ProtectedRoute allowedRoles={['student']}>
                      <CommunityPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/student/gamification"
                  element={
                    <ProtectedRoute allowedRoles={['student']}>
                      <GamificationPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/student/wrapped"
                  element={
                    <ProtectedRoute allowedRoles={['student']}>
                      <LibraryWrapped />
                    </ProtectedRoute>
                  }
                />

                {/* Librarian Protected Routes */}
                <Route
                  path="/librarian"
                  element={
                    <ProtectedRoute allowedRoles={['librarian', 'admin']}>
                      <LibrarianDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/librarian/scan"
                  element={
                    <ProtectedRoute allowedRoles={['librarian', 'admin']}>
                      <LibrarianScanCirculation />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/librarian/circulation"
                  element={
                    <ProtectedRoute allowedRoles={['librarian', 'admin']}>
                      <LibrarianCirculation />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/librarian/overdue"
                  element={
                    <ProtectedRoute allowedRoles={['librarian', 'admin']}>
                      <LibrarianOverdue />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/librarian/moderation"
                  element={
                    <ProtectedRoute allowedRoles={['librarian', 'admin']}>
                      <LibrarianModeration />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/librarian/resources"
                  element={
                    <ProtectedRoute allowedRoles={['librarian', 'admin']}>
                      <LibrarianResourceUpload />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/librarian/qr-sheet"
                  element={
                    <ProtectedRoute allowedRoles={['librarian', 'admin']}>
                      <PrintQRSheet />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/librarian/analytics"
                  element={
                    <ProtectedRoute allowedRoles={['librarian', 'admin']}>
                      <AdminAnalytics />
                    </ProtectedRoute>
                  }
                />

                {/* Admin Analytics / Dashboard */}
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <AdminAnalytics />
                    </ProtectedRoute>
                  }
                />

                {/* Book Details (Available to all authenticated users) */}
                <Route
                  path="/books/:id"
                  element={
                    <ProtectedRoute>
                      <BookDetails />
                    </ProtectedRoute>
                  }
                />

                {/* Catch-all redirect */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </div>
          </AuthProvider>
        </ToastProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
