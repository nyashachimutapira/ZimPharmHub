import React from 'react';
import { Link } from 'react-router-dom';
import { FaBriefcase, FaBox, FaPills, FaUsers, FaNewspaper, FaCalendar } from 'react-icons/fa';
import './HomePage.css';

function HomePage() {
  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1>Welcome to ZimPharmHub</h1>
          <p>Your Gateway to Pharmacy Opportunities, Products & Community in Zimbabwe</p>
          <div className="hero-buttons">
            <Link to="/jobs" className="btn btn-primary">
              Browse Jobs
            </Link>
            <Link to="/register" className="btn btn-secondary">
              Get Started
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features container">
        <h2>What We Offer</h2>
        <div className="features-grid">
          <div className="feature-card">
            <FaBriefcase className="feature-icon" />
            <h3>Job Opportunities</h3>
            <p>Find the latest pharmacy and dispensary assistant positions</p>
            <Link to="/jobs">Explore Jobs →</Link>
          </div>

          <div className="feature-card">
            <FaBox className="feature-icon" />
            <h3>Product Listings</h3>
            <p>Browse and discover pharmacy products and services</p>
            <Link to="/products">View Products →</Link>
          </div>

          <div className="feature-card">
            <FaPills className="feature-icon" />
            <h3>Pharmacy Profiles</h3>
            <p>Connect with verified pharmacies across Zimbabwe</p>
            <Link to="/pharmacies">Find Pharmacies →</Link>
          </div>

          <div className="feature-card">
            <FaUsers className="feature-icon" />
            <h3>Community Forum</h3>
            <p>Network with pharmacy professionals and share experiences</p>
            <Link to="/forum">Join Forum →</Link>
          </div>

          <div className="feature-card">
            <FaNewspaper className="feature-icon" />
            <h3>Resource Hub</h3>
            <p>Articles, guides, and training opportunities</p>
            <Link to="/articles">Read Resources →</Link>
          </div>

          <div className="feature-card">
            <FaCalendar className="feature-icon" />
            <h3>Events Calendar</h3>
            <p>Stay updated on pharmacy events and conferences</p>
            <Link to="/events">View Events →</Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats">
        <div className="container">
          <div className="stat">
            <h3>1000+</h3>
            <p>Active Job Listings</p>
          </div>
          <div className="stat">
            <h3>500+</h3>
            <p>Registered Pharmacies</p>
          </div>
          <div className="stat">
            <h3>5000+</h3>
            <p>Community Members</p>
          </div>
          <div className="stat">
            <h3>100+</h3>
            <p>Monthly Events</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta">
        <div className="container">
          <h2>Ready to Join ZimPharmHub?</h2>
          <p>Create an account today and unlock all features</p>
          <Link to="/register" className="btn btn-primary">
            Create Account
          </Link>
        </div>
      </section>
    </div>
  );
}

export default HomePage;
