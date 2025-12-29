import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaCalendar, FaMapMarkerAlt } from 'react-icons/fa';
import './EventsPage.css';

function EventsPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await axios.get('/api/events');
      setEvents(response.data);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="events-page">
      <div className="container">
        <h1>Upcoming Events</h1>

        {loading ? (
          <p>Loading events...</p>
        ) : (
          <div className="events-list">
            {events.map((event) => (
              <div key={event._id} className="event-card">
                <div className="event-image"></div>
                <div className="event-details">
                  <div className="event-header">
                    <h3>{event.title}</h3>
                    {event.featured && <span className="featured-badge">Featured</span>}
                  </div>

                  <p className="event-description">{event.description}</p>

                  <div className="event-info">
                    <div className="info-item">
                      <FaCalendar className="icon" />
                      <div>
                        <label>Start Date</label>
                        <p>{new Date(event.startDate).toLocaleDateString()}</p>
                      </div>
                    </div>

                    <div className="info-item">
                      <FaMapMarkerAlt className="icon" />
                      <div>
                        <label>Location</label>
                        <p>{event.location || event.venue}</p>
                      </div>
                    </div>

                    <div className="info-item">
                      <label>Type</label>
                      <p>{event.eventType}</p>
                    </div>
                  </div>

                  <div className="event-footer">
                    <span className="registrations">{event.registrations?.length || 0} Registered</span>
                    <button className="btn btn-secondary">Register</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default EventsPage;
