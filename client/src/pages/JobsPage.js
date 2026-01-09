import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import FilterPanel from '../components/FilterPanel';
import SalaryRangeSlider from '../components/SalaryRangeSlider';
import SortOptions from '../components/SortOptions';
import SavedFiltersPanel from '../components/SavedFiltersPanel';
import SearchBar from '../components/SearchBar';
import JobRecommendations from '../components/JobRecommendations';
import SaveJobButton from '../components/SaveJobButton';
import './JobsPage.css';

function JobsPage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalResults, setTotalResults] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  
  const [filters, setFilters] = useState({
    q: '',
    positions: null,
    locations: null,
    salaryMin: null,
    salaryMax: null,
    employmentTypes: null,
    experience: null,
    sortBy: 'relevance',
    sortOrder: 'desc',
  });

  const [activeFilterCount, setActiveFilterCount] = useState(0);
  const [userId] = useState(localStorage.getItem('userId'));

  // Fetch jobs when filters or page changes
  useEffect(() => {
    fetchJobs();
  }, [filters, currentPage]);

  // Count active filters
  useEffect(() => {
    let count = 0;
    if (filters.q) count++;
    if (filters.positions) count++;
    if (filters.locations) count++;
    if (filters.salaryMin || filters.salaryMax) count++;
    if (filters.employmentTypes) count++;
    if (filters.experience) count++;
    setActiveFilterCount(count);
  }, [filters]);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      if (filters.q) params.append('q', filters.q);
      if (filters.positions) {
        (Array.isArray(filters.positions) ? filters.positions : [filters.positions]).forEach(p => 
          params.append('positions', p)
        );
      }
      if (filters.locations) {
        (Array.isArray(filters.locations) ? filters.locations : [filters.locations]).forEach(l => 
          params.append('locations', l)
        );
      }
      if (filters.salaryMin) params.append('salaryMin', filters.salaryMin);
      if (filters.salaryMax) params.append('salaryMax', filters.salaryMax);
      if (filters.employmentTypes) {
        (Array.isArray(filters.employmentTypes) ? filters.employmentTypes : [filters.employmentTypes]).forEach(t => 
          params.append('employmentTypes', t)
        );
      }
      if (filters.experience) params.append('experience', filters.experience);
      params.append('sortBy', filters.sortBy);
      params.append('sortOrder', filters.sortOrder);
      params.append('page', currentPage);
      params.append('limit', pageSize);

      const response = await axios.get(`/api/advancedSearch/search?${params.toString()}`);
      const data = response.data;
      
      if (data.success) {
        setJobs(data.results || []);
        setTotalResults(data.totalResults || 0);
      }
    } catch (error) {
      console.error('Error fetching jobs:', error);
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (query) => {
    setFilters({ ...filters, q: query });
    setCurrentPage(1);
  };

  const handleFiltersChange = (newFilters) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters,
    }));
    setCurrentPage(1);
  };

  const handleSalaryChange = ({ min, max }) => {
    setFilters(prev => ({
      ...prev,
      salaryMin: min || null,
      salaryMax: max || null,
    }));
    setCurrentPage(1);
  };

  const handleSortChange = ({ sortBy, sortOrder }) => {
    setFilters(prev => ({
      ...prev,
      sortBy,
      sortOrder,
    }));
    setCurrentPage(1);
  };

  const handleApplySavedFilter = (filter) => {
    setFilters({
      q: filter.keywords?.join(' ') || '',
      positions: filter.positions || null,
      locations: filter.locations || null,
      salaryMin: filter.salaryMin || null,
      salaryMax: filter.salaryMax || null,
      employmentTypes: filter.employmentTypes || null,
      experience: filter.experience || null,
      sortBy: filter.sortBy || 'relevance',
      sortOrder: filter.sortOrder || 'desc',
    });
    setCurrentPage(1);
  };

  const clearAllFilters = () => {
    setFilters({
      q: '',
      positions: null,
      locations: null,
      salaryMin: null,
      salaryMax: null,
      employmentTypes: null,
      experience: null,
      sortBy: 'relevance',
      sortOrder: 'desc',
    });
    setCurrentPage(1);
  };

  return (
    <div className="jobs-page">
      <div className="jobs-container">
        {/* Header */}
        <div className="jobs-header">
          <h1>Find Your Next Opportunity</h1>
          <p>Search and filter pharmacy jobs</p>
        </div>

        <div className="jobs-layout">
          {/* Sidebar with Filters */}
          <aside className="jobs-sidebar">
            <SearchBar 
              onSearch={handleSearchChange}
              placeholder="Search job title, position..."
              suggestions={['Pharmacist', 'Dispensary Assistant', 'Manager', 'Intern']}
            />

            <SalaryRangeSlider 
              onSalaryChange={handleSalaryChange}
              initialMin={filters.salaryMin}
              initialMax={filters.salaryMax}
            />

            <FilterPanel 
              onFiltersChange={handleFiltersChange}
              initialFilters={filters}
            />

            {userId && (
              <SavedFiltersPanel 
                onApplyFilter={handleApplySavedFilter}
                userId={userId}
              />
            )}
          </aside>

          {/* Main Content */}
          <main className="jobs-main">
            {/* AI Recommendations */}
            <JobRecommendations />

            {/* Results Header */}
            <div className="results-header">
              <div className="results-info">
                <h2>
                  {totalResults > 0 ? (
                    <>
                      {totalResults.toLocaleString()} result{totalResults !== 1 ? 's' : ''} found
                      {activeFilterCount > 0 && ` (${activeFilterCount} filter${activeFilterCount !== 1 ? 's' : ''})`}
                    </>
                  ) : (
                    'No results'
                  )}
                </h2>
              </div>

              <div className="results-controls">
                <SortOptions 
                  onSortChange={handleSortChange}
                  currentSort={filters.sortBy}
                  currentOrder={filters.sortOrder}
                />
                {activeFilterCount > 0 && (
                  <button className="clear-filters-btn" onClick={clearAllFilters}>
                    Clear All Filters
                  </button>
                )}
              </div>
            </div>

            {/* Jobs List */}
            {loading ? (
              <div className="loading-state">
                <div className="spinner"></div>
                <p>Loading jobs...</p>
              </div>
            ) : jobs.length === 0 ? (
              <div className="no-results-state">
                <p className="no-results-message">
                  {filters.q || activeFilterCount > 0
                    ? 'No jobs found matching your criteria. Try adjusting your filters.'
                    : 'No jobs available. Check back soon!'}
                </p>
                {activeFilterCount > 0 && (
                  <button className="btn btn-primary" onClick={clearAllFilters}>
                    Clear Filters
                  </button>
                )}
              </div>
            ) : (
              <>
                <div className="jobs-list">
                  {jobs.map((job) => (
                    <div key={job.id || job._id} className="job-card-wrapper">
                      <Link to={`/jobs/${job.id || job._id}`} className="job-card">
                        <div className="job-card-header">
                          <div className="job-title-badge">
                            <h3>{job.title}</h3>
                            {job.featured && <span className="featured-badge">⭐ Featured</span>}
                          </div>
                          <div className="job-actions" onClick={(e) => e.preventDefault()}>
                            <SaveJobButton
                              jobId={job.id || job._id}
                              userId={userId}
                              size="small"
                              showText={false}
                            />
                          </div>
                        </div>

                        <div className="job-meta">
                          <span className="job-position">{job.position}</span>
                          <span className="job-type">{job.employmentType}</span>
                        </div>

                        <p className="job-pharmacy">
                          {job.pharmacy?.firstName} {job.pharmacy?.lastName}
                        </p>

                        <div className="job-details">
                          <span className="location">
                            📍 {job.locationCity || 'N/A'}, {job.locationProvince || 'N/A'}
                          </span>
                          <span className="salary">
                            💰 {job.salaryMin ? `ZWL ${job.salaryMin}` : 'N/A'} - {job.salaryMax ? `ZWL ${job.salaryMax}` : 'N/A'}
                          </span>
                        </div>

                        <div className="job-footer">
                          <small className="posted-date">
                            {job.createdAt && `Posted ${new Date(job.createdAt).toLocaleDateString()}`}
                          </small>
                        </div>
                      </Link>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {totalResults > pageSize && (
                  <div className="pagination">
                    <button 
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="pagination-btn"
                    >
                      Previous
                    </button>
                    <span className="pagination-info">
                      Page {currentPage} of {Math.ceil(totalResults / pageSize)}
                    </span>
                    <button 
                      onClick={() => setCurrentPage(p => p + 1)}
                      disabled={currentPage >= Math.ceil(totalResults / pageSize)}
                      className="pagination-btn"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

export default JobsPage;
