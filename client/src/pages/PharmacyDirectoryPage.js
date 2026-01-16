import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { MapPin, Phone, Globe, Star } from 'react-icons/fa';

const PharmacyDirectoryPage = () => {
  const [pharmacies, setPharmacies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    city: '',
    province: '',
    rating: 0,
  });

  useEffect(() => {
    fetchPharmacies();
  }, [filters]);

  const fetchPharmacies = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.search) params.append('search', filters.search);
      if (filters.city) params.append('city', filters.city);
      if (filters.province) params.append('province', filters.province);
      if (filters.rating) params.append('rating', filters.rating);

      const response = await axios.get(`/api/pharmacies?${params}`);
      setPharmacies(response.data.data);
    } catch (error) {
      console.error('Error fetching pharmacies:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Pharmacy Directory</h1>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <input
              type="text"
              name="search"
              placeholder="Search pharmacy..."
              value={filters.search}
              onChange={handleFilterChange}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              name="city"
              placeholder="City"
              value={filters.city}
              onChange={handleFilterChange}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              name="province"
              placeholder="Province"
              value={filters.province}
              onChange={handleFilterChange}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <select
              name="rating"
              value={filters.rating}
              onChange={handleFilterChange}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="0">All Ratings</option>
              <option value="4">4+ Stars</option>
              <option value="3">3+ Stars</option>
            </select>
          </div>
        </div>

        {/* Pharmacies Grid */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Loading pharmacies...</p>
          </div>
        ) : pharmacies.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600">No pharmacies found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pharmacies.map(pharmacy => (
              <div key={pharmacy.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6">
                {pharmacy.logoUrl && (
                  <img
                    src={pharmacy.logoUrl}
                    alt={pharmacy.pharmacyName}
                    className="w-full h-40 object-cover rounded-lg mb-4"
                  />
                )}
                <h3 className="text-xl font-bold text-gray-900 mb-2">{pharmacy.pharmacyName}</h3>
                
                <div className="flex items-center mb-2">
                  <Star className="text-yellow-400 mr-1" />
                  <span className="text-gray-700">{pharmacy.rating.toFixed(1)} ({pharmacy.totalReviews} reviews)</span>
                </div>

                <div className="flex items-start mb-2">
                  <MapPin className="text-gray-600 mr-2 mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-gray-700">{pharmacy.address}</p>
                    <p className="text-gray-600">{pharmacy.city}, {pharmacy.province}</p>
                  </div>
                </div>

                <div className="flex items-center mb-2">
                  <Phone className="text-gray-600 mr-2" />
                  <a href={`tel:${pharmacy.phoneNumber}`} className="text-blue-600 hover:underline">
                    {pharmacy.phoneNumber}
                  </a>
                </div>

                {pharmacy.website && (
                  <div className="flex items-center mb-4">
                    <Globe className="text-gray-600 mr-2" />
                    <a href={pharmacy.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                      Visit Website
                    </a>
                  </div>
                )}

                {pharmacy.services && pharmacy.services.length > 0 && (
                  <div className="mb-4">
                    <p className="text-sm font-semibold text-gray-700 mb-2">Services:</p>
                    <div className="flex flex-wrap gap-2">
                      {pharmacy.services.map((service, idx) => (
                        <span key={idx} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                          {service}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <button className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors">
                  View Details
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PharmacyDirectoryPage;
