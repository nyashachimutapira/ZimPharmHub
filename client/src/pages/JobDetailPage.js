import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import './JobDetailPage.css';

function JobDetailPage() {
  const { id } = useParams();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchJob();
  }, [id]);

  const fetchJob = async () => {
    try {
      const response = await axios.get(`/api/jobs/${id}`);
      setJob(response.data);
    } catch (error) {
      console.error('Error fetching job:', error);
    } finally {
      setLoading(false);
    }
  };

  const [resumeFile, setResumeFile] = useState(null);
  const [coverLetter, setCoverLetter] = useState('');

  const handleApply = async () => {
    try {
      const form = new FormData();
      if (resumeFile) form.append('resume', resumeFile);
      form.append('coverLetter', coverLetter);

      await axios.post(`/api/jobs/${id}/apply`, form, {
        headers: { 'user-id': localStorage.getItem('userId'), 'Content-Type': 'multipart/form-data' }
      });
      alert('Application submitted successfully!');
      fetchJob();
    } catch (error) {
      alert('Error applying for job: ' + (error.response?.data?.message || error.message));
    }
  };

  if (loading) return <div className="container"><p>Loading job details...</p></div>;
  if (!job) return <div className="container"><p>Job not found</p></div>;

  return (
    <div className="job-detail-page">
      <div className="container">
        <div className="job-detail-header">
          <h1>{job.title}</h1>
          <div style={{display: 'flex', gap: '8px', alignItems: 'center'}}>
            <input type="file" accept=".pdf,.doc,.docx" onChange={(e) => setResumeFile(e.target.files[0])} />
            <button className="btn btn-primary" onClick={handleApply}>Apply Now</button>
          </div>
        </div>

        <div className="job-apply-section" style={{marginTop: '12px'}}>
          <label>Cover Letter (optional)</label>
          <textarea value={coverLetter} onChange={(e) => setCoverLetter(e.target.value)} rows={4} style={{width: '100%'}} />
        </div>

        <div className="job-detail-grid">
          <div className="job-detail-main">
            <div className="job-info">
              <div className="info-item">
                <label>Position:</label>
                <p>{job.position}</p>
              </div>
              <div className="info-item">
                <label>Location:</label>
                <p>{job.location?.city}, {job.location?.province}</p>
              </div>
              <div className="info-item">
                <label>Employment Type:</label>
                <p>{job.employmentType}</p>
              </div>
              <div className="info-item">
                <label>Salary:</label>
                <p>ZWL {job.salary?.min} - {job.salary?.max}</p>
              </div>
            </div>

            <div className="job-description">
              <h2>About this role</h2>
              <p>{job.description}</p>
            </div>

            <div className="job-section">
              <h2>Responsibilities</h2>
              <ul>
                {job.responsibilities?.map((resp, index) => (
                  <li key={index}>{resp}</li>
                ))}
              </ul>
            </div>

            <div className="job-section">
              <h2>Requirements</h2>
              <ul>
                {job.requirements?.map((req, index) => (
                  <li key={index}>{req}</li>
                ))}
              </ul>
            </div>

            <div className="job-deadline">
              <label>Application Deadline:</label>
              <p>{new Date(job.applicationDeadline).toLocaleDateString()}</p>
            </div>
          </div>

          <div className="job-detail-sidebar">
            <div className="pharmacy-card">
              <h3>About the Pharmacy</h3>
              <p className="pharmacy-name">{job.pharmacy?.firstName} {job.pharmacy?.lastName}</p>
              <p className="pharmacy-email">{job.pharmacy?.email}</p>
              <button className="btn btn-secondary">View Pharmacy Profile</button>
            </div>

            <div className="stats-card">
              <div className="stat-item">
                <span className="stat-label">Views</span>
                <span className="stat-value">{job.views}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Applicants</span>
                <span className="stat-value">{job.applicants?.length || 0}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default JobDetailPage;
