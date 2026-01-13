import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/ShiftManagementPage.css';

function ShiftManagementPage() {
  const [shifts, setShifts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [formData, setFormData] = useState({
    pharmacyId: '',
    staffId: '',
    shiftName: '',
    date: '',
    startTime: '',
    endTime: '',
    shiftType: 'Morning',
  });

  useEffect(() => {
    fetchShifts();
  }, [selectedDate]);

  const fetchShifts = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/operations/shifts', {
        params: { date: selectedDate }
      });
      setShifts(response.data);
    } catch (error) {
      console.error('Error fetching shifts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/operations/shifts', {
        ...formData,
        date: selectedDate
      });
      setShowForm(false);
      setFormData({
        pharmacyId: '',
        staffId: '',
        shiftName: '',
        date: '',
        startTime: '',
        endTime: '',
        shiftType: 'Morning',
      });
      fetchShifts();
    } catch (error) {
      console.error('Error creating shift:', error);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await axios.put(`/api/operations/shifts/${id}`, { status: newStatus });
      fetchShifts();
    } catch (error) {
      console.error('Error updating shift:', error);
    }
  };

  return (
    <div className="shift-management-page">
      <div className="page-header">
        <h1>Shift Management</h1>
        <div className="header-controls">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="date-input"
          />
          <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Cancel' : 'Schedule New Shift'}
          </button>
        </div>
      </div>

      {showForm && (
        <div className="form-container">
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label>Pharmacy ID</label>
                <input
                  type="text"
                  name="pharmacyId"
                  value={formData.pharmacyId}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Staff ID</label>
                <input
                  type="text"
                  name="staffId"
                  value={formData.staffId}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Shift Name</label>
                <input
                  type="text"
                  name="shiftName"
                  value={formData.shiftName}
                  onChange={handleInputChange}
                  placeholder="e.g., Morning Shift"
                  required
                />
              </div>
              <div className="form-group">
                <label>Shift Type</label>
                <select
                  name="shiftType"
                  value={formData.shiftType}
                  onChange={handleInputChange}
                >
                  <option value="Morning">Morning</option>
                  <option value="Afternoon">Afternoon</option>
                  <option value="Evening">Evening</option>
                  <option value="Night">Night</option>
                  <option value="Full Day">Full Day</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Start Time</label>
                <input
                  type="time"
                  name="startTime"
                  value={formData.startTime}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>End Time</label>
                <input
                  type="time"
                  name="endTime"
                  value={formData.endTime}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <button type="submit" className="btn-primary">Schedule Shift</button>
          </form>
        </div>
      )}

      <div className="shifts-grid">
        {loading ? (
          <p>Loading...</p>
        ) : shifts.length === 0 ? (
          <p>No shifts scheduled for this date</p>
        ) : (
          shifts.map(shift => (
            <div key={shift.id} className="shift-card">
              <div className="shift-header">
                <h3>{shift.shiftName}</h3>
                <span className={`status ${shift.status.toLowerCase()}`}>{shift.status}</span>
              </div>
              <div className="shift-details">
                <p><strong>Staff:</strong> {shift.staffId}</p>
                <p><strong>Type:</strong> {shift.shiftType}</p>
                <p><strong>Time:</strong> {shift.startTime} - {shift.endTime}</p>
              </div>
              <div className="shift-actions">
                <select 
                  value={shift.status} 
                  onChange={(e) => handleStatusChange(shift.id, e.target.value)}
                  className="status-select"
                >
                  <option value="Scheduled">Scheduled</option>
                  <option value="Confirmed">Confirmed</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                  <option value="No Show">No Show</option>
                </select>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default ShiftManagementPage;
