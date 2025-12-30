import React, { useState, useEffect } from 'react';
import { FaStar, FaTrash, FaEdit } from 'react-icons/fa';
import './SavedFiltersPanel.css';

function SavedFiltersPanel({ onApplyFilter, userId }) {
  const [savedFilters, setSavedFilters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingFilter, setEditingFilter] = useState(null);

  // Fetch saved filters on mount
  useEffect(() => {
    fetchSavedFilters();
  }, [userId]);

  const fetchSavedFilters = async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await fetch('/api/advancedSearch/filters', {
        headers: { 'user-id': userId },
      });
      const data = await response.json();
      if (data.success) {
        setSavedFilters(data.filters || []);
      }
    } catch (err) {
      console.error('Error fetching saved filters:', err);
      setError('Failed to load saved filters');
    } finally {
      setLoading(false);
    }
  };

  const handleApplyFilter = (filter) => {
    onApplyFilter(filter);
  };

  const handleDeleteFilter = async (filterId) => {
    if (!window.confirm('Are you sure you want to delete this filter?')) {
      return;
    }

    try {
      const response = await fetch(`/api/advancedSearch/filters/${filterId}`, {
        method: 'DELETE',
        headers: { 'user-id': userId },
      });
      const data = await response.json();
      if (data.success) {
        setSavedFilters(savedFilters.filter(f => f._id !== filterId));
      }
    } catch (err) {
      console.error('Error deleting filter:', err);
      setError('Failed to delete filter');
    }
  };

  const handleSetDefault = async (filter) => {
    try {
      const response = await fetch(`/api/advancedSearch/filters/${filter._id}`, {
        method: 'PUT',
        headers: {
          'user-id': userId,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...filter,
          isDefault: !filter.isDefault,
        }),
      });
      const data = await response.json();
      if (data.success) {
        setSavedFilters(
          savedFilters.map(f =>
            f._id === filter._id ? { ...f, isDefault: !f.isDefault } : f
          )
        );
      }
    } catch (err) {
      console.error('Error updating filter:', err);
      setError('Failed to update filter');
    }
  };

  if (!userId) {
    return null;
  }

  if (loading) {
    return <div className="saved-filters-panel loading">Loading saved filters...</div>;
  }

  if (error) {
    return <div className="saved-filters-panel error">{error}</div>;
  }

  if (savedFilters.length === 0) {
    return (
      <div className="saved-filters-panel empty">
        <p>No saved filters yet. Save your first search filter!</p>
      </div>
    );
  }

  return (
    <div className="saved-filters-panel">
      <div className="panel-header">
        <h3>My Saved Filters</h3>
        <span className="filter-count">{savedFilters.length}</span>
      </div>

      <div className="filters-list">
        {savedFilters.map(filter => (
          <div key={filter._id} className="filter-item">
            <div className="filter-info">
              <div className="filter-name-row">
                <button
                  className="filter-default-btn"
                  onClick={() => handleSetDefault(filter)}
                  title={filter.isDefault ? 'Unset as default' : 'Set as default'}
                >
                  <FaStar
                    className={`star-icon ${filter.isDefault ? 'active' : ''}`}
                  />
                </button>
                <h4 className="filter-name">{filter.name}</h4>
              </div>
              {filter.description && (
                <p className="filter-description">{filter.description}</p>
              )}
              <div className="filter-tags">
                {filter.positions?.length > 0 && (
                  <span className="tag">{filter.positions.length} positions</span>
                )}
                {filter.locations?.length > 0 && (
                  <span className="tag">{filter.locations.length} locations</span>
                )}
                {filter.employmentTypes?.length > 0 && (
                  <span className="tag">{filter.employmentTypes.length} types</span>
                )}
                {(filter.salaryMin || filter.salaryMax) && (
                  <span className="tag">Salary set</span>
                )}
              </div>
              <div className="filter-stats">
                <small>
                  Used {filter.usageCount} times
                  {filter.lastUsed && ` • Last: ${new Date(filter.lastUsed).toLocaleDateString()}`}
                </small>
              </div>
            </div>

            <div className="filter-actions">
              <button
                className="btn-apply"
                onClick={() => handleApplyFilter(filter)}
                title="Apply this filter"
              >
                Apply
              </button>
              <button
                className="btn-icon"
                onClick={() => {
                  setEditingFilter(filter);
                  setShowEditModal(true);
                }}
                title="Edit filter"
              >
                <FaEdit />
              </button>
              <button
                className="btn-icon danger"
                onClick={() => handleDeleteFilter(filter._id)}
                title="Delete filter"
              >
                <FaTrash />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Modal - simplified version */}
      {showEditModal && editingFilter && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3>Edit Filter</h3>
            <p className="modal-note">Filter name: {editingFilter.name}</p>
            <div className="modal-actions">
              <button
                className="btn-secondary"
                onClick={() => setShowEditModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SavedFiltersPanel;
