import React, { useState, useEffect } from 'react';
import { FaChevronDown, FaTimes } from 'react-icons/fa';
import './FilterPanel.css';

function FilterPanel({ onFiltersChange, initialFilters = {} }) {
  const [positions, setPositions] = useState(initialFilters.positions || []);
  const [locations, setLocations] = useState(initialFilters.locations || []);
  const [employmentTypes, setEmploymentTypes] = useState(initialFilters.employmentTypes || []);
  const [experience, setExperience] = useState(initialFilters.experience || []);
  
  const [filterOptions, setFilterOptions] = useState({
    positions: [],
    locations: [],
    employmentTypes: [],
    experience: ['0-1 years', '1-3 years', '3-5 years', '5+ years', 'Any'],
  });
  
  const [expandedSections, setExpandedSections] = useState({
    positions: true,
    locations: true,
    employmentTypes: true,
    experience: true,
  });
  
  const [loading, setLoading] = useState(true);

  // Fetch filter options on component mount
  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        const response = await fetch('/api/advancedSearch/filters/options');
        const data = await response.json();
        if (data.success) {
          setFilterOptions({
            positions: data.positions || [],
            locations: data.locations || [],
            employmentTypes: data.employmentTypes || [],
            experience: data.experience || filterOptions.experience,
          });
        }
      } catch (error) {
        console.error('Error fetching filter options:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFilterOptions();
  }, []);

  // Notify parent of filter changes
  useEffect(() => {
    onFiltersChange({
      positions: positions.length > 0 ? positions : null,
      locations: locations.length > 0 ? locations : null,
      employmentTypes: employmentTypes.length > 0 ? employmentTypes : null,
      experience: experience.length > 0 ? experience : null,
    });
  }, [positions, locations, employmentTypes, experience, onFiltersChange]);

  const togglePosition = (position) => {
    setPositions(prev =>
      prev.includes(position) ? prev.filter(p => p !== position) : [...prev, position]
    );
  };

  const toggleLocation = (location) => {
    setLocations(prev =>
      prev.includes(location) ? prev.filter(l => l !== location) : [...prev, location]
    );
  };

  const toggleEmploymentType = (type) => {
    setEmploymentTypes(prev =>
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  const toggleExperience = (exp) => {
    setExperience(prev =>
      prev.includes(exp) ? prev.filter(e => e !== exp) : [...prev, exp]
    );
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const clearAllFilters = () => {
    setPositions([]);
    setLocations([]);
    setEmploymentTypes([]);
    setExperience([]);
  };

  const activeFilterCount = positions.length + locations.length + employmentTypes.length + experience.length;

  if (loading) {
    return <div className="filter-panel loading">Loading filters...</div>;
  }

  return (
    <div className="filter-panel">
      <div className="filter-header">
        <h3>Filters</h3>
        {activeFilterCount > 0 && (
          <button className="clear-all-btn" onClick={clearAllFilters}>
            <FaTimes /> Clear All ({activeFilterCount})
          </button>
        )}
      </div>

      {/* Positions Filter */}
      <div className="filter-section">
        <button
          className="filter-section-header"
          onClick={() => toggleSection('positions')}
        >
          <span>Position/Role</span>
          <FaChevronDown
            className={`chevron ${expandedSections.positions ? 'open' : ''}`}
          />
        </button>
        {expandedSections.positions && (
          <div className="filter-options">
            {filterOptions.positions.length === 0 ? (
              <p className="no-options">No positions available</p>
            ) : (
              filterOptions.positions.slice(0, 8).map(position => (
                <label key={position} className="filter-checkbox">
                  <input
                    type="checkbox"
                    checked={positions.includes(position)}
                    onChange={() => togglePosition(position)}
                  />
                  <span>{position}</span>
                </label>
              ))
            )}
            {filterOptions.positions.length > 8 && (
              <button className="show-more-btn">Show more</button>
            )}
          </div>
        )}
      </div>

      {/* Locations Filter */}
      <div className="filter-section">
        <button
          className="filter-section-header"
          onClick={() => toggleSection('locations')}
        >
          <span>Location</span>
          {locations.length > 0 && (
            <span className="badge">{locations.length}</span>
          )}
          <FaChevronDown
            className={`chevron ${expandedSections.locations ? 'open' : ''}`}
          />
        </button>
        {expandedSections.locations && (
          <div className="filter-options">
            {filterOptions.locations.length === 0 ? (
              <p className="no-options">No locations available</p>
            ) : (
              filterOptions.locations.slice(0, 10).map(location => (
                <label key={location} className="filter-checkbox">
                  <input
                    type="checkbox"
                    checked={locations.includes(location)}
                    onChange={() => toggleLocation(location)}
                  />
                  <span>{location}</span>
                </label>
              ))
            )}
            {filterOptions.locations.length > 10 && (
              <button className="show-more-btn">Show more</button>
            )}
          </div>
        )}
      </div>

      {/* Employment Type Filter */}
      <div className="filter-section">
        <button
          className="filter-section-header"
          onClick={() => toggleSection('employmentTypes')}
        >
          <span>Employment Type</span>
          {employmentTypes.length > 0 && (
            <span className="badge">{employmentTypes.length}</span>
          )}
          <FaChevronDown
            className={`chevron ${expandedSections.employmentTypes ? 'open' : ''}`}
          />
        </button>
        {expandedSections.employmentTypes && (
          <div className="filter-options">
            {filterOptions.employmentTypes.length === 0 ? (
              <p className="no-options">No types available</p>
            ) : (
              filterOptions.employmentTypes.map(type => (
                <label key={type} className="filter-checkbox">
                  <input
                    type="checkbox"
                    checked={employmentTypes.includes(type)}
                    onChange={() => toggleEmploymentType(type)}
                  />
                  <span>{type}</span>
                </label>
              ))
            )}
          </div>
        )}
      </div>

      {/* Experience Filter */}
      <div className="filter-section">
        <button
          className="filter-section-header"
          onClick={() => toggleSection('experience')}
        >
          <span>Experience Level</span>
          {experience.length > 0 && (
            <span className="badge">{experience.length}</span>
          )}
          <FaChevronDown
            className={`chevron ${expandedSections.experience ? 'open' : ''}`}
          />
        </button>
        {expandedSections.experience && (
          <div className="filter-options">
            {filterOptions.experience.map(exp => (
              <label key={exp} className="filter-checkbox">
                <input
                  type="checkbox"
                  checked={experience.includes(exp)}
                  onChange={() => toggleExperience(exp)}
                />
                <span>{exp}</span>
              </label>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default FilterPanel;
