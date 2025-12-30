import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { FaBriefcase, FaBox, FaPills, FaUsers, FaNewspaper, FaCalendar } from 'react-icons/fa';
import './HomePage.css';

const AdsCarouselLazy = React.lazy(() => import('../components/AdsCarousel'));

function HomePage() {
  const [stats, setStats] = useState({ jobs: null, pharmacies: null, members: null, events: null });
  const videoRef = React.useRef(null);

  useEffect(() => {
    let mounted = true;
    axios.get('/api/stats')
      .then((res) => {
        if (mounted) setStats(res.data);
      })
      .catch((err) => console.error('Error fetching stats:', err));
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    // Set video to slow motion (0.5x speed)
    const video = videoRef.current;
    if (video) {
      const setSlowMotion = () => {
        video.playbackRate = 0.5;
      };
      
      // Set playback rate when video is ready
      if (video.readyState >= 2) {
        setSlowMotion();
      } else {
        video.addEventListener('loadedmetadata', setSlowMotion);
        video.addEventListener('canplay', setSlowMotion);
      }

      // Handle video errors gracefully
      video.addEventListener('error', (e) => {
        console.log('Video failed to load, using gradient background fallback');
      });

      return () => {
        video.removeEventListener('loadedmetadata', setSlowMotion);
        video.removeEventListener('canplay', setSlowMotion);
      };
    }
  }, []);

  return (
    <div className="home-page">
      {/* Hero Section with Video Background */}
      <section className="hero">
        <video
          ref={videoRef}
          className="hero-video"
          autoPlay
          loop
          muted
          playsInline
        >
          <source src="/videos/pharmacy-background.mp4" type="video/mp4" />
          <source src="/videos/pharmacy-background.webm" type="video/webm" />
          {/* Fallback if video doesn't load */}
        </video>
        <div className="hero-overlay"></div>
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

        {/* Ads carousel (featured) */}
        <div style={{ marginTop: 20 }}>
          <h3>Featured</h3>
          <div>
            {/* Lazy load with dynamic import for performance */}
            <React.Suspense fallback={<div>Loading featured ads…</div>}>
              <AdsCarouselLazy />
            </React.Suspense>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats">
        <div className="container">
          <div className="stat">
            <h3>{stats.jobs !== null ? stats.jobs : '—'}</h3>
            <p>Active Job Listings</p>
          </div>
          <div className="stat">
            <h3>{stats.pharmacies !== null ? stats.pharmacies : '—'}</h3>
            <p>Registered Pharmacies</p>
          </div>
          <div className="stat">
            <h3>{stats.members !== null ? stats.members : '—'}</h3>
            <p>Community Members</p>
          </div>
          <div className="stat">
            <h3>{stats.events !== null ? stats.events : '—'}</h3>
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

