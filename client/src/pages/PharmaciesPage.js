import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './PharmaciesPage.css';

function PharmaciesPage() {
  const [pharmacies, setPharmacies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPharmacies();
  }, []);

  const fetchPharmacies = async () => {
    try {
      const response = await axios.get('/api/pharmacies');
      setPharmacies(response.data);
    } catch (error) {
      console.error('Error fetching pharmacies:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pharmacies-page">
      <div className="container">
        <h1>Find Pharmacies</h1>
        {loading ? (
          <p>Loading pharmacies...</p>
        ) : (
          <div className="pharmacies-grid">
            {pharmacies.map((pharmacy) => (
              <div key={pharmacy._id} className="pharmacy-card">
                <div className="pharmacy-logo"></div>
                <h3>{pharmacy.name}</h3>
                <p className="pharmacy-location">{pharmacy.city}, {pharmacy.province}</p>
                <p className="pharmacy-phone">{pharmacy.phone}</p>
                <div className="pharmacy-rating">★ {pharmacy.ratings || 0} ({pharmacy.totalReviews || 0} reviews)</div>
                <button className="btn btn-secondary">View Profile</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default PharmaciesPage;
