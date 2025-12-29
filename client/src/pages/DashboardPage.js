import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaBriefcase, FaBookmark, FaBell, FaEnvelope, FaUserTie, FaCheckCircle, FaClock, FaTimesCircle } from 'react-icons/fa';
import './DashboardPage.css';

function DashboardPage() {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const navigate = useNavigate();

  useEffect(() => {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      navigate('/login');
      return;
    }
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const userId = localStorage.getItem('userId');
      const token = localStorage.getItem('token');
      const response = await axios.get(`/api/users/${userId}/dashboard`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDashboardData(response.data);
    } catch (error) {
      console.error('Error fetching dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="container"><p>Loading dashboard...</p></div>;
  if (!dashboardData) return <div className="container"><p>Unable to load dashboard</p></div>;

  const { user, stats, appliedJobs, savedJobs, postedJobs } = dashboardData;

  const getStatusIcon = (status) => {
    switch (status) {
      case 'accepted':
        return <FaCheckCircle className="status-icon accepted" />;
      case 'rejected':
        return <FaTimesCircle className="status-icon rejected" />;
      case 'shortlisted':
      case 'interview':
        return <FaClock className="status-icon pending" />;
      default:
        return <FaClock className="status-icon default" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'accepted':
        return 'accepted';
      case 'rejected':
        return 'rejected';
      case 'shortlisted':
      case 'interview':
        return 'shortlisted';
      default:
        return 'pending';
    }
  };

  return (
    <div className="dashboard-page">
      <div className="container">
        <h1>Welcome back, {user.firstName}!</h1>
        
        {/* Stats Overview */}
        <div className="dashboard-stats">
          {user.userType === 'job_seeker' ? (
            <>
              <div className="stat-card">
                <FaBriefcase className="stat-icon" />
                <div>
                  <h3>{stats?.applicationsCount || 0}</h3>
                  <p>Applications</p>
                </div>
              </div>
              <div className="stat-card">
                <FaBookmark className="stat-icon" />
                <div>
                  <h3>{stats?.savedJobsCount || 0}</h3>
                  <p>Saved Jobs</p>
                </div>
              </div>
              <div className="stat-card">
                <FaBell className="stat-icon" />
                <div>
                  <h3>{stats?.unreadNotifications || 0}</h3>
                  <p>Notifications</p>
                </div>
              </div>
              <div className="stat-card">
                <FaEnvelope className="stat-icon" />
                <div>
                  <h3>{stats?.unreadMessages || 0}</h3>
                  <p>Messages</p>
                </div>
              </div>
            </>
          ) : user.userType === 'pharmacy' ? (
            <>
              <div className="stat-card">
                <FaBriefcase className="stat-icon" />
                <div>
                  <h3>{stats?.postedJobsCount || 0}</h3>
                  <p>Posted Jobs</p>
                </div>
              </div>
              <div className="stat-card">
                <FaUserTie className="stat-icon" />
                <div>
                  <h3>{stats?.totalApplications || 0}</h3>
                  <p>Applications</p>
                </div>
              </div>
              <div className="stat-card">
                <FaCheckCircle className="stat-icon" />
                <div>
                  <h3>{stats?.activeJobsCount || 0}</h3>
                  <p>Active Jobs</p>
                </div>
              </div>
              <div className="stat-card">
                <FaBell className="stat-icon" />
                <div>
                  <h3>{stats?.unreadNotifications || 0}</h3>
                  <p>Notifications</p>
                </div>
              </div>
            </>
          ) : null}
        </div>

        {/* Tabs */}
        <div className="dashboard-tabs">
          {user.userType === 'job_seeker' && (
            <>
              <button
                className={activeTab === 'overview' ? 'active' : ''}
                onClick={() => setActiveTab('overview')}
              >
                Overview
              </button>
              <button
                className={activeTab === 'applications' ? 'active' : ''}
                onClick={() => setActiveTab('applications')}
              >
                My Applications
              </button>
              <button
                className={activeTab === 'saved' ? 'active' : ''}
                onClick={() => setActiveTab('saved')}
              >
                Saved Jobs
              </button>
            </>
          )}
          {user.userType === 'pharmacy' && (
            <>
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
                My Jobs
              </button>
            </>
          )}
        </div>

        {/* Tab Content */}
        <div className="dashboard-content">
          {user.userType === 'job_seeker' && (
            <>
              {activeTab === 'applications' && (
                <div className="applications-list">
                  <h2>My Job Applications</h2>
                  {appliedJobs && appliedJobs.length > 0 ? (
                    <div className="applications-grid">
                      {appliedJobs.map((item) => (
                        <div key={item.job._id} className="application-card">
                          <div className="application-header">
                            <h3>{item.job.title}</h3>
                            <span className={`status-badge ${getStatusColor(item.applicationStatus)}`}>
                              {getStatusIcon(item.applicationStatus)}
                              {item.applicationStatus || 'pending'}
                            </span>
                          </div>
                          <p className="application-position">{item.job.position}</p>
                          <p className="application-location">
                            {item.job.location?.city}, {item.job.location?.province}
                          </p>
                          <p className="application-pharmacy">
                            {item.job.pharmacy?.firstName} {item.job.pharmacy?.lastName}
                          </p>
                          <p className="application-date">
                            Applied: {new Date(item.appliedAt).toLocaleDateString()}
                          </p>
                          <button
                            className="btn-view-job"
                            onClick={() => navigate(`/jobs/${item.job._id}`)}
                          >
                            View Job
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p>You haven't applied to any jobs yet.</p>
                  )}
                </div>
              )}

              {activeTab === 'saved' && (
                <div className="saved-jobs-list">
                  <h2>Saved Jobs</h2>
                  {savedJobs && savedJobs.length > 0 ? (
                    <div className="saved-jobs-grid">
                      {savedJobs.map((job) => (
                        <div key={job._id} className="saved-job-card">
                          <h3>{job.title}</h3>
                          <p>{job.position}</p>
                          <p>{job.location?.city}, {job.location?.province}</p>
                          <button
                            className="btn-view-job"
                            onClick={() => navigate(`/jobs/${job._id}`)}
                          >
                            View Job
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p>You haven't saved any jobs yet.</p>
                  )}
                </div>
              )}
            </>
          )}

          {user.userType === 'pharmacy' && (
            <>
              {activeTab === 'jobs' && (
                <div className="posted-jobs-list">
                  <h2>My Posted Jobs</h2>
                  {postedJobs && postedJobs.length > 0 ? (
                    <div className="posted-jobs-grid">
                      {postedJobs.map((job) => (
                        <div key={job._id} className="posted-job-card">
                          <div className="job-card-header">
                            <h3>{job.title}</h3>
                            <span className={`job-status ${job.status}`}>{job.status}</span>
                          </div>
                          <p>{job.position}</p>
                          <div className="job-stats">
                            <span>{job.applicants.length} applicants</span>
                            <span>{job.views} views</span>
                          </div>
                          <div className="job-actions">
                            <button
                              className="btn-view-applications"
                              onClick={() => navigate(`/jobs/${job._id}/applications`)}
                            >
                              View Applications
                            </button>
                            <button
                              className="btn-view-job"
                              onClick={() => navigate(`/jobs/${job._id}`)}
                            >
                              View Job
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p>You haven't posted any jobs yet.</p>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;

