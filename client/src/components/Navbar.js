import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaBars, FaTimes, FaUser, FaSignOutAlt, FaMoon, FaSun, FaBriefcase, FaBox, FaStoreAlt, FaComments, FaBook, FaCalendarAlt, FaQuestionCircle, FaEnvelope } from 'react-icons/fa';
import NotificationCenter from './NotificationCenter';
import './Navbar.css';
import { useAuth } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';

function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();
  const { isDarkMode, toggleDarkMode } = useContext(ThemeContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileMenuOpen(false);
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  const closeMoreMenu = () => {
    setMoreMenuOpen(false);
  };

  const toggleMoreMenu = () => {
    setMoreMenuOpen(!moreMenuOpen);
  };

  return (
    <nav className="navbar">
      <div className="container navbar-container">
        {/* Logo */}
        <Link to="/" className="navbar-logo" onClick={closeMobileMenu}>
          <img src="/images/flags/logo.jpg" alt="ZimPharmHub" className="logo-icon" />
          <span className="logo-text">ZimPharmHub</span>
        </Link>

        {/* Navigation Menu */}
        <div className={`nav-menu ${mobileMenuOpen ? 'active' : ''}`}>
          {/* Main Navigation */}
          <div className="nav-menu-section">
            <Link to="/" className="nav-link" onClick={closeMobileMenu}>
              Home
            </Link>
            <Link to="/jobs" className="nav-link" onClick={closeMobileMenu}>
              <FaBriefcase className="nav-icon" />
              Jobs
            </Link>
            <Link to="/products" className="nav-link" onClick={closeMobileMenu}>
              <FaBox className="nav-icon" />
              Products
            </Link>
            <Link to="/pharmacies" className="nav-link" onClick={closeMobileMenu}>
              <FaStoreAlt className="nav-icon" />
              Pharmacies
            </Link>
            <Link to="/resources" className="nav-link" onClick={closeMobileMenu}>
              <FaBook className="nav-icon" />
              📚 Resources
            </Link>
            <Link to="/cpd-courses" className="nav-link" onClick={closeMobileMenu}>
              <FaBook className="nav-icon" />
              CPD Courses
            </Link>

            {/* Sidebar Menu Button */}
            <button 
              className="nav-sidebar-btn" 
              onClick={toggleMoreMenu}
              title="Open menu"
              aria-label="Toggle sidebar menu"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="18" height="18" rx="2"/>
                <path d="M3 9h18M9 3v18"/>
              </svg>
            </button>
          </div>

          <div className="nav-menu-divider"></div>

          {/* User & Theme */}
          <div className="nav-menu-section">

            {isAuthenticated ? (
              <>
                <NotificationCenter />
                <Link to="/dashboard" className="nav-link" onClick={closeMobileMenu}>
                  Dashboard
                </Link>
                {user?.userType === 'pharmacy' && (
                  <>
                    <Link to="/post-job" className="nav-link btn-nav-secondary" onClick={closeMobileMenu}>
                      Post Job
                    </Link>
                    <Link to="/pharmacy-dashboard" className="nav-link" onClick={closeMobileMenu}>
                      My Pharmacy
                    </Link>
                  </>
                )}
                {user?.userType === 'admin' && (
                  <>
                    <Link to="/admin" className="nav-link btn-nav-secondary" onClick={closeMobileMenu}>
                      Admin Panel
                    </Link>
                    <Link to="/admin/resources" className="nav-link" onClick={closeMobileMenu}>
                      ⚙️ Manage Resources
                    </Link>
                  </>
                )}
                <Link to="/messages" className="nav-link" onClick={closeMobileMenu}>
                  <FaEnvelope className="nav-icon" />
                  Messages
                </Link>
                <Link to={`/profile/${user?.id}`} className="nav-link" onClick={closeMobileMenu}>
                  <FaUser className="nav-icon" /> 
                  Profile
                </Link>
                <button onClick={handleLogout} className="nav-link btn-nav btn-logout">
                  <FaSignOutAlt /> Logout
                </button>
              </>
            ) : null}
          </div>
        </div>

        {/* Mobile Menu Toggle */}
        <button 
          className="hamburger" 
          onClick={toggleMobileMenu}
          aria-label="Toggle navigation menu"
          aria-expanded={mobileMenuOpen}
        >
          {mobileMenuOpen ? <FaTimes /> : <FaBars />}
        </button>
      </div>

      {/* Sidebar Menu Panel */}
      {moreMenuOpen && (
        <>
          <div className="sidebar-overlay" onClick={closeMoreMenu}></div>
          <div className="sidebar-panel">
            <div className="sidebar-header">
              <h3>Menu</h3>
              <button className="sidebar-close" onClick={closeMoreMenu}>
                <FaTimes />
              </button>
            </div>

            <nav className="sidebar-nav">
              <Link to="/mentorship" className="sidebar-item" onClick={closeMoreMenu}>
                <FaUser className="sidebar-icon" />
                <span>Mentorship</span>
              </Link>
              <Link to="/forum" className="sidebar-item" onClick={closeMoreMenu}>
                <FaComments className="sidebar-icon" />
                <span>Forum</span>
              </Link>
              <Link to="/events" className="sidebar-item" onClick={closeMoreMenu}>
                <FaCalendarAlt className="sidebar-icon" />
                <span>Events</span>
              </Link>
              <Link to="/resume-builder" className="sidebar-item" onClick={closeMoreMenu}>
                <FaBook className="sidebar-icon" />
                <span>Resume Builder</span>
              </Link>
              <Link to="/qa" className="sidebar-item" onClick={closeMoreMenu}>
                <FaQuestionCircle className="sidebar-icon" />
                <span>Q&A</span>
              </Link>
              <Link to="/faq" className="sidebar-item" onClick={closeMoreMenu}>
                <FaQuestionCircle className="sidebar-icon" />
                <span>FAQ</span>
              </Link>
              <Link to="/contact" className="sidebar-item" onClick={closeMoreMenu}>
                <FaEnvelope className="sidebar-icon" />
                <span>Contact</span>
              </Link>
            </nav>

            {/* Auth Section in Sidebar */}
            <div className="sidebar-footer">
              <button 
                onClick={toggleDarkMode} 
                className="sidebar-theme-toggle" 
                title={isDarkMode ? 'Light Mode' : 'Dark Mode'}
                aria-label="Toggle dark mode"
              >
                {isDarkMode ? <FaSun /> : <FaMoon />}
                <span>{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>
              </button>

              {!isAuthenticated ? (
                <div className="sidebar-auth">
                  <Link to="/login" className="sidebar-auth-link login" onClick={closeMoreMenu}>
                    <FaUser className="sidebar-icon" />
                    <span>Login</span>
                  </Link>
                  <Link to="/register" className="sidebar-auth-link signup" onClick={closeMoreMenu}>
                    <FaUser className="sidebar-icon" />
                    <span>Sign Up</span>
                  </Link>
                </div>
              ) : null}
            </div>
          </div>
        </>
      )}
    </nav>
  );
}

export default Navbar;
