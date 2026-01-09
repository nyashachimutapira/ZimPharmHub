import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import './InterviewScheduler.css';

function InterviewScheduler({ jobApplicationId, onScheduled }) {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState({
    scheduledAt: '',
    duration: 30,
    platform: 'zoom',
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.post('/api/interviews', {
        jobApplicationId,
        ...form,
        scheduledAt: new Date(form.scheduledAt).toISOString()
      });

      setIsOpen(false);
      setForm({
        scheduledAt: '',
        duration: 30,
        platform: 'zoom',
        notes: ''
      });

      if (onScheduled) {
        onScheduled(response.data);
      }

      alert('Interview scheduled successfully!');
    } catch (err) {
      console.error('Error scheduling interview:', err);
      setError(err.response?.data?.message || 'Failed to schedule interview');
    } finally {
      setLoading(false);
    }
  };

  const minDateTime = new Date();
  minDateTime.setHours(minDateTime.getHours() + 1); // At least 1 hour from now

  return (
    <>
      <button
        className="btn btn-primary"
        onClick={() => setIsOpen(true)}
      >
        Schedule Interview
      </button>

      {isOpen && (
        <div className="modal-overlay" onClick={() => setIsOpen(false)}>
          <div className="modal-content interview-scheduler-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Schedule Video Interview</h3>
              <button
                className="modal-close"
                onClick={() => setIsOpen(false)}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="interview-form">
              {error && <div className="alert alert-danger">{error}</div>}

              <div className="form-group">
                <label htmlFor="scheduledAt">Interview Date & Time *</label>
                <input
                  type="datetime-local"
                  id="scheduledAt"
                  name="scheduledAt"
                  value={form.scheduledAt}
                  onChange={handleChange}
                  min={minDateTime.toISOString().slice(0, 16)}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="duration">Duration (minutes)</label>
                <select
                  id="duration"
                  name="duration"
                  value={form.duration}
                  onChange={handleChange}
                >
                  <option value={15}>15 minutes</option>
                  <option value={30}>30 minutes</option>
                  <option value={45}>45 minutes</option>
                  <option value={60}>1 hour</option>
                  <option value={90}>1.5 hours</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="platform">Video Platform</label>
                <select
                  id="platform"
                  name="platform"
                  value={form.platform}
                  onChange={handleChange}
                >
                  <option value="zoom">Zoom</option>
                  <option value="google_meet">Google Meet</option>
                  <option value="teams">Microsoft Teams</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="notes">Notes (optional)</label>
                <textarea
                  id="notes"
                  name="notes"
                  value={form.notes}
                  onChange={handleChange}
                  placeholder="Any special instructions or topics to cover..."
                  rows={3}
                />
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setIsOpen(false)}
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={loading}
                >
                  {loading ? 'Scheduling...' : 'Schedule Interview'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export default InterviewScheduler;
