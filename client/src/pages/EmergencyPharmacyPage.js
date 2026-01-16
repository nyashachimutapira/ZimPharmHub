import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaMapMarkerAlt, FaPhone, FaClock, FaCheckCircle, FaExclamationTriangle, FaPhoneAlt } from 'react-icons/fa';
import { motion } from 'framer-motion';
import ScrollAnimation from '../components/ScrollAnimation';
import './EmergencyPharmacyPage.css';

function EmergencyPharmacyPage() {
  const [pharmacies, setPharmacies] = useState([]);
  const [filteredPharmacies, setFilteredPharmacies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState(null);
  const [filterMode, setFilterMode] = useState('24hour'); // 24hour or open-now
  const [selectedPharmacy, setSelectedPharmacy] = useState(null);

  useEffect(() => {
    fetchPharmacies();
    getUserLocation();
  }, []);

  useEffect(() => {
    filterPharmacies();
  }, [pharmacies, filterMode]);

  const fetchPharmacies = async () => {
    try {
      const response = await axios.get('/api/pharmacies');
      setPharmacies(response.data || []);
    } catch (error) {
      console.error('Error fetching pharmacies:', error);
    } finally {
      setLoading(false);
    }
  };

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.log('Geolocation not available:', error);
        }
      );
    }
  };

  const filterPharmacies = () => {
    let filtered = [...pharmacies];

    if (filterMode === '24hour') {
      filtered = filtered.filter(p => p.is24Hours || p.hours?.includes('24'));
    } else if (filterMode === 'open-now') {
      const now = new Date();
      const currentHour = now.getHours();
      filtered = filtered.filter(p => {
        if (p.is24Hours) return true;
        if (!p.openingHour || !p.closingHour) return false;
        return currentHour >= p.openingHour && currentHour < p.closingHour;
      });
    }

    // Sort by distance if location available
    if (userLocation) {
      filtered.sort((a, b) => {
        const distA = calculateDistance(userLocation, { lat: a.latitude, lng: a.longitude });
        const distB = calculateDistance(userLocation, { lat: b.latitude, lng: b.longitude });
        return distA - distB;
      });
    }

    setFilteredPharmacies(filtered);
  };

  const calculateDistance = (point1, point2) => {
    // Haversine formula (simplified)
    const lat1 = point1.lat;
    const lon1 = point1.lng;
    const lat2 = point2.lat;
    const lon2 = point2.lng;

    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const isOpen24Hours = (pharmacy) => pharmacy.is24Hours || pharmacy.hours?.includes('24');

  const getOpenStatus = (pharmacy) => {
    if (isOpen24Hours(pharmacy)) return { status: 'open-24', label: '24/7 Open', color: '#4caf50' };
    
    const now = new Date();
    const currentHour = now.getHours();
    
    if (pharmacy.openingHour && pharmacy.closingHour) {
      const isOpen = currentHour >= pharmacy.openingHour && currentHour < pharmacy.closingHour;
      return {
        status: isOpen ? 'open' : 'closed',
        label: isOpen ? 'Open Now' : 'Closed',
        color: isOpen ? '#4caf50' : '#f44336'
      };
    }
    
    return { status: 'unknown', label: 'Hours Unknown', color: '#999' };
  };

  const handleEmergencyCall = (phone) => {
    window.location.href = `tel:${phone}`;
  };

  return (
    <div className="emergency-pharmacy-page">
      {/* Hero Section */}
      <section className="emergency-hero">
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <motion.div
            className="emergency-badge"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            🚨 EMERGENCY
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            Find <span className="highlight">24/7 Pharmacies</span> Now
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Locate open pharmacies in your area for urgent medicine needs
          </motion.p>
        </div>
      </section>

      <div className="container">
        {/* Filter Tabs */}
        <section className="filter-tabs">
          <ScrollAnimation animation="fadeUp">
            <div className="tab-buttons">
              <motion.button
                className={`tab-btn ${filterMode === '24hour' ? 'active' : ''}`}
                onClick={() => setFilterMode('24hour')}
                whileHover={{ scale: 1.05 }}
              >
                <FaClock /> 24/7 Pharmacies
              </motion.button>
              <motion.button
                className={`tab-btn ${filterMode === 'open-now' ? 'active' : ''}`}
                onClick={() => setFilterMode('open-now')}
                whileHover={{ scale: 1.05 }}
              >
                <FaCheckCircle /> Open Now
              </motion.button>
            </div>
            <p className="filter-info">
              {userLocation && (
                <FaMapMarkerAlt className="inline-icon" /> 
              )}
              Showing {filteredPharmacies.length} pharmacies
              {filterMode === '24hour' ? ' open 24/7' : ' currently open'}
            </p>
          </ScrollAnimation>
        </section>

        {/* Pharmacies List */}
        {loading ? (
          <div className="loading">
            <div className="spinner"></div>
            <p>Finding pharmacies...</p>
          </div>
        ) : filteredPharmacies.length === 0 ? (
          <div className="no-results">
            <FaExclamationTriangle className="warning-icon" />
            <h3>No {filterMode === '24hour' ? '24/7' : 'open'} pharmacies found</h3>
            <p>Try adjusting your filters or check back later</p>
          </div>
        ) : (
          <section className="pharmacies-emergency">
            {filteredPharmacies.map((pharmacy, index) => {
              const status = getOpenStatus(pharmacy);
              const distance = userLocation ? 
                calculateDistance(userLocation, { lat: pharmacy.latitude, lng: pharmacy.longitude }) :
                null;

              return (
                <motion.div
                  key={pharmacy.id || index}
                  className="emergency-pharmacy-card"
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                >
                  {/* Status Badge */}
                  <div 
                    className="status-badge"
                    style={{ backgroundColor: status.color }}
                  >
                    {status.label}
                  </div>

                  {/* Pharmacy Info */}
                  <div className="pharmacy-main-info">
                    <div className="pharmacy-header">
                      <h3>{pharmacy.name}</h3>
                      {pharmacy.verified && (
                        <FaCheckCircle className="verified-icon" title="Verified Pharmacy" />
                      )}
                    </div>

                    {/* Details Grid */}
                    <div className="details-grid">
                      {/* Location */}
                      <div className="detail-item">
                        <FaMapMarkerAlt className="icon" />
                        <div className="detail-content">
                          <p className="detail-label">Location</p>
                          <p className="detail-value">{pharmacy.city}, {pharmacy.province || 'Zimbabwe'}</p>
                          {distance && <p className="distance">{distance.toFixed(1)} km away</p>}
                        </div>
                      </div>

                      {/* Phone */}
                      <div className="detail-item">
                        <FaPhone className="icon" />
                        <div className="detail-content">
                          <p className="detail-label">Emergency Call</p>
                          <p className="detail-value">{pharmacy.phone}</p>
                        </div>
                      </div>

                      {/* Hours */}
                      <div className="detail-item">
                        <FaClock className="icon" />
                        <div className="detail-content">
                          <p className="detail-label">Hours</p>
                          <p className="detail-value">
                            {isOpen24Hours(pharmacy) ? 
                              'Open 24/7' : 
                              `${pharmacy.openingHour || 'N/A'} - ${pharmacy.closingHour || 'N/A'}`
                            }
                          </p>
                        </div>
                      </div>

                      {/* Services */}
                      {pharmacy.services && pharmacy.services.length > 0 && (
                        <div className="detail-item services">
                          <div className="detail-content">
                            <p className="detail-label">Services</p>
                            <div className="service-list">
                              {pharmacy.services.slice(0, 3).map((service, i) => (
                                <span key={i} className="service-badge">{service}</span>
                              ))}
                              {pharmacy.services.length > 3 && (
                                <span className="service-badge">+{pharmacy.services.length - 3}</span>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="pharmacy-actions">
                    <button
                      className="btn-call"
                      onClick={() => handleEmergencyCall(pharmacy.phone)}
                    >
                      <FaPhoneAlt /> CALL NOW
                    </button>
                    <button
                      className="btn-details"
                      onClick={() => setSelectedPharmacy(pharmacy)}
                    >
                      View Details
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </section>
        )}

        {/* Quick Tips */}
        <section className="emergency-tips">
          <ScrollAnimation animation="fadeUp">
            <h3>Emergency Pharmacy Tips</h3>
            <div className="tips-grid">
              <div className="tip-card">
                <div className="tip-icon">📍</div>
                <h4>Know Your Location</h4>
                <p>Enable location access for nearest pharmacy suggestions</p>
              </div>
              <div className="tip-card">
                <div className="tip-icon">💊</div>
                <h4>Have Your Prescription</h4>
                <p>Keep prescriptions handy for faster service</p>
              </div>
              <div className="tip-card">
                <div className="tip-icon">📞</div>
                <h4>Call Ahead</h4>
                <p>Always call before visiting to confirm availability</p>
              </div>
              <div className="tip-card">
                <div className="tip-icon">💳</div>
                <h4>Payment Options</h4>
                <p>Ask about payment methods when calling</p>
              </div>
            </div>
          </ScrollAnimation>
        </section>
      </div>

      {/* Detail Modal */}
      {selectedPharmacy && (
        <div className="modal-overlay" onClick={() => setSelectedPharmacy(null)}>
          <motion.div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
          >
            <button
              className="modal-close"
              onClick={() => setSelectedPharmacy(null)}
            >
              ✕
            </button>
            
            <h2>{selectedPharmacy.name}</h2>
            
            <div className="modal-details">
              <div className="modal-detail">
                <strong>Address:</strong>
                <p>{selectedPharmacy.city}, {selectedPharmacy.province}</p>
              </div>
              <div className="modal-detail">
                <strong>Phone:</strong>
                <a href={`tel:${selectedPharmacy.phone}`}>{selectedPharmacy.phone}</a>
              </div>
              <div className="modal-detail">
                <strong>Hours:</strong>
                <p>{isOpen24Hours(selectedPharmacy) ? 'Open 24/7' : `${selectedPharmacy.openingHour} - ${selectedPharmacy.closingHour}`}</p>
              </div>
              {selectedPharmacy.email && (
                <div className="modal-detail">
                  <strong>Email:</strong>
                  <a href={`mailto:${selectedPharmacy.email}`}>{selectedPharmacy.email}</a>
                </div>
              )}
            </div>

            <button
              className="modal-call-btn"
              onClick={() => handleEmergencyCall(selectedPharmacy.phone)}
            >
              <FaPhoneAlt /> Emergency Call
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
}

export default EmergencyPharmacyPage;
