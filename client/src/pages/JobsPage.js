import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import './JobsPage.css';

function JobsPage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    position: '',
    location: '',
    search: '',
  });

  useEffect(() => {
    fetchJobs();
  }, [filters]);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.position) params.append('position', filters.position);
      if (filters.location) params.append('location', filters.location);
      if (filters.search) params.append('search', filters.search);

      const response = await axios.get(`/api/jobs?${params.toString()}`);
      setJobs(response.data);
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="jobs-page">
      <div className="container">
        <h1>Find Your Next Opportunity</h1>

        <div className="search-filters">
          <input
            type="text"
            placeholder="Search jobs..."
            name="search"
            value={filters.search}
            onChange={handleFilterChange}
            className="search-input"
          />

          <select
            name="position"
            value={filters.position}
            onChange={handleFilterChange}
            className="filter-select"
          >
            <option value="">All Positions</option>
            <option value="Pharmacist">Pharmacist</option>
            <option value="Dispensary Assistant">Dispensary Assistant</option>
            <option value="Pharmacy Manager">Pharmacy Manager</option>
          </select>

          <input
            type="text"
            placeholder="Location..."
            name="location"
            value={filters.location}
            onChange={handleFilterChange}
            className="filter-input"
          />

          <button className="btn btn-secondary" onClick={async () => {
            const name = prompt('Name this saved search:');
            if (!name) return;
            try {
              await axios.post('/api/saved-searches', { name, searchParams: filters }, { headers: { 'user-id': localStorage.getItem('userId') } });
              alert('Saved search created');
            } catch (e) {
              alert('Error saving search: ' + (e.response?.data?.message || e.message));
            }
          }}>Save Search</button>
        </div>

        {loading ? (
          <p className="loading">Loading jobs...</p>
        ) : jobs.length === 0 ? (
          <p className="no-results">No jobs found. Try adjusting your filters.</p>
        ) : (
          <div className="jobs-list">
            {jobs.map((job) => (
              <Link key={job._id} to={`/jobs/${job._id}`} className="job-card">
                <div className="job-header">
                  <h3>{job.title}</h3>
                  {job.featured && <span className="featured-badge">Featured</span>}
                </div>
                <p className="job-position">{job.position}</p>
                <p className="job-pharmacy">{job.pharmacy?.firstName} {job.pharmacy?.lastName}</p>
                <div className="job-location">
                  {job.location?.city}, {job.location?.province}
                </div>
                <div className="job-footer">
                  <span className="employment-type">{job.employmentType}</span>
                  <span className="salary">
                    ZWL {job.salary?.min || 'N/A'} - {job.salary?.max || 'N/A'}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default JobsPage;
