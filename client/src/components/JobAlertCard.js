import React, { useState } from 'react';
import './JobAlertCard.css';

const JobAlertCard = ({ alert, onEdit, onDelete, onTest, onCheckMatches }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleTest = async () => {
    setIsLoading(true);
    try {
      await onTest();
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheckMatches = async () => {
    setIsLoading(true);
    try {
      await onCheckMatches();
    } finally {
      setIsLoading(false);
    }
  };

  const getFrequencyLabel = (frequency) => {
    switch (frequency) {
      case 'instant': return 'Instant';
      case 'daily': return 'Daily Digest';
      case 'weekly': return 'Weekly Digest';
      default: return frequency;
    }
  };

  const getStatusColor = (isActive) => {
    return isActive ? '#27ae60' : '#95a5a6';
  };

  const getStatusLabel = (isActive) => {
    return isActive ? 'Active' : 'Inactive';
  };

  const formatCriteria = (alert) => {
    const criteria = [];
    if (alert.positions?.length > 0) {
      criteria.push(`${alert.positions.length} position${alert.positions.length > 1 ? 's' : ''}`);
    }
    if (alert.locations?.length > 0) {
      criteria.push(`${alert.locations.length} location${alert.locations.length > 1 ? 's' : ''}`);
    }
    if (alert.employmentTypes?.length > 0) {
      criteria.push(`${alert.employmentTypes.length} type${alert.employmentTypes.length > 1 ? 's' : ''}`);
    }
    if (alert.salaryMin || alert.salaryMax) {
      criteria.push('Salary range');
    }
    return criteria.length > 0 ? criteria.join(', ') : 'No criteria set';
  };

  const formatLastChecked = (dateString) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className={`job-alert-card ${!alert.isActive ? 'inactive' : ''}`}>
      <div className="alert-header">
        <div className="alert-title-section">
          <h3 className="alert-name">{alert.name}</h3>
          <span
            className="alert-status"
            style={{ backgroundColor: getStatusColor(alert.isActive) }}
          >
            {getStatusLabel(alert.isActive)}
          </span>
        </div>
        <div className="alert-actions">
          <button
            className="btn-icon"
            onClick={onEdit}
            title="Edit alert"
          >
            ✏️
          </button>
          <button
            className="btn-icon delete"
            onClick={onDelete}
            title="Delete alert"
          >
            🗑️
          </button>
        </div>
      </div>

      {alert.description && (
        <p className="alert-description">{alert.description}</p>
      )}

      <div className="alert-details">
        <div className="detail-row">
          <span className="detail-label">Frequency:</span>
          <span className="detail-value">{getFrequencyLabel(alert.frequency)}</span>
        </div>

        {(alert.frequency === 'daily' || alert.frequency === 'weekly') && (
          <div className="detail-row">
            <span className="detail-label">Time:</span>
            <span className="detail-value">{alert.digestTime || '09:00'}</span>
          </div>
        )}

        {alert.frequency === 'weekly' && (
          <div className="detail-row">
            <span className="detail-label">Day:</span>
            <span className="detail-value">{alert.digestDay || 'monday'}</span>
          </div>
        )}

        <div className="detail-row">
          <span className="detail-label">Criteria:</span>
          <span className="detail-value criteria">{formatCriteria(alert)}</span>
        </div>

        <div className="detail-row">
          <span className="detail-label">Matches found:</span>
          <span className="detail-value">{alert.totalMatches || 0}</span>
        </div>

        <div className="detail-row">
          <span className="detail-label">Notifications sent:</span>
          <span className="detail-value">{alert.totalNotificationsSent || 0}</span>
        </div>

        <div className="detail-row">
          <span className="detail-label">Last checked:</span>
          <span className="detail-value">{formatLastChecked(alert.lastJobMatched)}</span>
        </div>

        <div className="detail-row">
          <span className="detail-label">Created:</span>
          <span className="detail-value">
            {new Date(alert.createdAt).toLocaleDateString()}
          </span>
        </div>
      </div>

      <div className="alert-footer">
        <div className="alert-stats">
          {alert.matchingJobs?.length > 0 && (
            <span className="pending-matches">
              {alert.matchingJobs.length} job{alert.matchingJobs.length > 1 ? 's' : ''} waiting
            </span>
          )}
        </div>

        <div className="alert-buttons">
          <button
            className="btn btn-secondary btn-sm"
            onClick={handleCheckMatches}
            disabled={isLoading}
          >
            {isLoading ? 'Checking...' : 'Check Matches'}
          </button>

          <button
            className="btn btn-outline btn-sm"
            onClick={handleTest}
            disabled={isLoading}
          >
            {isLoading ? 'Sending...' : 'Send Test'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default JobAlertCard;
