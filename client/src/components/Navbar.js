import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaBars, FaTimes, FaUser, FaSignOutAlt } from 'react-icons/fa';
import Notifications from './Notifications';
import './Navbar.css';
import { useAuth } from '../context/AuthContext';

function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <nav className="navbar">
      <div className="container navbar-container">
        <Link to="/" className="navbar-logo">
          ZimPharmHub
        </Link>

        <div className={`nav-menu ${mobileMenuOpen ? 'active' : ''}`}>
          <Link to="/" className="nav-link">
            Home
          </Link>
          <Link to="/jobs" className="nav-link">
            Jobs
          </Link>
          <Link to="/products" className="nav-link">
            Products
          </Link>
          <Link to="/pharmacies" className="nav-link">
            Pharmacies
          </Link>
          <Link to="/forum" className="nav-link">
            Forum
          </Link>
          <Link to="/articles" className="nav-link">
            Resources
          </Link>
          <Link to="/events" className="nav-link">
            Events
          </Link>
          <Link to="/faq" className="nav-link">
            FAQ
          </Link>
          <Link to="/contact" className="nav-link">
            Contact
          </Link>
          
          {isAuthenticated ? (
            <>
              <Notifications userId={user?.id} />
              <Link to="/dashboard" className="nav-link">
                Dashboard
              </Link>
              {user?.userType === 'pharmacy' && (
                <>
                  <Link to="/post-job" className="nav-link">
                    Post Job
                  </Link>
                  <Link to="/pharmacy-dashboard" className="nav-link">
                    Pharmacy Dashboard
                  </Link>
                </>
              )}
              {user?.userType === 'admin' && (
                <Link to="/admin" className="nav-link">
                  Admin
                </Link>
              )}
              <Link to="/messages" className="nav-link">
                Messages
              </Link>
              <Link to={`/profile/${user?.id}`} className="nav-link">
                <FaUser /> Profile
              </Link>
              <button onClick={handleLogout} className="nav-link btn-nav">
                <FaSignOutAlt /> Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-link btn-nav">
                Login
              </Link>
              <Link to="/register" className="nav-link btn-nav btn-nav-primary">
                Sign Up
              </Link>
            </>
          )}
        </div>

        <div className="hamburger" onClick={toggleMobileMenu}>
          {mobileMenuOpen ? <FaTimes /> : <FaBars />}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
