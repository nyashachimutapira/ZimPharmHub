import React from 'react';
import { FaCheckCircle, FaClock, FaTimes } from 'react-icons/fa';
import './ApplicationTimeline.css';

function ApplicationTimeline({ application }) {
  const statusIcons = {
    pending: <FaClock />,
    reviewing: <FaClock />,
    shortlisted: <FaCheckCircle />,
    interview: <FaCheckCircle />,
    accepted: <FaCheckCircle />,
    rejected: <FaTimes />,
  };

  const statusColors = {
    pending: '#ffc107',
    reviewing: '#17a2b8',
    shortlisted: '#00bfff',
    interview: '#28a745',
    accepted: '#20c997',
    rejected: '#dc3545',
  };

  const formatDate = (date) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(date).toLocaleDateString('en-US', options);
  };

  return (
    <div className="application-timeline">
      <div className="timeline-container">
        {application.timeline.map((event, index) => (
          <div key={index} className="timeline-item">
            <div className="timeline-marker" style={{ color: statusColors[event.status] }}>
              {statusIcons[event.status]}
            </div>
            <div className="timeline-content">
              <h4 style={{ color: statusColors[event.status] }}>
                {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
              </h4>
              <p className="timeline-message">{event.message}</p>
              <p className="timeline-date">{formatDate(event.timestamp)}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ApplicationTimeline;
