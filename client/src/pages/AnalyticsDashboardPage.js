import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import './AnalyticsDashboardPage.css';

function AnalyticsDashboardPage() {
  const { user, token } = useAuth();
  const [analyticsData, setAnalyticsData] = useState({
    overview: null,
    jobPerformance: [],
    applicationConversion: null,
    loading: true,
    error: null
  });

  const [selectedPeriod, setSelectedPeriod] = useState('30');
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadAnalyticsData();
  }, [user, selectedPeriod]);

  const loadAnalyticsData = async () => {
    if (!user?.id || !token) return;

    try {
      setAnalyticsData(prev => ({ ...prev, loading: true, error: null }));

      const headers = { Authorization: `Bearer ${token}` };

      // Load overview data
      const overviewResponse = await axios.get(`/api/analytics/dashboard/${user.id}?period=${selectedPeriod}`, { headers });

      // Load job performance data
      const jobPerformanceResponse = await axios.get(`/api/analytics/jobs/${user.id}?period=${selectedPeriod}`, { headers });

      // Load application conversion data
      const applicationConversionResponse = await axios.get(`/api/analytics/applications/${user.id}?period=${selectedPeriod}`, { headers });

      setAnalyticsData({
        overview: overviewResponse.data.data,
        jobPerformance: jobPerformanceResponse.data.data,
        applicationConversion: applicationConversionResponse.data.data,
        loading: false,
        error: null
      });
    } catch (error) {
      console.error('Failed to load analytics data:', error);
      setAnalyticsData(prev => ({
        ...prev,
        loading: false,
        error: error.response?.data?.message || 'Failed to load analytics data'
      }));
    }
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat().format(num);
  };

  const formatPercentage = (num) => {
    return `${num.toFixed(1)}%`;
  };

  if (!user) {
    return <div className="analytics-container"><p>Please login to access analytics.</p></div>;
  }

  if (analyticsData.loading) {
    return <div className="analytics-container"><div className="loading-spinner">Loading analytics...</div></div>;
  }

  if (analyticsData.error) {
    return <div className="analytics-container"><div className="error-message">{analyticsData.error}</div></div>;
  }

  const { overview, jobPerformance, applicationConversion } = analyticsData;

  return (
    <div className="analytics-container">
      <div className="analytics-header">
        <h1>Analytics Dashboard</h1>
        <div className="period-selector">
          <label>Time Period:</label>
          <select value={selectedPeriod} onChange={(e) => setSelectedPeriod(e.target.value)}>
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
            <option value="365">Last year</option>
          </select>
        </div>
      </div>

      <div className="analytics-tabs">
        <button
          className={activeTab === 'overview' ? 'active' : ''}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button
          className={activeTab === 'jobs' ? 'active' : ''}
          onClick={() => setActiveTab('jobs')}
        >
          Job Performance
        </button>
        <button
          className={activeTab === 'applications' ? 'active' : ''}
          onClick={() => setActiveTab('applications')}
        >
          Applications
        </button>
      </div>

      {activeTab === 'overview' && overview && (
        <div className="analytics-overview">
          <div className="metrics-grid">
            <div className="metric-card">
              <h3>Active Jobs</h3>
              <div className="metric-value">{overview.activeJobs}</div>
              <p className="metric-description">Currently active job postings</p>
            </div>

            <div className="metric-card">
              <h3>Total Jobs Posted</h3>
              <div className="metric-value">{overview.totalJobsPosted}</div>
              <p className="metric-description">Jobs posted in selected period</p>
            </div>

            <div className="metric-card">
              <h3>Total Applications</h3>
              <div className="metric-value">{overview.totalApplications}</div>
              <p className="metric-description">Applications received</p>
            </div>

            <div className="metric-card">
              <h3>Conversion Rate</h3>
              <div className="metric-value">{formatPercentage(overview.conversionRate)}</div>
              <p className="metric-description">Applications per job posting</p>
            </div>
          </div>

          <div className="application-status-chart">
            <h3>Applications by Status</h3>
            <div className="status-bars">
              {Object.entries(overview.applicationsByStatus).map(([status, count]) => (
                <div key={status} className="status-bar">
                  <div className="status-label">
                    <span className={`status-dot status-${status}`}></span>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </div>
                  <div className="status-value">{count}</div>
                  <div className="status-bar-fill" style={{
                    width: `${overview.totalApplications > 0 ? (count / overview.totalApplications) * 100 : 0}%`
                  }}></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'jobs' && (
        <div className="job-performance">
          <h2>Job Performance Metrics</h2>
          {jobPerformance.length === 0 ? (
            <p>No job performance data available for the selected period.</p>
          ) : (
            <div className="job-performance-table">
              <table>
                <thead>
                  <tr>
                    <th>Job Title</th>
                    <th>Position</th>
                    <th>Total Views</th>
                    <th>Applications</th>
                    <th>Conversion Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {jobPerformance.map((job) => (
                    <tr key={job.jobId}>
                      <td>{job.title}</td>
                      <td>{job.position}</td>
                      <td>{formatNumber(job.totalViews)}</td>
                      <td>{formatNumber(job.totalApplications)}</td>
                      <td>{formatPercentage(job.conversionRate)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === 'applications' && applicationConversion && (
        <div className="application-analytics">
          <h2>Application Conversion Funnel</h2>

          <div className="funnel-overview">
            <div className="funnel-metrics">
              <div className="funnel-metric">
                <h4>Total Applications</h4>
                <div className="funnel-value">{formatNumber(applicationConversion.totalApplications)}</div>
              </div>
              <div className="funnel-metric">
                <h4>Interview Rate</h4>
                <div className="funnel-value">{formatPercentage(applicationConversion.conversionToInterview)}</div>
              </div>
              <div className="funnel-metric">
                <h4>Offer Rate</h4>
                <div className="funnel-value">{formatPercentage(applicationConversion.conversionToOffer)}</div>
              </div>
            </div>
          </div>

          <div className="funnel-visualization">
            <div className="funnel-stage">
              <div className="stage-label">Total Applications</div>
              <div className="stage-bar" style={{ width: '100%' }}>
                <span className="stage-count">{applicationConversion.totalApplications}</span>
              </div>
            </div>
            <div className="funnel-stage">
              <div className="stage-label">Shortlisted</div>
              <div className="stage-bar" style={{
                width: `${applicationConversion.totalApplications > 0 ? (applicationConversion.shortlisted / applicationConversion.totalApplications) * 100 : 0}%`
              }}>
                <span className="stage-count">{applicationConversion.shortlisted}</span>
              </div>
            </div>
            <div className="funnel-stage">
              <div className="stage-label">Interviews</div>
              <div className="stage-bar" style={{
                width: `${applicationConversion.totalApplications > 0 ? (applicationConversion.interview / applicationConversion.totalApplications) * 100 : 0}%`
              }}>
                <span className="stage-count">{applicationConversion.interview}</span>
              </div>
            </div>
            <div className="funnel-stage">
              <div className="stage-label">Offers</div>
              <div className="stage-bar" style={{
                width: `${applicationConversion.totalApplications > 0 ? (applicationConversion.accepted / applicationConversion.totalApplications) * 100 : 0}%`
              }}>
                <span className="stage-count">{applicationConversion.accepted}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AnalyticsDashboardPage;
