import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { FaBriefcase, FaBox, FaPills, FaUsers, FaNewspaper, FaCalendar, FaSearch } from 'react-icons/fa';
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
    const [activeTab, setActiveTab] = useState('jobs');
    const [filterCategory, setFilterCategory] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        let mounted = true;
        axios.get('/api/stats')
            .then((res) => {
                if (mounted) setStats(res.data);
            })
            .catch((err) => console.error('Error fetching stats:', err));
        return () => { mounted = false; };
    }, []);

    return (
        <div className="home-page">
            {/* Hero Section - Featured Banner */}
            <section className="hero-banner">
                <ParticleBackground particleCount={30} />
                <div className="hero-overlay-banner"></div>
                <div className="hero-banner-content">
                    <motion.div
                        className="breadcrumb"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.6 }}
                    >
                        HOME &gt; JOBS &gt; FEATURED
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="banner-title"
                    >
                        Discover Zimbabwe's Premier <span className="highlight">Pharmacy Opportunities</span>
                    </motion.h1>

                    {/* Search and Filter Section */}
                    <motion.div
                        className="search-filter-section"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.4 }}
                    >
                        <div className="search-container">
                            <input
                                type="text"
                                placeholder="Search by Keyword"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="search-input"
                            />
                            <FaSearch className="search-icon" />
                        </div>

                        <div className="filter-group">
                            <select
                                className="filter-select"
                                value={filterCategory}
                                onChange={(e) => setFilterCategory(e.target.value)}
                            >
                                <option value="all">Categories</option>
                                <option value="jobs">Job Opportunities</option>
                                <option value="products">Products</option>
                                <option value="pharmacies">Pharmacies</option>
                                <option value="events">Events</option>
                            </select>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Featured Items Section */}
            <section className="featured-section">
                <div className="container">
                    <ScrollAnimation animation="fadeUp">
                        <h2 className="section-title">
                            <span className="highlight">Featured</span> Premium Opportunities in 2026
                        </h2>
                    </ScrollAnimation>

                    {/* Featured Grid */}
                    <div className="featured-grid">
                        <ScrollAnimation animation="fadeUp" delay={0.1}>
                            <motion.div
                                className="featured-card"
                                whileHover={{ y: -10 }}
                                transition={{ type: "spring", stiffness: 300 }}
                            >
                                <div className="featured-image-wrapper">
                                    <img src="/images/flags/jobs.jpg" alt="Job Opportunities" className="featured-image" />
                                    <div className="featured-overlay">
                                        <Link to="/jobs" className="featured-link">View Opportunities →</Link>
                                    </div>
                                </div>
                                <div className="featured-content">
                                    <h3>Job Opportunities</h3>
                                    <p>Latest pharmacy and dispensary positions</p>
                                </div>
                            </motion.div>
                        </ScrollAnimation>

                        <ScrollAnimation animation="fadeUp" delay={0.2}>
                            <motion.div
                                className="featured-card"
                                whileHover={{ y: -10 }}
                                transition={{ type: "spring", stiffness: 300 }}
                            >
                                <div className="featured-image-wrapper">
                                    <img src="/images/flags/products.jpg" alt="Product Listings" className="featured-image" />
                                    <div className="featured-overlay">
                                        <Link to="/products" className="featured-link">View Products →</Link>
                                    </div>
                                </div>
                                <div className="featured-content">
                                    <h3>Premium Products</h3>
                                    <p>Browse quality pharmacy products</p>
                                </div>
                            </motion.div>
                        </ScrollAnimation>

                        <ScrollAnimation animation="fadeUp" delay={0.3}>
                            <motion.div
                                className="featured-card"
                                whileHover={{ y: -10 }}
                                transition={{ type: "spring", stiffness: 300 }}
                            >
                                <div className="featured-image-wrapper">
                                    <img src="/images/flags/profile.jpg" alt="Pharmacy Profiles" className="featured-image" />
                                    <div className="featured-overlay">
                                        <Link to="/pharmacies" className="featured-link">Explore Pharmacies →</Link>
                                    </div>
                                </div>
                                <div className="featured-content">
                                    <h3>Verified Pharmacies</h3>
                                    <p>Connect with trusted partners</p>
                                </div>
                            </motion.div>
                        </ScrollAnimation>

                        <ScrollAnimation animation="fadeUp" delay={0.4}>
                            <motion.div
                                className="featured-card"
                                whileHover={{ y: -10 }}
                                transition={{ type: "spring", stiffness: 300 }}
                            >
                                <div className="featured-image-wrapper">
                                    <img src="/images/flags/community.webp" alt="Events" className="featured-image" />
                                    <div className="featured-overlay">
                                        <Link to="/events" className="featured-link">See All Events →</Link>
                                    </div>
                                </div>
                                <div className="featured-content">
                                    <h3>Upcoming Events</h3>
                                    <p>Professional conferences & webinars</p>
                                </div>
                            </motion.div>
                        </ScrollAnimation>
                    </div>

                    {/* Ads carousel (featured) */}
                    <ScrollAnimation animation="fadeUp" delay={0.5}>
                        <div className="ads-section" style={{ marginTop: '60px' }}>
                            <h3>Promoted Listings</h3>
                            <React.Suspense fallback={<div>Loading featured ads…</div>}>
                                <AdsCarouselLazy />
                            </React.Suspense>
                        </div>
                    </ScrollAnimation>
                </div>
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
