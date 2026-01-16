import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { FaSearch, FaMapMarkerAlt, FaPhone, FaEnvelope, FaStar, FaHeart, FaRegHeart, FaClock, FaCheck, FaFilter } from 'react-icons/fa';
import { motion } from 'framer-motion';
import ScrollAnimation from '../components/ScrollAnimation';
import './PharmaciesPage.css';

function PharmaciesPage() {
    const [pharmacies, setPharmacies] = useState([]);
    const [filteredPharmacies, setFilteredPharmacies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [favorites, setFavorites] = useState([]);
    const [viewMode, setViewMode] = useState('grid'); // grid or list
    const [showFilters, setShowFilters] = useState(false);

    // Filter state
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCity, setSelectedCity] = useState('');
    const [selectedService, setSelectedService] = useState('');
    const [sortBy, setSortBy] = useState('name');

    // Get unique cities and services for dropdowns
    const cities = [...new Set(pharmacies.map(p => p.city || 'Unknown'))].sort();
    const services = [
        'Prescription Filling',
        'Consultation',
        'Vaccinations',
        'Health Testing',
        'Delivery Available',
        '24/7 Service'
    ];

    useEffect(() => {
        fetchPharmacies();
        loadFavorites();
    }, []);

    useEffect(() => {
        filterAndSortPharmacies();
    }, [pharmacies, searchQuery, selectedCity, selectedService, sortBy, favorites]);

    const fetchPharmacies = async () => {
        try {
            const response = await axios.get('/api/pharmacies');
            setPharmacies(response.data || []);
        } catch (error) {
            console.error('Error fetching pharmacies:', error);
            setPharmacies([]);
        } finally {
            setLoading(false);
        }
    };

    const loadFavorites = () => {
        const saved = localStorage.getItem('favoritedPharmacies');
        if (saved) {
            setFavorites(JSON.parse(saved));
        }
    };

    const toggleFavorite = (pharmacyId) => {
        let updated = [...favorites];
        if (updated.includes(pharmacyId)) {
            updated = updated.filter(id => id !== pharmacyId);
        } else {
            updated.push(pharmacyId);
        }
        setFavorites(updated);
        localStorage.setItem('favoritedPharmacies', JSON.stringify(updated));
    };

    const filterAndSortPharmacies = () => {
        let filtered = [...pharmacies];

        // Search filter
        if (searchQuery) {
            filtered = filtered.filter(p =>
                p.name.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        // City filter
        if (selectedCity) {
            filtered = filtered.filter(p => p.city === selectedCity);
        }

        // Service filter
        if (selectedService) {
            filtered = filtered.filter(p => {
                const services = p.services || [];
                return services.includes(selectedService);
            });
        }

        // Sort
        if (sortBy === 'rating') {
            filtered.sort((a, b) => (b.ratings || 0) - (a.ratings || 0));
        } else if (sortBy === 'newest') {
            filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        } else {
            filtered.sort((a, b) => a.name.localeCompare(b.name));
        }

        setFilteredPharmacies(filtered);
    };

    const clearFilters = () => {
        setSearchQuery('');
        setSelectedCity('');
        setSelectedService('');
        setSortBy('name');
    };

    const hasActiveFilters = searchQuery || selectedCity || selectedService || sortBy !== 'name';

    return (
        <div className="pharmacies-page">
            {/* Hero Section */}
            <section className="pharmacies-hero">
                <div className="hero-overlay"></div>
                <div className="hero-content">
                    <motion.h1
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        Find <span className="highlight">Trusted Pharmacies</span> Near You
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                    >
                        Connect with verified pharmacies across Zimbabwe
                    </motion.p>
                </div>
            </section>

            <div className="container">
                {/* Search Section */}
                <section className="search-section">
                    <div className="search-wrapper">
                        <div className="search-bar">
                            <FaSearch className="search-icon" />
                            <input
                                type="text"
                                placeholder="Search pharmacies by name..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="search-input"
                            />
                        </div>
                        <button
                            className="filter-toggle"
                            onClick={() => setShowFilters(!showFilters)}
                        >
                            <FaFilter /> Filters
                        </button>
                    </div>

                    {/* Filter Panel */}
                    <motion.div
                        className="filter-panel"
                        initial={false}
                        animate={{ height: showFilters ? 'auto' : 0 }}
                        transition={{ duration: 0.3 }}
                        style={{ overflow: 'hidden' }}
                    >
                        <div className="filter-content">
                            <div className="filter-group">
                                <label htmlFor="city-filter">Location</label>
                                <select
                                    id="city-filter"
                                    value={selectedCity}
                                    onChange={(e) => setSelectedCity(e.target.value)}
                                    className="filter-select"
                                >
                                    <option value="">All Cities</option>
                                    {cities.map(city => (
                                        <option key={city} value={city}>{city}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="filter-group">
                                <label htmlFor="service-filter">Services</label>
                                <select
                                    id="service-filter"
                                    value={selectedService}
                                    onChange={(e) => setSelectedService(e.target.value)}
                                    className="filter-select"
                                >
                                    <option value="">All Services</option>
                                    {services.map(service => (
                                        <option key={service} value={service}>{service}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="filter-group">
                                <label htmlFor="sort-filter">Sort By</label>
                                <select
                                    id="sort-filter"
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="filter-select"
                                >
                                    <option value="name">Name (A-Z)</option>
                                    <option value="rating">Highest Rated</option>
                                    <option value="newest">Newest Added</option>
                                </select>
                            </div>

                            {hasActiveFilters && (
                                <button className="clear-filters" onClick={clearFilters}>
                                    Clear All Filters
                                </button>
                            )}
                        </div>
                    </motion.div>

                    {/* View Mode Toggle */}
                    <div className="view-mode">
                        <button
                            className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                            onClick={() => setViewMode('grid')}
                            title="Grid view"
                        >
                            ⊞
                        </button>
                        <button
                            className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
                            onClick={() => setViewMode('list')}
                            title="List view"
                        >
                            ☰
                        </button>
                    </div>
                </section>

                {/* Results Count */}
                <div className="results-info">
                    <p>Showing <strong>{filteredPharmacies.length}</strong> of <strong>{pharmacies.length}</strong> pharmacies</p>
                </div>

                {/* Pharmacies Grid/List */}
                {loading ? (
                    <div className="loading">
                        <div className="spinner"></div>
                        <p>Loading pharmacies...</p>
                    </div>
                ) : filteredPharmacies.length === 0 ? (
                    <div className="no-results">
                        <h3>No pharmacies found</h3>
                        <p>Try adjusting your filters or search terms</p>
                        <button className="btn-primary" onClick={clearFilters}>
                            Clear Filters
                        </button>
                    </div>
                ) : (
                    <motion.div
                        className={`pharmacies-${viewMode}`}
                        layout
                    >
                        {filteredPharmacies.map((pharmacy, index) => (
                            <motion.div
                                key={pharmacy._id || index}
                                className={`pharmacy-card ${viewMode}`}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                whileHover={{ y: -8 }}
                            >
                                {/* Verified Badge */}
                                {pharmacy.verified && (
                                    <div className="verified-badge">
                                        <FaCheck /> Verified
                                    </div>
                                )}

                                {/* Favorite Button */}
                                <button
                                    className="favorite-btn"
                                    onClick={() => toggleFavorite(pharmacy._id)}
                                >
                                    {favorites.includes(pharmacy._id) ? (
                                        <FaHeart />
                                    ) : (
                                        <FaRegHeart />
                                    )}
                                </button>

                                {/* Pharmacy Logo/Image */}
                                <div className="pharmacy-image">
                                    {pharmacy.logo ? (
                                        <img src={pharmacy.logo} alt={pharmacy.name} />
                                    ) : (
                                        <div className="logo-placeholder">💊</div>
                                    )}
                                </div>

                                {/* Pharmacy Info */}
                                <div className="pharmacy-info">
                                    <h3>{pharmacy.name}</h3>

                                    {/* Rating */}
                                    <div className="rating">
                                        <div className="stars">
                                            {[...Array(5)].map((_, i) => (
                                                <FaStar
                                                    key={i}
                                                    className={i < Math.round(pharmacy.ratings || 0) ? 'filled' : ''}
                                                />
                                            ))}
                                        </div>
                                        <span className="rating-text">
                                            {pharmacy.ratings || 0} ({pharmacy.totalReviews || 0} reviews)
                                        </span>
                                    </div>

                                    {/* Location */}
                                    <div className="info-item">
                                        <FaMapMarkerAlt className="icon" />
                                        <span>{pharmacy.city}, {pharmacy.province || 'Zimbabwe'}</span>
                                    </div>

                                    {/* Phone */}
                                    <div className="info-item">
                                        <FaPhone className="icon" />
                                        <a href={`tel:${pharmacy.phone}`}>{pharmacy.phone}</a>
                                    </div>

                                    {/* Email */}
                                    {pharmacy.email && (
                                        <div className="info-item">
                                            <FaEnvelope className="icon" />
                                            <a href={`mailto:${pharmacy.email}`}>{pharmacy.email}</a>
                                        </div>
                                    )}

                                    {/* Hours */}
                                    {pharmacy.hours && (
                                        <div className="info-item">
                                            <FaClock className="icon" />
                                            <span className={pharmacy.isOpen ? 'open' : 'closed'}>
                                                {pharmacy.isOpen ? '🟢 Open now' : '🔴 Closed'}
                                            </span>
                                        </div>
                                    )}

                                    {/* Services */}
                                    {pharmacy.services && pharmacy.services.length > 0 && (
                                        <div className="services">
                                            <h4>Services:</h4>
                                            <div className="service-tags">
                                                {pharmacy.services.slice(0, 3).map((service, i) => (
                                                    <span key={i} className="service-tag">{service}</span>
                                                ))}
                                                {pharmacy.services.length > 3 && (
                                                    <span className="service-tag">+{pharmacy.services.length - 3}</span>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Action Buttons */}
                                <div className="pharmacy-actions">
                                    <Link
                                        to={`/pharmacies/${pharmacy._id}`}
                                        className="btn btn-primary"
                                    >
                                        View Profile
                                    </Link>
                                    <a
                                        href={`https://wa.me/${pharmacy.phone.replace(/\D/g, '')}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="btn btn-secondary"
                                    >
                                        WhatsApp
                                    </a>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                )}
            </div>

            {/* CTA Section */}
            {pharmacies.length > 0 && (
                <section className="pharmacy-cta">
                    <div className="container">
                        <ScrollAnimation animation="fadeUp">
                            <div className="cta-content">
                                <h2>Is your pharmacy not listed?</h2>
                                <p>Join thousands of pharmacies connecting with customers on ZimPharmHub</p>
                                <Link to="/register" className="btn btn-primary">
                                    Register Your Pharmacy
                                </Link>
                            </div>
                        </ScrollAnimation>
                    </div>
                </section>
            )}
        </div>
    );
}

export default PharmaciesPage;
