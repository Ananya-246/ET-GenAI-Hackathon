import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import MyETPage from './pages/MyETPage';
import NavigatorPage from './pages/NavigatorPage';
import VideoStudioPage from './pages/VideoStudioPage';
import VernacularPage from './pages/VernacularPage';
import StoryArcPage from './pages/StoryArcPage';
import './App.css';

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />

          {/* Protected routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <div className="app">
                  <Navbar />
                  <main>
                    <HomePage />
                  </main>
                </div>
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-et"
            element={
              <ProtectedRoute>
                <div className="app">
                  <Navbar />
                  <main>
                    <MyETPage />
                  </main>
                </div>
              </ProtectedRoute>
            }
          />
          <Route
            path="/navigator"
            element={
              <ProtectedRoute>
                <div className="app">
                  <Navbar />
                  <main>
                    <NavigatorPage />
                  </main>
                </div>
              </ProtectedRoute>
            }
          />
          <Route
            path="/video"
            element={
              <ProtectedRoute>
                <div className="app">
                  <Navbar />
                  <main>
                    <VideoStudioPage />
                  </main>
                </div>
              </ProtectedRoute>
            }
          />
          <Route
            path="/vernacular"
            element={
              <ProtectedRoute>
                <div className="app">
                  <Navbar />
                  <main>
                    <VernacularPage />
                  </main>
                </div>
              </ProtectedRoute>
            }
          />
          <Route
            path="/story-arc"
            element={
              <ProtectedRoute>
                <div className="app">
                  <Navbar />
                  <main>
                    <StoryArcPage />
                  </main>
                </div>
              </ProtectedRoute>
            }
          />

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}