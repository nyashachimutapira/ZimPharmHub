import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './JobRecommendations.css';

function JobRecommendations() {
  const { user } = useAuth();
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user && user.userType === 'job_seeker') {
      fetchRecommendations();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/jobs/recommendations/${user.id}`);
      setRecommendations(response.data.recommendations || []);
    } catch (err) {
      console.error('Error fetching recommendations:', err);
      setError(err.response?.data?.message || 'Failed to load recommendations');
    } finally {
      setLoading(false);
    }
  };

  if (!user || user.userType !== 'job_seeker') {
    return null;
  }

  if (loading) {
    return (
      <div className="job-recommendations">
        <h3>AI Job Recommendations</h3>
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Analyzing your profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="job-recommendations">
        <h3>AI Job Recommendations</h3>
        <div className="error-state">
          <p>{error}</p>
          <button onClick={fetchRecommendations} className="btn btn-primary">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (recommendations.length === 0) {
    return (
      <div className="job-recommendations">
        <h3>AI Job Recommendations</h3>
        <div className="no-recommendations">
          <p>Complete your resume to get personalized job recommendations!</p>
          <Link to="/resume-builder" className="btn btn-primary">
            Build Resume
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="job-recommendations">
      <h3>AI Job Recommendations</h3>
      <p className="recommendations-subtitle">
        Jobs tailored to your skills and experience
      </p>

      <div className="recommendations-list">
        {recommendations.map((job) => (
          <div key={job.id} className="recommendation-card">
            <div className="recommendation-header">
              <div className="match-score">
                <span className="score-badge">{job.matchScore}% Match</span>
              </div>
              {job.featured && <span className="featured-badge">⭐ Featured</span>}
            </div>

            <div className="recommendation-content">
              <h4>
                <Link to={`/jobs/${job.id}`}>{job.title}</Link>
              </h4>

              <div className="job-meta">
                <span className="position">{job.position}</span>
                <span className="type">{job.employmentType}</span>
              </div>

              <p className="pharmacy">
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

              {job.matchReasons && job.matchReasons.length > 0 && (
                <div className="match-reasons">
                  <strong>Why this matches:</strong>
                  <ul>
                    {job.matchReasons.map((reason, index) => (
                      <li key={index}>{reason}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="recommendation-actions">
                <Link to={`/jobs/${job.id}`} className="btn btn-primary">
                  View Details
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default JobRecommendations;
