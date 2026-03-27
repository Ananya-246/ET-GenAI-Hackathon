import { useState } from "react";
import "./Navbar.css";

const navLinks = [
  "Markets", "Economy", "Industry", "Infra", "Finance", "Tech", "Wealth", "MF", "Startups",
];

export default function Navbar({ activePage, setActivePage }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="navbar-root">
      <div className="navbar-top">
        <div className="container navbar-top-inner">
          <div className="navbar-date">
            {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
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
          <button className="navbar-logo" onClick={() => setActivePage("home")}>
            <span className="logo-et">ET</span>
            <span className="logo-full">Economic Times</span>
          </button>
          <div className="navbar-brand-actions">
            <button className="btn-primary" style={{ fontSize: 13, padding: "7px 16px" }}>Login</button>
            <button className="btn-dark" style={{ fontSize: 13, padding: "7px 16px" }} onClick={() => setMobileOpen(!mobileOpen)}>☰</button>
          </div>
        </div>
      </div>

      <div className="navbar-sections-bar">
        <div className="container">
          <nav className="navbar-sections-nav">
            {navLinks.map(link => (
              <button key={link} className="nav-section-link">{link}</button>
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
              className={`ai-strip-btn ${activePage === "my-et" ? "active" : ""}`}
              onClick={() => setActivePage("my-et")}
            >
              🧠 My ET
            </button>
            <button
              className={`ai-strip-btn ${activePage === "navigator" ? "active" : ""}`}
              onClick={() => setActivePage("navigator")}
            >
              🔍 News Navigator
            </button>
            <button
              className={`ai-strip-btn ${activePage === "video" ? "active" : ""}`}
              onClick={() => setActivePage("video")}
            >
              🎬 Video Studio
            </button>
            <button
              className={`ai-strip-btn ${activePage === "vernacular" ? "active" : ""}`}
              onClick={() => setActivePage("vernacular")}
            >
              🌐 Vernacular
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}