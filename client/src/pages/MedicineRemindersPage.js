import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './MedicineRemindersPage.css';

const MedicineRemindersPage = () => {
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    medicineName: '',
    dosage: '',
    frequency: 'daily',
    startDate: '',
    endDate: '',
    refillThreshold: 7,
    reminderTime: '09:00',
    notificationMethod: 'email',
  });
  const [pharmacies, setPharmacies] = useState([]);
  const [selectedPharmacy, setSelectedPharmacy] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchReminders();
    fetchPharmacies();
  }, []);

  const fetchReminders = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('/api/medicine-reminders', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setReminders(res.data);
      setError('');
    } catch (err) {
      setError('Failed to fetch reminders');
      console.error('Error:', err);
    }
    setLoading(false);
  };

  const fetchPharmacies = async () => {
    try {
      const res = await axios.get('/api/pharmacies');
      setPharmacies(res.data);
    } catch (err) {
      console.error('Error fetching pharmacies:', err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      if (editingId) {
        const res = await axios.put(
          `/api/medicine-reminders/${editingId}`,
          formData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setReminders((prev) =>
          prev.map((r) => (r.id === editingId ? res.data : r))
        );
        setSuccess('Reminder updated successfully');
        setEditingId(null);
      } else {
        const res = await axios.post('/api/medicine-reminders', formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setReminders((prev) => [res.data, ...prev]);
        setSuccess('Reminder created successfully');
      }

      setFormData({
        medicineName: '',
        dosage: '',
        frequency: 'daily',
        startDate: '',
        endDate: '',
        refillThreshold: 7,
        reminderTime: '09:00',
        notificationMethod: 'email',
      });
      setShowForm(false);
      setError('');
    } catch (err) {
      setError(err.response?.data?.error || 'Error saving reminder');
      console.error('Error:', err);
    }
    setLoading(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this reminder?')) return;

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/medicine-reminders/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setReminders((prev) => prev.filter((r) => r.id !== id));
      setSuccess('Reminder deleted successfully');
      setError('');
    } catch (err) {
      setError('Failed to delete reminder');
      console.error('Error:', err);
    }
    setLoading(false);
  };

  const handleRefillOrdered = async (reminderId) => {
    if (!selectedPharmacy) {
      setError('Please select a pharmacy');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(
        `/api/medicine-reminders/${reminderId}/refill-ordered`,
        { pharmacyId: selectedPharmacy },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setReminders((prev) =>
        prev.map((r) => (r.id === reminderId ? res.data : r))
      );
      setSuccess('Refill ordered successfully');
      setSelectedPharmacy('');
      setError('');
    } catch (err) {
      setError('Failed to order refill');
      console.error('Error:', err);
    }
    setLoading(false);
  };

  const handleEdit = (reminder) => {
    setFormData({
      medicineName: reminder.medicineName,
      dosage: reminder.dosage || '',
      frequency: reminder.frequency,
      startDate: reminder.startDate?.split('T')[0] || '',
      endDate: reminder.endDate?.split('T')[0] || '',
      refillThreshold: reminder.refillThreshold,
      reminderTime: reminder.reminderTime,
      notificationMethod: reminder.notificationMethod,
    });
    setEditingId(reminder.id);
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({
      medicineName: '',
      dosage: '',
      frequency: 'daily',
      startDate: '',
      endDate: '',
      refillThreshold: 7,
      reminderTime: '09:00',
      notificationMethod: 'email',
    });
  };

  const daysUntilRefill = (nextRefillDate) => {
    const today = new Date();
    const refillDate = new Date(nextRefillDate);
    const diff = Math.ceil((refillDate - today) / (1000 * 60 * 60 * 24));
    return diff;
  };

  return (
    <div className="medicine-reminders-page">
      <div className="page-header">
        <div className="header-content">
          <h1>💊 Medicine Reminders</h1>
          <p>Never miss a dose or refill</p>
        </div>
        <button
          className={`btn btn-primary ${showForm ? 'cancel' : ''}`}
          onClick={() => (showForm ? handleCancel() : setShowForm(true))}
        >
          {showForm ? 'Cancel' : '+ Add Reminder'}
        </button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {showForm && (
        <form className="reminder-form" onSubmit={handleSubmit}>
          <div className="form-section">
            <h2>{editingId ? 'Edit Reminder' : 'Create New Reminder'}</h2>

            <div className="form-row">
              <div className="form-group">
                <label>Medicine Name *</label>
                <input
                  type="text"
                  name="medicineName"
                  value={formData.medicineName}
                  onChange={handleInputChange}
                  placeholder="e.g., Aspirin, Metformin"
                  required
                />
              </div>
              <div className="form-group">
                <label>Dosage</label>
                <input
                  type="text"
                  name="dosage"
                  value={formData.dosage}
                  onChange={handleInputChange}
                  placeholder="e.g., 500mg, 2 tablets"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Frequency *</label>
                <select
                  name="frequency"
                  value={formData.frequency}
                  onChange={handleInputChange}
                >
                  <option value="daily">Daily</option>
                  <option value="twice-daily">Twice Daily</option>
                  <option value="three-times-daily">Three Times Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="as-needed">As Needed</option>
                </select>
              </div>
              <div className="form-group">
                <label>Start Date *</label>
                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>End Date (Optional)</label>
                <input
                  type="date"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group">
                <label>Reminder Time</label>
                <input
                  type="time"
                  name="reminderTime"
                  value={formData.reminderTime}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Refill Alert Threshold (days)</label>
                <input
                  type="number"
                  name="refillThreshold"
                  value={formData.refillThreshold}
                  onChange={handleInputChange}
                  min="1"
                  max="30"
                />
              </div>
              <div className="form-group">
                <label>Notification Method</label>
                <select
                  name="notificationMethod"
                  value={formData.notificationMethod}
                  onChange={handleInputChange}
                >
                  <option value="email">Email</option>
                  <option value="sms">SMS</option>
                  <option value="push">Push</option>
                  <option value="all">All Methods</option>
                </select>
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-success" disabled={loading}>
                {loading ? 'Saving...' : editingId ? 'Update Reminder' : 'Create Reminder'}
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleCancel}
              >
                Cancel
              </button>
            </div>
          </div>
        </form>
      )}

      <div className="reminders-container">
        {loading && reminders.length === 0 ? (
          <div className="loading">Loading reminders...</div>
        ) : reminders.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">💊</div>
            <h3>No reminders yet</h3>
            <p>Create your first medicine reminder to get started</p>
            <button className="btn btn-primary" onClick={() => setShowForm(true)}>
              + Create Reminder
            </button>
          </div>
        ) : (
          <div className="reminders-grid">
            {reminders.map((reminder) => {
              const daysLeft = daysUntilRefill(reminder.nextRefillDate);
              const isAlertNeeded = daysLeft <= reminder.refillThreshold;

              return (
                <div
                  key={reminder.id}
                  className={`reminder-card ${isAlertNeeded ? 'alert' : ''} ${
                    reminder.status
                  }`}
                >
                  <div className="card-header">
                    <div>
                      <h3>{reminder.medicineName}</h3>
                      {reminder.dosage && <p className="dosage">{reminder.dosage}</p>}
                    </div>
                    <span className={`status-badge ${reminder.status}`}>
                      {reminder.status}
                    </span>
                  </div>

                  <div className="card-body">
                    <div className="info-row">
                      <span className="label">Frequency:</span>
                      <span className="value">{reminder.frequency}</span>
                    </div>
                    <div className="info-row">
                      <span className="label">Reminder Time:</span>
                      <span className="value">{reminder.reminderTime}</span>
                    </div>
                    <div className="info-row">
                      <span className="label">Notification:</span>
                      <span className="value">{reminder.notificationMethod}</span>
                    </div>

                    <div className="refill-section">
                      <div className="refill-info">
                        <span className="label">Next Refill:</span>
                        <span className="date">
                          {new Date(reminder.nextRefillDate).toLocaleDateString()}
                        </span>
                        {isAlertNeeded && (
                          <span className={`days-left ${daysLeft <= 0 ? 'urgent' : ''}`}>
                            {daysLeft <= 0
                              ? 'Time to refill!'
                              : `${daysLeft} days left`}
                          </span>
                        )}
                      </div>

                      {reminder.status === 'active' && (
                        <div className="refill-actions">
                          <select
                            value={selectedPharmacy}
                            onChange={(e) => setSelectedPharmacy(e.target.value)}
                            className="pharmacy-select"
                          >
                            <option value="">Select pharmacy</option>
                            {pharmacies.map((p) => (
                              <option key={p.id} value={p.id}>
                                {p.name}
                              </option>
                            ))}
                          </select>
                          <button
                            className="btn btn-sm btn-success"
                            onClick={() => handleRefillOrdered(reminder.id)}
                            disabled={!selectedPharmacy || loading}
                          >
                            Order Refill
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="card-footer">
                    <button
                      className="btn btn-sm btn-outline"
                      onClick={() => handleEdit(reminder)}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => handleDelete(reminder.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MedicineRemindersPage;
