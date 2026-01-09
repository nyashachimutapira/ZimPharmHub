import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './JobAlertForm.css';

const JobAlertForm = ({ initialData = null, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    positions: [],
    locations: [],
    salaryMin: '',
    salaryMax: '',
    employmentTypes: [],
    notificationMethod: 'email',
    frequency: 'daily',
    digestDay: 'monday',
    digestTime: '09:00',
    isActive: true
  });

  const [loading, setLoading] = useState(false);
  const [filterOptions, setFilterOptions] = useState({
    positions: [],
    locations: [],
    employmentTypes: []
  });

  useEffect(() => {
    fetchFilterOptions();
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        description: initialData.description || '',
        positions: initialData.positions || [],
        locations: initialData.locations || [],
        salaryMin: initialData.salaryMin || '',
        salaryMax: initialData.salaryMax || '',
        employmentTypes: initialData.employmentTypes || [],
        notificationMethod: initialData.notificationMethod || 'email',
        frequency: initialData.frequency || 'daily',
        digestDay: initialData.digestDay || 'monday',
        digestTime: initialData.digestTime || '09:00',
        isActive: initialData.isActive !== false
      });
    }
  }, [initialData]);

  const fetchFilterOptions = async () => {
    try {
      const response = await axios.get('/api/advancedSearch/filters/options');
      if (response.data.success) {
        setFilterOptions(response.data);
      }
    } catch (error) {
      console.error('Error fetching filter options:', error);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleMultiSelectChange = (field, option, checked) => {
    setFormData(prev => ({
      ...prev,
      [field]: checked
        ? [...prev[field], option]
        : prev[field].filter(item => item !== option)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic validation
    if (!formData.name.trim()) {
      showToast('Please enter a name for your alert', 'error');
      return;
    }

    if (formData.positions.length === 0 && formData.locations.length === 0 &&
        !formData.salaryMin && !formData.salaryMax && formData.employmentTypes.length === 0) {
      showToast('Please select at least one search criteria', 'error');
      return;
    }

    setLoading(true);

    try {
      const submitData = {
        ...formData,
        salaryMin: formData.salaryMin ? parseInt(formData.salaryMin) : null,
        salaryMax: formData.salaryMax ? parseInt(formData.salaryMax) : null
      };

      await onSubmit(submitData);
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message, type) => {
    const event = new CustomEvent('showToast', {
      detail: { message, type }
    });
    window.dispatchEvent(event);
  };

  const frequencyOptions = [
    { value: 'instant', label: 'Instant - Get notified immediately when jobs match' },
    { value: 'daily', label: 'Daily Digest - Once per day' },
    { value: 'weekly', label: 'Weekly Digest - Once per week' }
  ];

  const dayOptions = [
    { value: 'monday', label: 'Monday' },
    { value: 'tuesday', label: 'Tuesday' },
    { value: 'wednesday', label: 'Wednesday' },
    { value: 'thursday', label: 'Thursday' },
    { value: 'friday', label: 'Friday' },
    { value: 'saturday', label: 'Saturday' },
    { value: 'sunday', label: 'Sunday' }
  ];

  return (
    <form className="job-alert-form" onSubmit={handleSubmit}>
      <div className="form-section">
        <h3>Alert Details</h3>

        <div className="form-group">
          <label htmlFor="name">Alert Name *</label>
          <input
            type="text"
            id="name"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            placeholder="e.g., Senior Pharmacist in Harare"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Description (Optional)</label>
          <textarea
            id="description"
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            placeholder="Brief description of what you're looking for..."
            rows={3}
          />
        </div>

        <div className="form-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={formData.isActive}
              onChange={(e) => handleInputChange('isActive', e.target.checked)}
            />
            <span>Enable this alert</span>
          </label>
        </div>
      </div>

      <div className="form-section">
        <h3>Job Criteria</h3>
        <p className="section-description">
          Select the criteria that matching jobs should meet. At least one criteria is required.
        </p>

        {/* Positions */}
        <div className="form-group">
          <label>Positions/Roles</label>
          <div className="multi-select-grid">
            {filterOptions.positions?.map(position => (
              <label key={position} className="checkbox-label">
                <input
                  type="checkbox"
                  checked={formData.positions.includes(position)}
                  onChange={(e) => handleMultiSelectChange('positions', position, e.target.checked)}
                />
                <span>{position}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Locations */}
        <div className="form-group">
          <label>Locations</label>
          <div className="multi-select-grid">
            {filterOptions.locations?.map(location => (
              <label key={location} className="checkbox-label">
                <input
                  type="checkbox"
                  checked={formData.locations.includes(location)}
                  onChange={(e) => handleMultiSelectChange('locations', location, e.target.checked)}
                />
                <span>{location}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Employment Types */}
        <div className="form-group">
          <label>Employment Types</label>
          <div className="multi-select-grid">
            {filterOptions.employmentTypes?.map(type => (
              <label key={type} className="checkbox-label">
                <input
                  type="checkbox"
                  checked={formData.employmentTypes.includes(type)}
                  onChange={(e) => handleMultiSelectChange('employmentTypes', type, e.target.checked)}
                />
                <span>{type}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Salary Range */}
        <div className="form-group">
          <label>Salary Range (ZWL)</label>
          <div className="salary-range-inputs">
            <input
              type="number"
              placeholder="Min salary"
              value={formData.salaryMin}
              onChange={(e) => handleInputChange('salaryMin', e.target.value)}
              min="0"
            />
            <span>to</span>
            <input
              type="number"
              placeholder="Max salary"
              value={formData.salaryMax}
              onChange={(e) => handleInputChange('salaryMax', e.target.value)}
              min="0"
            />
          </div>
        </div>
      </div>

      <div className="form-section">
        <h3>Notification Settings</h3>

        {/* Notification Method */}
        <div className="form-group">
          <label htmlFor="notificationMethod">Notification Method</label>
          <select
            id="notificationMethod"
            value={formData.notificationMethod}
            onChange={(e) => handleInputChange('notificationMethod', e.target.value)}
          >
            <option value="email">Email</option>
            <option value="sms">SMS (Coming Soon)</option>
            <option value="both">Email & SMS (Coming Soon)</option>
          </select>
        </div>

        {/* Frequency */}
        <div className="form-group">
          <label htmlFor="frequency">Notification Frequency</label>
          <select
            id="frequency"
            value={formData.frequency}
            onChange={(e) => handleInputChange('frequency', e.target.value)}
          >
            {frequencyOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Digest Settings */}
        {(formData.frequency === 'daily' || formData.frequency === 'weekly') && (
          <div className="form-group">
            <label htmlFor="digestTime">Preferred Time</label>
            <input
              type="time"
              id="digestTime"
              value={formData.digestTime}
              onChange={(e) => handleInputChange('digestTime', e.target.value)}
            />
          </div>
        )}

        {formData.frequency === 'weekly' && (
          <div className="form-group">
            <label htmlFor="digestDay">Preferred Day</label>
            <select
              id="digestDay"
              value={formData.digestDay}
              onChange={(e) => handleInputChange('digestDay', e.target.value)}
            >
              {dayOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="form-actions">
        <button
          type="button"
          className="btn btn-secondary"
          onClick={onCancel}
          disabled={loading}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="btn btn-primary"
          disabled={loading}
        >
          {loading ? 'Saving...' : initialData ? 'Update Alert' : 'Create Alert'}
        </button>
      </div>
    </form>
  );
};

export default JobAlertForm;
