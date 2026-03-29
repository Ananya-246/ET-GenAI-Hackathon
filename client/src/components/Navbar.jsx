import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Navbar.css';

const navLinks = [
  'Markets', 'Economy', 'Industry', 'Infra', 'Finance', 'Tech', 'Wealth', 'MF', 'Startups',
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="navbar-root">
      <div className="navbar-top">
        <div className="container navbar-top-inner">
          <div className="navbar-date">
            {new Date().toLocaleDateString('en-IN', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </div>
          <div className="navbar-top-links">
            <span>e-Paper</span>
            <span>|</span>
            <span>Podcast</span>
            <span>|</span>
            <span>Subscribe</span>
          </div>
        </div>
      </div>

      <div className="navbar-brand-bar">
        <div className="container navbar-brand-inner">
          <button className="navbar-logo" onClick={() => navigate('/')}>
            <span className="logo-et">ET</span>
            <span className="logo-full">Economic Times</span>
          </button>
          <div className="navbar-brand-actions">
            <div className="user-menu">
              {user && (
                <>
                  <span className="user-name">{user.display_name}</span>
                  <button
                    className="btn-primary"
                    style={{ fontSize: 13, padding: '7px 16px' }}
                    onClick={handleLogout}
                  >
                    Logout
                  </button>
                </>
              )}
            </div>
            <button
              className="btn-dark"
              style={{ fontSize: 13, padding: '7px 16px' }}
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              ☰
            </button>
          </div>
        </div>
      </div>

      <div className="navbar-sections-bar">
        <div className="container">
          <nav className="navbar-sections-nav">
            {navLinks.map((link) => (
              <button key={link} className="nav-section-link">
                {link}
              </button>
            ))}
          </nav>
        </div>
      </div>

      <div className="navbar-ai-strip">
        <div className="container navbar-ai-inner">
          <div className="ai-strip-label">
            <span className="ai-badge">ET Intelligence</span>
            <span className="ai-strip-tagline">AI-powered features — your newsroom, reimagined</span>
          </div>
          <div className="ai-strip-links">
            <button
              className={`ai-strip-btn ${isActive('/my-et') ? 'active' : ''}`}
              onClick={() => navigate('/my-et')}
            >
              🧠 My ET
            </button>
            <button
              className={`ai-strip-btn ${isActive('/navigator') ? 'active' : ''}`}
              onClick={() => navigate('/navigator')}
            >
              🔍 News Navigator
            </button>
            <button
              className={`ai-strip-btn ${isActive('/video') ? 'active' : ''}`}
              onClick={() => navigate('/video')}
            >
              🎬 Video Studio
            </button>
            <button
              className={`ai-strip-btn ${isActive('/vernacular') ? 'active' : ''}`}
              onClick={() => navigate('/vernacular')}
            >
              🌐 Vernacular
            </button>
            <button
              className={`ai-strip-btn ${isActive('/story-arc') ? 'active' : ''}`}
              onClick={() => navigate('/story-arc')}
            >
              📈 Story Arc
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}