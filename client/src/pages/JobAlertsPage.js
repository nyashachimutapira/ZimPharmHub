import React, { useState, useEffect } from 'react';
import axios from 'axios';
import JobAlertForm from '../components/JobAlertForm';
import JobAlertCard from '../components/JobAlertCard';
import './JobAlertsPage.css';

function JobAlertsPage() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingAlert, setEditingAlert] = useState(null);
  const [userId] = useState(localStorage.getItem('userId'));

  useEffect(() => {
    if (userId) {
      fetchAlerts();
    } else {
      setLoading(false);
    }
  }, [userId]);

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/job-alerts', {
        headers: { 'user-id': userId }
      });

      if (response.data.success) {
        setAlerts(response.data.alerts || []);
      }
    } catch (error) {
      console.error('Error fetching job alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAlert = async (alertData) => {
    try {
      const response = await axios.post('/api/job-alerts', alertData, {
        headers: { 'user-id': userId }
      });

      if (response.data.success) {
        setAlerts(prev => [response.data.alert, ...prev]);
        setShowCreateForm(false);
        showToast('Job alert created successfully!', 'success');
      }
    } catch (error) {
      console.error('Error creating job alert:', error);
      showToast('Failed to create job alert. Please try again.', 'error');
    }
  };

  const handleUpdateAlert = async (alertId, alertData) => {
    try {
      const response = await axios.put(`/api/job-alerts/${alertId}`, alertData, {
        headers: { 'user-id': userId }
      });

      if (response.data.success) {
        setAlerts(prev => prev.map(alert =>
          alert._id === alertId ? response.data.alert : alert
        ));
        setEditingAlert(null);
        showToast('Job alert updated successfully!', 'success');
      }
    } catch (error) {
      console.error('Error updating job alert:', error);
      showToast('Failed to update job alert. Please try again.', 'error');
    }
  };

  const handleDeleteAlert = async (alertId) => {
    if (!window.confirm('Are you sure you want to delete this job alert?')) {
      return;
    }

    try {
      const response = await axios.delete(`/api/job-alerts/${alertId}`, {
        headers: { 'user-id': userId }
      });

      if (response.data.success) {
        setAlerts(prev => prev.filter(alert => alert._id !== alertId));
        showToast('Job alert deleted successfully!', 'success');
      }
    } catch (error) {
      console.error('Error deleting job alert:', error);
      showToast('Failed to delete job alert. Please try again.', 'error');
    }
  };

  const handleTestAlert = async (alertId) => {
    try {
      const response = await axios.post(`/api/job-alerts/${alertId}/send-test`, {}, {
        headers: { 'user-id': userId }
      });

      if (response.data.success) {
        showToast('Test email sent successfully!', 'success');
      }
    } catch (error) {
      console.error('Error sending test email:', error);
      showToast('Failed to send test email. Please try again.', 'error');
    }
  };

  const handleCheckMatches = async (alertId) => {
    try {
      const response = await axios.post(`/api/job-alerts/${alertId}/check-matches`, {}, {
        headers: { 'user-id': userId }
      });

      if (response.data.success) {
        // Update the alert with new match count
        setAlerts(prev => prev.map(alert =>
          alert._id === alertId ? { ...alert, ...response.data.alert } : alert
        ));
        showToast(`Found ${response.data.matchCount} matching jobs!`, 'info');
      }
    } catch (error) {
      console.error('Error checking matches:', error);
      showToast('Failed to check for matches. Please try again.', 'error');
    }
  };

  const showToast = (message, type) => {
    const event = new CustomEvent('showToast', {
      detail: { message, type }
    });
    window.dispatchEvent(event);
  };

  if (!userId) {
    return (
      <div className="job-alerts-page">
        <div className="container">
          <div className="auth-required">
            <h1>Job Alerts</h1>
            <p>Please log in to create and manage job alerts.</p>
            <a href="/login" className="btn btn-primary">Log In</a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="job-alerts-page">
      <div className="container">
        <div className="page-header">
          <div className="header-content">
            <h1>Job Alerts</h1>
            <p>Get notified when jobs matching your criteria are posted</p>
          </div>
          <button
            className="btn btn-primary create-alert-btn"
            onClick={() => setShowCreateForm(true)}
          >
            Create New Alert
          </button>
        </div>

        {showCreateForm && (
          <div className="modal-overlay" onClick={() => setShowCreateForm(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Create Job Alert</h2>
                <button
                  className="close-btn"
                  onClick={() => setShowCreateForm(false)}
                >
                  ×
                </button>
              </div>
              <JobAlertForm
                onSubmit={handleCreateAlert}
                onCancel={() => setShowCreateForm(false)}
              />
            </div>
          </div>
        )}

        {editingAlert && (
          <div className="modal-overlay" onClick={() => setEditingAlert(null)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Edit Job Alert</h2>
                <button
                  className="close-btn"
                  onClick={() => setEditingAlert(null)}
                >
                  ×
                </button>
              </div>
              <JobAlertForm
                initialData={editingAlert}
                onSubmit={(data) => handleUpdateAlert(editingAlert._id, data)}
                onCancel={() => setEditingAlert(null)}
              />
            </div>
          </div>
        )}

        <div className="alerts-section">
          {loading ? (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Loading your job alerts...</p>
            </div>
          ) : alerts.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🔔</div>
              <h3>No Job Alerts Yet</h3>
              <p>Create your first job alert to get notified about new opportunities.</p>
              <button
                className="btn btn-primary"
                onClick={() => setShowCreateForm(true)}
              >
                Create Your First Alert
              </button>
            </div>
          ) : (
            <>
              <div className="alerts-header">
                <h2>Your Job Alerts ({alerts.length})</h2>
                <p>Manage your job search notifications</p>
              </div>

              <div className="alerts-grid">
                {alerts.map((alert) => (
                  <JobAlertCard
                    key={alert._id}
                    alert={alert}
                    onEdit={() => setEditingAlert(alert)}
                    onDelete={() => handleDeleteAlert(alert._id)}
                    onTest={() => handleTestAlert(alert._id)}
                    onCheckMatches={() => handleCheckMatches(alert._id)}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default JobAlertsPage;
