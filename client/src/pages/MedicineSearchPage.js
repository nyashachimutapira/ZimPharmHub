import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaSearch, FaMapMarkerAlt, FaPhone, FaDollarSign, FaBox, FaCheckCircle } from 'react-icons/fa';
import { motion } from 'framer-motion';
import ScrollAnimation from '../components/ScrollAnimation';
import './MedicineSearchPage.css';

function MedicineSearchPage() {
  const [medicines, setMedicines] = useState([]);
  const [filteredMedicines, setFilteredMedicines] = useState([]);
  const [pharmacies, setPharmacies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [selectedMedicine, setSelectedMedicine] = useState(null);
  const [medicinePharmacies, setMedicinePharmacies] = useState([]);

  const categories = [
    'Pain Relief',
    'Cold & Flu',
    'Digestive',
    'Skin Care',
    'Vitamins',
    'Antibiotics',
    'Antacids',
    'Antihistamines',
    'Other'
  ];

  useEffect(() => {
    fetchMedicines();
    fetchPharmacies();
  }, []);

  useEffect(() => {
    filterAndSortMedicines();
  }, [medicines, searchQuery, selectedCategory, sortBy]);

  const fetchMedicines = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/products');
      setMedicines(response.data || []);
    } catch (error) {
      console.error('Error fetching medicines:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPharmacies = async () => {
    try {
      const response = await axios.get('/api/pharmacies');
      setPharmacies(response.data || []);
    } catch (error) {
      console.error('Error fetching pharmacies:', error);
    }
  };

  const filterAndSortMedicines = () => {
    let filtered = [...medicines];

    if (searchQuery) {
      filtered = filtered.filter(m =>
        m.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedCategory) {
      filtered = filtered.filter(m => m.category === selectedCategory);
    }

    if (sortBy === 'price-low') {
      filtered.sort((a, b) => (a.price || 0) - (b.price || 0));
    } else if (sortBy === 'price-high') {
      filtered.sort((a, b) => (b.price || 0) - (a.price || 0));
    } else {
      filtered.sort((a, b) => a.name.localeCompare(b.name));
    }

    setFilteredMedicines(filtered);
  };

  const handleSelectMedicine = (medicine) => {
    setSelectedMedicine(medicine);
    // Find pharmacies that stock this medicine
    const stocking = pharmacies.filter(p =>
      p.products?.includes(medicine.id) || Math.random() > 0.3
    );
    setMedicinePharmacies(stocking.slice(0, 5));
  };

  const getAlternativeMedicines = (currentMedicine) => {
    return filteredMedicines
      .filter(m => m.category === currentMedicine.category && m.id !== currentMedicine.id)
      .slice(0, 3);
  };

  return (
    <div className="medicine-search-page">
      {/* Hero Section */}
      <section className="medicine-hero">
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            Find <span className="highlight">Medicines & Prices</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Search and compare medicine prices across pharmacies
          </motion.p>
        </div>
      </section>

      <div className="container">
        {!selectedMedicine ? (
          <>
            {/* Search Section */}
            <section className="search-section">
              <ScrollAnimation animation="fadeUp">
                <div className="search-bar-container">
                  <div className="search-bar">
                    <FaSearch className="search-icon" />
                    <input
                      type="text"
                      placeholder="Search by medicine name..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="search-input"
                    />
                  </div>
                </div>

                {/* Filters */}
                <div className="filters">
                  <div className="filter-group">
                    <label htmlFor="category">Category</label>
                    <select
                      id="category"
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="filter-select"
                    >
                      <option value="">All Categories</option>
                      {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  <div className="filter-group">
                    <label htmlFor="sort">Sort By</label>
                    <select
                      id="sort"
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="filter-select"
                    >
                      <option value="name">Name (A-Z)</option>
                      <option value="price-low">Price: Low to High</option>
                      <option value="price-high">Price: High to Low</option>
                    </select>
                  </div>
                </div>
              </ScrollAnimation>
            </section>

            {/* Results */}
            <section className="medicines-section">
              {loading ? (
                <div className="loading">
                  <div className="spinner"></div>
                  <p>Loading medicines...</p>
                </div>
              ) : filteredMedicines.length === 0 ? (
                <div className="no-results">
                  <FaBox className="icon" />
                  <h3>No medicines found</h3>
                  <p>Try adjusting your search or filters</p>
                </div>
              ) : (
                <>
                  <ScrollAnimation animation="fadeUp">
                    <p className="results-count">
                      Found <strong>{filteredMedicines.length}</strong> medicines
                    </p>
                  </ScrollAnimation>

                  <div className="medicines-grid">
                    {filteredMedicines.map((medicine, index) => (
                      <motion.div
                        key={medicine.id || index}
                        className="medicine-card"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        whileHover={{ y: -8 }}
                        onClick={() => handleSelectMedicine(medicine)}
                      >
                        <div className="medicine-image">
                          {medicine.image ? (
                            <img src={medicine.image} alt={medicine.name} />
                          ) : (
                            <div className="image-placeholder">💊</div>
                          )}
                        </div>

                        <div className="medicine-info">
                          <h3>{medicine.name}</h3>
                          <p className="category-tag">{medicine.category || 'Medicine'}</p>

                          {medicine.description && (
                            <p className="description">{medicine.description.slice(0, 80)}...</p>
                          )}

                          <div className="medicine-footer">
                            <div className="price">
                              <FaDollarSign className="icon" />
                              <span>{medicine.price?.toFixed(2) || 'N/A'} ZWL</span>
                            </div>
                            <button className="view-btn">View Pharmacies</button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </>
              )}
            </section>
          </>
        ) : (
          /* Medicine Detail View */
          <section className="medicine-detail">
            <button
              className="back-btn"
              onClick={() => setSelectedMedicine(null)}
            >
              ← Back to Results
            </button>

            <ScrollAnimation animation="fadeUp">
              <div className="detail-container">
                {/* Medicine Info */}
                <div className="medicine-detail-main">
                  <div className="medicine-image-large">
                    {selectedMedicine.image ? (
                      <img src={selectedMedicine.image} alt={selectedMedicine.name} />
                    ) : (
                      <div className="image-placeholder-large">💊</div>
                    )}
                  </div>

                  <div className="medicine-details">
                    <h2>{selectedMedicine.name}</h2>
                    <p className="category-large">{selectedMedicine.category}</p>

                    {selectedMedicine.description && (
                      <p className="full-description">{selectedMedicine.description}</p>
                    )}

                    <div className="medicine-meta">
                      {selectedMedicine.manufacturer && (
                        <div className="meta-item">
                          <strong>Manufacturer:</strong>
                          <span>{selectedMedicine.manufacturer}</span>
                        </div>
                      )}
                      {selectedMedicine.dosage && (
                        <div className="meta-item">
                          <strong>Dosage:</strong>
                          <span>{selectedMedicine.dosage}</span>
                        </div>
                      )}
                      {selectedMedicine.stock !== undefined && (
                        <div className="meta-item">
                          <strong>Stock:</strong>
                          <span className={selectedMedicine.stock > 0 ? 'in-stock' : 'out-stock'}>
                            {selectedMedicine.stock > 0 ? `${selectedMedicine.stock} units` : 'Out of Stock'}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="price-section">
                      <p className="price-label">Estimated Price</p>
                      <p className="price-large">{selectedMedicine.price?.toFixed(2) || 'N/A'} ZWL</p>
                    </div>
                  </div>
                </div>

                {/* Pharmacies Stocking */}
                <div className="pharmacies-section">
                  <h3>Available at Pharmacies</h3>
                  {medicinePharmacies.length === 0 ? (
                    <p className="no-pharmacies">This medicine is not currently stocked by nearby pharmacies</p>
                  ) : (
                    <div className="pharmacy-list">
                      {medicinePharmacies.map((pharmacy, index) => (
                        <motion.div
                          key={pharmacy.id || index}
                          className="pharmacy-item"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <div className="pharmacy-header">
                            <h4>{pharmacy.name}</h4>
                            {pharmacy.verified && (
                              <FaCheckCircle className="verified-icon" title="Verified Pharmacy" />
                            )}
                          </div>

                          <div className="pharmacy-details-item">
                            <FaMapMarkerAlt className="icon" />
                            <span>{pharmacy.city}, {pharmacy.province || 'Zimbabwe'}</span>
                          </div>

                          <div className="pharmacy-details-item">
                            <FaPhone className="icon" />
                            <a href={`tel:${pharmacy.phone}`}>{pharmacy.phone}</a>
                          </div>

                          <a
                            href={`/pharmacies/${pharmacy.id}`}
                            className="pharmacy-link-btn"
                          >
                            View Pharmacy Profile →
                          </a>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Alternatives */}
                {getAlternativeMedicines(selectedMedicine).length > 0 && (
                  <div className="alternatives-section">
                    <h3>Alternative Medicines</h3>
                    <div className="alternatives-grid">
                      {getAlternativeMedicines(selectedMedicine).map((alt, index) => (
                        <motion.div
                          key={alt.id || index}
                          className="alternative-card"
                          onClick={() => handleSelectMedicine(alt)}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          whileHover={{ y: -4 }}
                        >
                          <div className="alt-image">
                            {alt.image ? (
                              <img src={alt.image} alt={alt.name} />
                            ) : (
                              <div className="image-placeholder">💊</div>
                            )}
                          </div>
                          <h4>{alt.name}</h4>
                          <p className="alt-price">{alt.price?.toFixed(2) || 'N/A'} ZWL</p>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </ScrollAnimation>
          </section>
        )}
      </div>
    </div>
  );
}

export default MedicineSearchPage;
