import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { FaFileUpload, FaTimes, FaCheckCircle, FaExclamationCircle, FaFile, FaSpinner } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import './JobDetailPage.css';

function JobDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [applicationStatus, setApplicationStatus] = useState(null); // 'pending', 'success', 'error'

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
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [errors, setErrors] = useState({});
  const [hasApplied, setHasApplied] = useState(false);

  // Note: hasApplied state is set after a successful application or when backend returns "already applied" error

  const validateFile = (file) => {
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    const allowedExtensions = ['.pdf', '.doc', '.docx'];

    if (!file) return 'Please select a resume file';

    const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
    if (!allowedExtensions.includes(fileExtension)) {
      return 'Only PDF, DOC, and DOCX files are allowed';
    }

    if (!allowedTypes.includes(file.type)) {
      return 'Invalid file type. Please upload PDF, DOC, or DOCX';
    }

    if (file.size > maxSize) {
      return 'File size must be less than 5MB';
    }

    return null;
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      const error = validateFile(file);
      if (error) {
        setErrors({ resume: error });
      } else {
        setResumeFile(file);
        setErrors({ ...errors, resume: null });
      }
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const error = validateFile(file);
      if (error) {
        setErrors({ resume: error });
        setResumeFile(null);
      } else {
        setResumeFile(file);
        setErrors({ ...errors, resume: null });
      }
    }
  };

  const handleApply = async () => {
    setErrors({});
    
    // Validation
    if (!resumeFile) {
      setErrors({ resume: 'Please upload your resume' });
      return;
    }

    if (!isAuthenticated) {
      setShowApplyModal(false);
      navigate('/login', { state: { returnTo: `/jobs/${id}` } });
      return;
    }

    setUploading(true);
    setErrors({});

    try {
      const formData = new FormData();
      formData.append('resume', resumeFile);
      formData.append('coverLetter', coverLetter);

      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const userId = user?.id || localStorage.getItem('userId') || sessionStorage.getItem('userId');

      await axios.post(`/api/jobs/${id}/apply`, formData, {
        headers: {
          'user-id': userId,
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (progressEvent) => {
          // Optional: Show upload progress
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          console.log(`Upload Progress: ${percentCompleted}%`);
        }
      });

      setApplicationStatus('success');
      setHasApplied(true);
      setShowApplyModal(false);
      setResumeFile(null);
      setCoverLetter('');
      
      // Refresh job data
      fetchJob();
      
      // Auto-close success message after 5 seconds
      setTimeout(() => {
        setApplicationStatus(null);
      }, 5000);

    } catch (error) {
      setApplicationStatus('error');
      const errorMessage = error.response?.data?.message || error.message;
      setErrors({ submit: errorMessage });
      
      if (error.response?.status === 400 && (errorMessage.includes('Already applied') || errorMessage.includes('already applied'))) {
        setHasApplied(true);
        setShowApplyModal(false);
      }
    } finally {
      setUploading(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  if (loading) {
    return (
      <div className="job-detail-page">
        <div className="container">
          <div className="loading-state">
            <FaSpinner className="spinner" />
            <p>Loading job details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="job-detail-page">
        <div className="container">
          <div className="error-state">
            <FaExclamationCircle />
            <p>Job not found</p>
            <Link to="/jobs" className="btn btn-primary">Browse Jobs</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="job-detail-page">
      {/* Success Message */}
      {applicationStatus === 'success' && (
        <div className="alert alert-success-message">
          <FaCheckCircle />
          <div>
            <strong>Application Submitted!</strong>
            <p>Your application has been successfully submitted. We'll review it and get back to you soon.</p>
          </div>
          <button onClick={() => setApplicationStatus(null)} className="alert-close">
            <FaTimes />
          </button>
        </div>
      )}

      {/* Error Message */}
      {applicationStatus === 'error' && errors.submit && (
        <div className="alert alert-error-message">
          <FaExclamationCircle />
          <div>
            <strong>Error</strong>
            <p>{errors.submit}</p>
          </div>
          <button onClick={() => { setApplicationStatus(null); setErrors({}); }} className="alert-close">
            <FaTimes />
          </button>
        </div>
      )}

      <div className="container">
        <div className="job-detail-header">
          <div className="job-header-content">
            <h1>{job.title}</h1>
            <div className="job-meta-info">
              <span className="job-location">{job.location?.city}, {job.location?.province}</span>
              <span className="job-type">{job.employmentType}</span>
            </div>
          </div>
          <div className="job-actions">
            {!isAuthenticated ? (
              <Link to="/login" className="btn btn-primary">
                Login to Apply
              </Link>
            ) : hasApplied ? (
              <button className="btn btn-success" disabled>
                <FaCheckCircle /> Applied
              </button>
            ) : (
              <button className="btn btn-primary" onClick={() => setShowApplyModal(true)}>
                Apply Now
              </button>
            )}
          </div>
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

      {/* Application Modal */}
      {showApplyModal && (
        <div className="modal-overlay" onClick={() => !uploading && setShowApplyModal(false)}>
          <div className="modal-content application-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Apply for {job.title}</h2>
              <button 
                className="modal-close" 
                onClick={() => setShowApplyModal(false)}
                disabled={uploading}
              >
                <FaTimes />
              </button>
            </div>

            <div className="modal-body">
              <div className="form-group">
                <label htmlFor="resume-upload">
                  Resume <span className="required">*</span>
                </label>
                <div
                  className={`file-upload-area ${dragActive ? 'drag-active' : ''} ${resumeFile ? 'has-file' : ''} ${errors.resume ? 'has-error' : ''}`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <input
                    type="file"
                    id="resume-upload"
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileChange}
                    className="file-input"
                    disabled={uploading}
                  />
                  {resumeFile ? (
                    <div className="file-preview">
                      <FaFile className="file-icon" />
                      <div className="file-info">
                        <span className="file-name">{resumeFile.name}</span>
                        <span className="file-size">{formatFileSize(resumeFile.size)}</span>
                      </div>
                      <button
                        type="button"
                        className="file-remove"
                        onClick={() => {
                          setResumeFile(null);
                          setErrors({ ...errors, resume: null });
                        }}
                        disabled={uploading}
                      >
                        <FaTimes />
                      </button>
                    </div>
                  ) : (
                    <div className="file-upload-placeholder">
                      <FaFileUpload className="upload-icon" />
                      <p>
                        <strong>Click to upload</strong> or drag and drop
                      </p>
                      <p className="file-hint">PDF, DOC, or DOCX (Max 5MB)</p>
                    </div>
                  )}
                </div>
                {errors.resume && (
                  <span className="error-message">
                    <FaExclamationCircle /> {errors.resume}
                  </span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="cover-letter">
                  Cover Letter <span className="optional">(Optional)</span>
                </label>
                <textarea
                  id="cover-letter"
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  rows={6}
                  placeholder="Tell us why you're interested in this position and what makes you a great fit..."
                  disabled={uploading}
                  className={errors.coverLetter ? 'has-error' : ''}
                />
                <span className="field-hint">
                  {coverLetter.length} characters
                </span>
              </div>

              {errors.submit && (
                <div className="error-message submit-error">
                  <FaExclamationCircle /> {errors.submit}
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button
                className="btn btn-secondary"
                onClick={() => setShowApplyModal(false)}
                disabled={uploading}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary"
                onClick={handleApply}
                disabled={uploading || !resumeFile}
              >
                {uploading ? (
                  <>
                    <FaSpinner className="spinner" /> Uploading...
                  </>
                ) : (
                  <>
                    <FaFileUpload /> Submit Application
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default JobDetailPage;
