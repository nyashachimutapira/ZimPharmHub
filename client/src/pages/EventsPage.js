import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Calendar, MapPin, Users, DollarSign } from 'react-icons/fa';

const EventsPage = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    city: '',
    eventType: '',
  });

  useEffect(() => {
    fetchEvents();
  }, [filters]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.search) params.append('search', filters.search);
      if (filters.city) params.append('city', filters.city);
      if (filters.eventType) params.append('eventType', filters.eventType);

      const response = await axios.get(`/api/events?${params}`);
      setEvents(response.data.data);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const registerEvent = async (eventId) => {
    try {
      await axios.post(`/api/events/${eventId}/register`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      alert('Registered successfully!');
    } catch (error) {
      alert('Error registering: ' + error.response?.data?.message);
    }
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
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Events & Workshops</h1>
        <p className="text-gray-600 mb-8">Discover pharmacist conferences, training sessions, and networking events</p>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              type="text"
              name="search"
              placeholder="Search events..."
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
            <select
              name="eventType"
              value={filters.eventType}
              onChange={handleFilterChange}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Event Types</option>
              <option value="conference">Conference</option>
              <option value="workshop">Workshop</option>
              <option value="seminar">Seminar</option>
              <option value="training">Training</option>
              <option value="networking">Networking</option>
            </select>
          </div>
        </div>

        {/* Events List */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Loading events...</p>
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <p className="text-gray-600">No events found</p>
          </div>
        ) : (
          <div className="space-y-6">
            {events.map(event => (
              <div key={event.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden">
                <div className="flex flex-col md:flex-row">
                  {event.imageUrl && (
                    <img
                      src={event.imageUrl}
                      alt={event.title}
                      className="w-full md:w-64 h-64 md:h-auto object-cover"
                    />
                  )}
                  <div className="flex-1 p-6">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-2xl font-bold text-gray-900">{event.title}</h3>
                      <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                        {event.eventType}
                      </span>
                    </div>

                    <p className="text-gray-600 mb-4">{event.description.substring(0, 150)}...</p>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
                      <div className="flex items-center">
                        <Calendar className="mr-2 text-blue-600" />
                        <div>
                          <p className="text-xs text-gray-600">Dates</p>
                          <p className="text-gray-900">{formatDate(event.startDate)}</p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <MapPin className="mr-2 text-blue-600" />
                        <div>
                          <p className="text-xs text-gray-600">Location</p>
                          <p className="text-gray-900">{event.city}</p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <Users className="mr-2 text-blue-600" />
                        <div>
                          <p className="text-xs text-gray-600">Attendees</p>
                          <p className="text-gray-900">{event.attendeesCount}</p>
                        </div>
                      </div>
                      {event.price > 0 && (
                        <div className="flex items-center">
                          <DollarSign className="mr-2 text-blue-600" />
                          <div>
                            <p className="text-xs text-gray-600">Price</p>
                            <p className="text-gray-900">{event.price} {event.currency}</p>
                          </div>
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => registerEvent(event.id)}
                      className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Register Now
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default EventsPage;
