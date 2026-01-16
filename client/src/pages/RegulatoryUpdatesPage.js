import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { AlertCircle, Calendar, Zap } from 'react-icons/fa';

const RegulatoryUpdatesPage = () => {
  const [updates, setUpdates] = useState([]);
  const [upcomingDeadlines, setUpcomingDeadlines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    priority: '',
  });

  useEffect(() => {
    fetchUpdates();
    fetchUpcomingDeadlines();
  }, [filters]);

  const fetchUpdates = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.search) params.append('search', filters.search);
      if (filters.category) params.append('category', filters.category);
      if (filters.priority) params.append('priority', filters.priority);

      const response = await axios.get(`/api/regulatory?${params}`);
      setUpdates(response.data.data);
    } catch (error) {
      console.error('Error fetching updates:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUpcomingDeadlines = async () => {
    try {
      const response = await axios.get('/api/regulatory/upcoming/deadlines');
      setUpcomingDeadlines(response.data);
    } catch (error) {
      console.error('Error fetching deadlines:', error);
    }
  };

  const getPriorityColor = (priority) => {
    const colors = {
      low: 'bg-gray-100 text-gray-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-orange-100 text-orange-800',
      critical: 'bg-red-100 text-red-800',
    };
    return colors[priority] || 'bg-gray-100 text-gray-800';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Regulatory Updates</h1>
        <p className="text-gray-600 mb-8">Stay informed with latest pharmacy regulations and compliance requirements in Zimbabwe</p>

        {/* Upcoming Deadlines Alert */}
        {upcomingDeadlines.length > 0 && (
          <div className="bg-red-50 border-l-4 border-red-500 p-6 mb-8 rounded">
            <div className="flex items-start">
              <AlertCircle className="text-red-600 mr-4 flex-shrink-0 mt-1" size={24} />
              <div>
                <h3 className="text-lg font-bold text-red-900 mb-2">Upcoming Compliance Deadlines</h3>
                <ul className="space-y-2">
                  {upcomingDeadlines.slice(0, 3).map(update => (
                    <li key={update.id} className="text-red-800">
                      <strong>{update.title}</strong> - Due: {formatDate(update.deadline)}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              type="text"
              placeholder="Search regulations..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <select
              value={filters.category}
              onChange={(e) => setFilters({ ...filters, category: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Categories</option>
              <option value="licensing">Licensing</option>
              <option value="prescribing">Prescribing</option>
              <option value="dispensing">Dispensing</option>
              <option value="advertising">Advertising</option>
              <option value="controlled_substances">Controlled Substances</option>
              <option value="workplace">Workplace Safety</option>
            </select>
            <select
              value={filters.priority}
              onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Priorities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>

        {/* Updates List */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Loading updates...</p>
          </div>
        ) : updates.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-gray-600">No updates found</p>
          </div>
        ) : (
          <div className="space-y-6">
            {updates.map(update => (
              <div key={update.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-2xl font-bold text-gray-900">{update.title}</h3>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(update.priority)}`}>
                    {update.priority.toUpperCase()}
                  </span>
                </div>

                <p className="text-gray-600 mb-4">{update.content}</p>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
                  <div>
                    <p className="text-gray-600">Category</p>
                    <p className="text-gray-900 font-medium">{update.category}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Effective Date</p>
                    <p className="text-gray-900 font-medium">{formatDate(update.effectiveDate)}</p>
                  </div>
                  {update.deadline && (
                    <div>
                      <p className="text-gray-600">Action Deadline</p>
                      <p className="text-gray-900 font-medium">{formatDate(update.deadline)}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-gray-600">Views</p>
                    <p className="text-gray-900 font-medium">{update.views}</p>
                  </div>
                </div>

                {update.impact && (
                  <div className="bg-blue-50 p-4 rounded mb-4">
                    <p className="text-sm font-medium text-blue-900 mb-1">Impact:</p>
                    <p className="text-sm text-blue-800">{update.impact}</p>
                  </div>
                )}

                {update.actionRequired && (
                  <div className="flex items-center gap-2 mb-4 p-3 bg-yellow-50 rounded">
                    <Zap className="text-yellow-600" size={20} />
                    <span className="text-yellow-900 font-medium">Action Required</span>
                  </div>
                )}

                {update.tags && update.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {update.tags.map((tag, idx) => (
                      <span key={idx} className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RegulatoryUpdatesPage;
