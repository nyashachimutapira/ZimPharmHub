import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaBars, FaTimes, FaUser, FaSignOutAlt, FaMoon, FaSun, FaBriefcase, FaBox, FaStoreAlt, FaComments, FaBook, FaCalendarAlt, FaQuestionCircle, FaEnvelope } from 'react-icons/fa';
import Notifications from './Notifications';
import NotificationCenter from './NotificationCenter';
import './Navbar.css';
import { useAuth } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';

function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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

  return (
    <nav className="navbar">
      <div className="container navbar-container">
        {/* Logo */}
        <Link to="/" className="navbar-logo" onClick={closeMobileMenu}>
          <svg className="logo-icon" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z"/>
          </svg>
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
            <Link to="/forum" className="nav-link" onClick={closeMobileMenu}>
              <FaComments className="nav-icon" />
              Forum
            </Link>
            <Link to="/articles" className="nav-link" onClick={closeMobileMenu}>
              <FaBook className="nav-icon" />
              Resources
            </Link>
            <Link to="/events" className="nav-link" onClick={closeMobileMenu}>
              <FaCalendarAlt className="nav-icon" />
              Events
            </Link>
            <Link to="/faq" className="nav-link" onClick={closeMobileMenu}>
              <FaQuestionCircle className="nav-icon" />
              FAQ
            </Link>
            <Link to="/contact" className="nav-link" onClick={closeMobileMenu}>
              <FaEnvelope className="nav-icon" />
              Contact
            </Link>
          </div>

          <div className="nav-menu-divider"></div>

          {/* User & Theme */}
          <div className="nav-menu-section">
            <button 
              onClick={toggleDarkMode} 
              className="btn-theme-toggle" 
              title={isDarkMode ? 'Light Mode' : 'Dark Mode'}
              aria-label="Toggle dark mode"
            >
              {isDarkMode ? <FaSun /> : <FaMoon />}
            </button>

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
                  <Link to="/admin" className="nav-link btn-nav-secondary" onClick={closeMobileMenu}>
                    Admin Panel
                  </Link>
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
            ) : (
              <>
                <Link to="/login" className="nav-link btn-nav" onClick={closeMobileMenu}>
                  Login
                </Link>
                <Link to="/register" className="nav-link btn-nav btn-nav-primary" onClick={closeMobileMenu}>
                  Sign Up
                </Link>
              </>
            )}
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
    </nav>
  );
}

export default Navbar;
