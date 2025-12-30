import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import ApplicationStatusBadge from '../components/ApplicationStatusBadge';
import ApplicationTimeline from '../components/ApplicationTimeline';
import Modal from '../components/Modal';
import LoadingSpinner from '../components/LoadingSpinner';
import Toast from '../components/Toast';
import './MyApplicationsPage.css';

function MyApplicationsPage() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [toast, setToast] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');

  const userId = localStorage.getItem('userId');

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/applications/user/${userId}`);
      setApplications(response.data);
    } catch (error) {
      console.error('Error fetching applications:', error);
      setToast({ message: 'Failed to load applications', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const filteredApplications = filterStatus === 'all' 
    ? applications 
    : applications.filter(app => app.status === filterStatus);

  const handleViewDetails = (application) => {
    setSelectedApplication(application);
    setShowModal(true);
  };

  const getProgressPercentage = (status) => {
    const statusOrder = {
      pending: 20,
      reviewing: 40,
      shortlisted: 60,
      interview: 80,
      accepted: 100,
      rejected: 0,
    };
    return statusOrder[status] || 0;
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="my-applications-page">
      <div className="container">
        <h1>My Applications</h1>
        <p className="page-subtitle">Track your job applications and their status</p>

        <div className="filter-tabs">
          <button
            className={`filter-tab ${filterStatus === 'all' ? 'active' : ''}`}
            onClick={() => setFilterStatus('all')}
          >
            All ({applications.length})
          </button>
          <button
            className={`filter-tab ${filterStatus === 'pending' ? 'active' : ''}`}
            onClick={() => setFilterStatus('pending')}
          >
            Pending ({applications.filter(a => a.status === 'pending').length})
          </button>
          <button
            className={`filter-tab ${filterStatus === 'reviewing' ? 'active' : ''}`}
            onClick={() => setFilterStatus('reviewing')}
          >
            Reviewing ({applications.filter(a => a.status === 'reviewing').length})
          </button>
          <button
            className={`filter-tab ${filterStatus === 'shortlisted' ? 'active' : ''}`}
            onClick={() => setFilterStatus('shortlisted')}
          >
            Shortlisted ({applications.filter(a => a.status === 'shortlisted').length})
          </button>
          <button
            className={`filter-tab ${filterStatus === 'interview' ? 'active' : ''}`}
            onClick={() => setFilterStatus('interview')}
          >
            Interview ({applications.filter(a => a.status === 'interview').length})
          </button>
          <button
            className={`filter-tab ${filterStatus === 'accepted' ? 'active' : ''}`}
            onClick={() => setFilterStatus('accepted')}
          >
            Accepted ({applications.filter(a => a.status === 'accepted').length})
          </button>
        </div>

        {filteredApplications.length === 0 ? (
          <div className="empty-state">
            <p>No applications {filterStatus !== 'all' ? `with status "${filterStatus}"` : 'yet'}</p>
            <Link to="/jobs" className="btn btn-primary">Browse Jobs</Link>
          </div>
        ) : (
          <div className="applications-list">
            {filteredApplications.map((application) => (
              <div key={application._id} className="application-card">
                <div className="application-header">
                  <div className="application-title">
                    <h3>{application.jobId?.title}</h3>
                    <p className="pharmacy-name">{application.pharmacyId?.firstName} {application.pharmacyId?.lastName}</p>
                  </div>
                  <ApplicationStatusBadge status={application.status} />
                </div>

                <div className="application-progress">
                  <div className="progress-bar">
                    <div 
                      className="progress-fill" 
                      style={{ width: `${getProgressPercentage(application.status)}%` }}
                    ></div>
                  </div>
                  <p className="progress-text">{getProgressPercentage(application.status)}% Complete</p>
                </div>

                <div className="application-details">
                  <div className="detail-item">
                    <label>Applied On</label>
                    <p>{new Date(application.appliedAt).toLocaleDateString()}</p>
                  </div>
                  <div className="detail-item">
                    <label>Position</label>
                    <p>{application.jobId?.position}</p>
                  </div>
                  <div className="detail-item">
                    <label>Location</label>
                    <p>{application.jobId?.location?.city}</p>
                  </div>
                  {application.interviewDate && (
                    <div className="detail-item interview-date">
                      <label>Interview Date</label>
                      <p>
                        {new Date(application.interviewDate).toLocaleDateString()} at {application.interviewTime}
                      </p>
                    </div>
                  )}
                  {application.status === 'accepted' && (
                    <div className="detail-item accepted-info">
                      <label>Salary</label>
                      <p>ZWL {application.salary?.toLocaleString()}</p>
                    </div>
                  )}
                </div>

                <button 
                  className="btn btn-secondary view-details-btn"
                  onClick={() => handleViewDetails(application)}
                >
                  View Details
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Details Modal */}
      <Modal 
        isOpen={showModal} 
        onClose={() => setShowModal(false)}
        title="Application Details"
      >
        {selectedApplication && (
          <div className="application-modal-content">
            <div className="modal-section">
              <h4>Job Information</h4>
              <p><strong>Position:</strong> {selectedApplication.jobId?.title}</p>
              <p><strong>Type:</strong> {selectedApplication.jobId?.employmentType}</p>
              <p><strong>Salary Range:</strong> ZWL {selectedApplication.jobId?.salary?.min} - {selectedApplication.jobId?.salary?.max}</p>
            </div>

            <div className="modal-section">
              <h4>Application Status</h4>
              <ApplicationTimeline application={selectedApplication} />
            </div>

            {selectedApplication.status === 'interview' && (
              <div className="modal-section interview-section">
                <h4>Interview Details</h4>
                <p><strong>Date:</strong> {new Date(selectedApplication.interviewDate).toLocaleDateString()}</p>
                <p><strong>Time:</strong> {selectedApplication.interviewTime}</p>
                <p><strong>Location:</strong> {selectedApplication.interviewLocation}</p>
              </div>
            )}

            {selectedApplication.status === 'accepted' && (
              <div className="modal-section accepted-section">
                <h4>Offer Details</h4>
                <p><strong>Salary:</strong> ZWL {selectedApplication.salary}</p>
                <p><strong>Start Date:</strong> {new Date(selectedApplication.startDate).toLocaleDateString()}</p>
              </div>
            )}

            {selectedApplication.status === 'rejected' && selectedApplication.rejectionReason && (
              <div className="modal-section rejection-section">
                <h4>Feedback</h4>
                <p>{selectedApplication.rejectionReason}</p>
              </div>
            )}

            {selectedApplication.feedback && (
              <div className="modal-section feedback-section">
                <h4>Interview Feedback</h4>
                <p>{selectedApplication.feedback}</p>
              </div>
            )}
          </div>
        )}
      </Modal>

      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}

export default MyApplicationsPage;
