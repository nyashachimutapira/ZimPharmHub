import React from 'react';
import './ApplicationStatusBadge.css';

function ApplicationStatusBadge({ status }) {
  const statusConfig = {
    pending: {
      label: 'Pending',
      className: 'badge-pending',
      color: '#ffc107',
    },
    reviewing: {
      label: 'Reviewing',
      className: 'badge-reviewing',
      color: '#17a2b8',
    },
    shortlisted: {
      label: 'Shortlisted',
      className: 'badge-shortlisted',
      color: '#00bfff',
    },
    interview: {
      label: 'Interview Scheduled',
      className: 'badge-interview',
      color: '#28a745',
    },
    accepted: {
      label: 'Accepted',
      className: 'badge-accepted',
      color: '#20c997',
    },
    rejected: {
      label: 'Rejected',
      className: 'badge-rejected',
      color: '#dc3545',
    },
  };

  const config = statusConfig[status] || statusConfig.pending;

  return (
    <span className={`status-badge ${config.className}`} style={{ backgroundColor: config.color }}>
      {config.label}
    </span>
  );
}

export default ApplicationStatusBadge;
