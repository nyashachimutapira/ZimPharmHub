import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { FaBriefcase, FaBox, FaPills, FaUsers, FaNewspaper, FaCalendar } from 'react-icons/fa';
import { motion } from 'framer-motion';
import ScrollAnimation from '../components/ScrollAnimation';
import AnimatedCounter from '../components/AnimatedCounter';
import ParticleBackground from '../components/ParticleBackground';
import Typewriter from '../components/Typewriter';
import Button from '../components/Button';
import GlassCard from '../components/GlassCard';
import FloatingActionButton from '../components/FloatingActionButton';
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
        <ParticleBackground particleCount={30} />
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
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Welcome to <span className="highlight">ZimPharmHub</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <Typewriter
              texts={[
                "Your Gateway to Pharmacy Opportunities",
                "Connect with Pharmacy Professionals",
                "Discover Premium Pharmacy Products",
                "Join Zimbabwe's Pharmacy Community"
              ]}
              typeSpeed={80}
              deleteSpeed={40}
              pauseTime={3000}
            />
          </motion.p>
          <motion.div
            className="hero-buttons"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <Button variant="primary" size="large">
              <Link to="/jobs">Browse Jobs</Link>
            </Button>
            <Button variant="outline" size="large">
              <Link to="/register">Get Started</Link>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features container">
        <ScrollAnimation animation="fadeUp">
          <h2>What We Offer</h2>
        </ScrollAnimation>
        <div className="features-grid">
          <ScrollAnimation animation="fadeUp" delay={0.1}>
            <GlassCard className="feature-card">
              <motion.div
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <FaBriefcase className="feature-icon" />
                <h3>Job Opportunities</h3>
                <p>Find the latest pharmacy and dispensary assistant positions</p>
                <Link to="/jobs">Explore Jobs →</Link>
              </motion.div>
            </GlassCard>
          </ScrollAnimation>

          <ScrollAnimation animation="fadeUp" delay={0.2}>
            <GlassCard className="feature-card">
              <motion.div
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <FaBox className="feature-icon" />
                <h3>Product Listings</h3>
                <p>Browse and discover pharmacy products and services</p>
                <Link to="/products">View Products →</Link>
              </motion.div>
            </GlassCard>
          </ScrollAnimation>

          <ScrollAnimation animation="fadeUp" delay={0.3}>
            <GlassCard className="feature-card">
              <motion.div
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <FaPills className="feature-icon" />
                <h3>Pharmacy Profiles</h3>
                <p>Connect with verified pharmacies across Zimbabwe</p>
                <Link to="/pharmacies">Find Pharmacies →</Link>
              </motion.div>
            </GlassCard>
          </ScrollAnimation>

          <ScrollAnimation animation="fadeUp" delay={0.4}>
            <GlassCard className="feature-card">
              <motion.div
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <FaUsers className="feature-icon" />
                <h3>Community Forum</h3>
                <p>Network with pharmacy professionals and share experiences</p>
                <Link to="/forum">Join Forum →</Link>
              </motion.div>
            </GlassCard>
          </ScrollAnimation>

          <ScrollAnimation animation="fadeUp" delay={0.5}>
            <GlassCard className="feature-card">
              <motion.div
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <FaNewspaper className="feature-icon" />
                <h3>Resource Hub</h3>
                <p>Articles, guides, and training opportunities</p>
                <Link to="/articles">Read Resources →</Link>
              </motion.div>
            </GlassCard>
          </ScrollAnimation>

          <ScrollAnimation animation="fadeUp" delay={0.6}>
            <GlassCard className="feature-card">
              <motion.div
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <FaCalendar className="feature-icon" />
                <h3>Events Calendar</h3>
                <p>Stay updated on pharmacy events and conferences</p>
                <Link to="/events">View Events →</Link>
              </motion.div>
            </GlassCard>
          </ScrollAnimation>
        </div>

        {/* Ads carousel (featured) */}
        <ScrollAnimation animation="fadeUp" delay={0.7}>
          <div style={{ marginTop: 20 }}>
            <h3>Featured</h3>
            <div>
              {/* Lazy load with dynamic import for performance */}
              <React.Suspense fallback={<div>Loading featured ads…</div>}>
                <AdsCarouselLazy />
              </React.Suspense>
            </div>
          </div>
        </ScrollAnimation>
      </section>

      {/* Stats Section */}
      <section className="stats">
        <div className="container">
          <ScrollAnimation animation="scale" delay={0.1}>
            <div className="stat">
              <AnimatedCounter
                end={stats.jobs || 1000}
                suffix="+"
                duration={2}
              />
              <p>Active Job Listings</p>
            </div>
          </ScrollAnimation>
          <ScrollAnimation animation="scale" delay={0.2}>
            <div className="stat">
              <AnimatedCounter
                end={stats.pharmacies || 500}
                suffix="+"
                duration={2}
                delay={0.2}
              />
              <p>Registered Pharmacies</p>
            </div>
          </ScrollAnimation>
          <ScrollAnimation animation="scale" delay={0.3}>
            <div className="stat">
              <AnimatedCounter
                end={stats.members || 5000}
                suffix="+"
                duration={2}
                delay={0.4}
              />
              <p>Community Members</p>
            </div>
          </ScrollAnimation>
          <ScrollAnimation animation="scale" delay={0.4}>
            <div className="stat">
              <AnimatedCounter
                end={stats.events || 12}
                suffix="+"
                duration={2}
                delay={0.6}
              />
              <p>Monthly Events</p>
            </div>
          </ScrollAnimation>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta">
        <ScrollAnimation animation="fadeUp">
          <div className="container">
            <h2>Ready to Join ZimPharmHub?</h2>
            <p>Create an account today and unlock all features</p>
            <Button variant="primary" size="large">
              <Link to="/register">Create Account</Link>
            </Button>
          </div>
        </ScrollAnimation>
      </section>

      {/* Floating Action Button */}
      <FloatingActionButton
        icon="💊"
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        tooltip="Back to Top"
        position="bottom-right"
        variant="pharmacy"
        actions={[
          {
            id: 'jobs',
            icon: '💼',
            label: 'Browse Jobs',
            onClick: () => window.location.href = '/jobs'
          },
          {
            id: 'register',
            icon: '👤',
            label: 'Join Now',
            onClick: () => window.location.href = '/register'
          },
          {
            id: 'forum',
            icon: '💬',
            label: 'Forum',
            onClick: () => window.location.href = '/forum'
          }
        ]}
      />
    </div>
  );
}

export default HomePage;
