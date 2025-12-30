import React from 'react';
import { Link } from 'react-router-dom';
import './HeroSection.css';

function HeroSection() {
  return (
    <section className="hero-section">
      <div className="hero-background">
        <div className="hero-shape hero-shape-1"></div>
        <div className="hero-shape hero-shape-2"></div>
        <div className="hero-shape hero-shape-3"></div>
      </div>

      <div className="hero-content">
        <div className="hero-text">
          <h1 className="hero-title">
            Your Gateway to Pharmacy <span className="highlight">Opportunities</span>
          </h1>
          <p className="hero-subtitle">
            Connect with top pharmacy jobs, discover premium products, and join a vibrant community of healthcare professionals
          </p>

          <div className="hero-buttons">
            <Link to="/jobs" className="btn btn-hero btn-primary">
              Explore Jobs
            </Link>
            <Link to="/register" className="btn btn-hero btn-secondary">
              Join Now
            </Link>
          </div>

          <div className="hero-stats">
            <div className="hero-stat">
              <strong>1000+</strong>
              <span>Jobs</span>
            </div>
            <div className="hero-stat">
              <strong>500+</strong>
              <span>Pharmacies</span>
            </div>
            <div className="hero-stat">
              <strong>5000+</strong>
              <span>Members</span>
            </div>
          </div>
        </div>

        <div className="hero-image">
          <div className="hero-illustration">
            <div className="illustration-circle circle-1"></div>
            <div className="illustration-circle circle-2"></div>
            <div className="illustration-circle circle-3"></div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default HeroSection;
