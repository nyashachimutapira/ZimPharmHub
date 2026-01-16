import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaStar, FaUsers, FaClock, FaDollarSign } from 'react-icons/fa';

const MentorshipPage = () => {
  const [mentorships, setMentorships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('browse');
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (activeTab === 'browse') {
      fetchMentors();
    } else {
      fetchMyMentorships();
    }
  }, [activeTab]);

  const fetchMentors = async () => {
    try {
      setLoading(true);
      const params = search ? `?search=${search}` : '';
      const response = await axios.get(`/api/mentorship/mentors${params}`);
      setMentorships(response.data.data);
    } catch (error) {
      console.error('Error fetching mentors:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMyMentorships = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/mentorship/my', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setMentorships(response.data);
    } catch (error) {
      console.error('Error fetching mentorships:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async (mentorshipId) => {
    try {
      alert('Mentor connection request sent!');
    } catch (error) {
      alert('Error connecting with mentor');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Mentorship Marketplace</h1>
        <p className="text-gray-600 mb-8">Connect with experienced pharmacists for guidance and development</p>

        {/* Tabs */}
        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setActiveTab('browse')}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'browse'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            Browse Mentors
          </button>
          <button
            onClick={() => setActiveTab('my')}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'my'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            My Mentorships
          </button>
        </div>

        {/* Search */}
        {activeTab === 'browse' && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <input
              type="text"
              placeholder="Search mentors..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && fetchMentors()}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        )}

        {/* Content */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Loading...</p>
          </div>
        ) : mentorships.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <p className="text-gray-600">No {activeTab === 'browse' ? 'mentors' : 'mentorships'} found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mentorships.map(m => (
              <div key={m.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">{m.title}</h3>
                
                {m.rating && (
                  <div className="flex items-center mb-2">
                    <FaStar className="text-yellow-400 mr-1" />
                    <span className="text-gray-700">{m.rating.toFixed(1)}</span>
                  </div>
                )}

                <p className="text-gray-600 text-sm mb-4">{m.description.substring(0, 100)}...</p>

                <div className="space-y-2 mb-4 text-sm text-gray-700">
                  {m.duration && (
                    <div className="flex items-center">
                      <FaClock className="mr-2 text-blue-600" />
                      <span>{m.duration}</span>
                    </div>
                  )}
                  {m.price && (
                    <div className="flex items-center">
                      <FaDollarSign className="mr-2 text-blue-600" />
                      <span>{m.price} {m.currency}</span>
                    </div>
                  )}
                </div>

                {m.focusAreas && (
                  <div className="mb-4">
                    <p className="text-xs font-semibold text-gray-700 mb-2">Focus Areas:</p>
                    <div className="flex flex-wrap gap-2">
                      {Array.isArray(m.focusAreas) && m.focusAreas.map((area, idx) => (
                        <span key={idx} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                          {area}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <button
                  onClick={() => handleConnect(m.id)}
                  className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {activeTab === 'browse' ? 'Connect' : 'View Details'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MentorshipPage;
