import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ApplicationStatusBadge from '../components/ApplicationStatusBadge';
import Modal from '../components/Modal';
import LoadingSpinner from '../components/LoadingSpinner';
import Toast from '../components/Toast';
import './PharmacyApplicationsPage.css';

function PharmacyApplicationsPage() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [toast, setToast] = useState(null);
  const [stats, setStats] = useState({});

  const [statusUpdate, setStatusUpdate] = useState({
    status: 'reviewing',
    message: '',
    interviewDate: '',
    interviewTime: '',
    interviewLocation: '',
    rejectionReason: '',
    salary: '',
    startDate: '',
  });

  const pharmacyId = localStorage.getItem('pharmacyId') || localStorage.getItem('userId');

  useEffect(() => {
    fetchApplications();
    fetchStats();
  }, []);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/applications/pharmacy/${pharmacyId}`);
      setApplications(response.data);
    } catch (error) {
      console.error('Error fetching applications:', error);
      setToast({ message: 'Failed to load applications', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await axios.get(`/api/applications/stats/${pharmacyId}`);
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleUpdateStatus = async () => {
    try {
      await axios.put(`/api/applications/${selectedApplication._id}/status`, statusUpdate, {
        headers: { 'user-id': pharmacyId },
      });

      setToast({ message: 'Application status updated successfully', type: 'success' });
      setShowStatusModal(false);
      fetchApplications();
      fetchStats();
    } catch (error) {
      setToast({ message: 'Failed to update status', type: 'error' });
    }
  };

  const handleViewDetails = (application) => {
    setSelectedApplication(application);
    setStatusUpdate({ status: application.status });
    setShowModal(true);
  };

  const handleOpenStatusUpdate = () => {
    setShowStatusModal(true);
  };

  if (loading) return <LoadingSpinner />;

  const statusCounts = {
    pending: applications.filter(a => a.status === 'pending').length,
    reviewing: applications.filter(a => a.status === 'reviewing').length,
    shortlisted: applications.filter(a => a.status === 'shortlisted').length,
    interview: applications.filter(a => a.status === 'interview').length,
    accepted: applications.filter(a => a.status === 'accepted').length,
    rejected: applications.filter(a => a.status === 'rejected').length,
  };

  return (
    <div className="pharmacy-applications-page">
      <div className="container">
        <h1>Applications Management</h1>
        <p className="page-subtitle">Manage and track job applications</p>

        {/* Statistics */}
        <div className="stats-grid">
          <div className="stat-box">
            <div className="stat-number">{applications.length}</div>
            <div className="stat-label">Total Applications</div>
          </div>
          <div className="stat-box" style={{ borderColor: '#ffc107' }}>
            <div className="stat-number" style={{ color: '#ffc107' }}>{statusCounts.pending}</div>
            <div className="stat-label">Pending Review</div>
          </div>
          <div className="stat-box" style={{ borderColor: '#17a2b8' }}>
            <div className="stat-number" style={{ color: '#17a2b8' }}>{statusCounts.reviewing}</div>
            <div className="stat-label">Under Review</div>
          </div>
          <div className="stat-box" style={{ borderColor: '#00bfff' }}>
            <div className="stat-number" style={{ color: '#00bfff' }}>{statusCounts.shortlisted}</div>
            <div className="stat-label">Shortlisted</div>
          </div>
          <div className="stat-box" style={{ borderColor: '#28a745' }}>
            <div className="stat-number" style={{ color: '#28a745' }}>{statusCounts.interview}</div>
            <div className="stat-label">Interview Scheduled</div>
          </div>
          <div className="stat-box" style={{ borderColor: '#20c997' }}>
            <div className="stat-number" style={{ color: '#20c997' }}>{statusCounts.accepted}</div>
            <div className="stat-label">Accepted</div>
          </div>
        </div>

        {/* Applications Table */}
        <div className="applications-table-container">
          <table className="applications-table">
            <thead>
              <tr>
                <th>Applicant</th>
                <th>Position</th>
                <th>Applied Date</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {applications.length === 0 ? (
                <tr>
                  <td colSpan="5" className="empty-cell">No applications yet</td>
                </tr>
              ) : (
                applications.map((application) => (
                  <tr key={application._id}>
                    <td className="applicant-name">
                      <div>
                        <strong>{application.userId?.firstName} {application.userId?.lastName}</strong>
                        <p>{application.userId?.email}</p>
                      </div>
                    </td>
                    <td>{application.jobId?.position}</td>
                    <td>{new Date(application.appliedAt).toLocaleDateString()}</td>
                    <td>
                      <ApplicationStatusBadge status={application.status} />
                    </td>
                    <td>
                      <button
                        className="btn-view"
                        onClick={() => handleViewDetails(application)}
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Details Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Application Details"
      >
        {selectedApplication && (
          <div className="application-details-content">
            <div className="section">
              <h4>Applicant Information</h4>
              <p><strong>Name:</strong> {selectedApplication.userId?.firstName} {selectedApplication.userId?.lastName}</p>
              <p><strong>Email:</strong> {selectedApplication.userId?.email}</p>
              <p><strong>Phone:</strong> {selectedApplication.userId?.phone || 'Not provided'}</p>
              {selectedApplication.userId?.bio && (
                <p><strong>Bio:</strong> {selectedApplication.userId?.bio}</p>
              )}
            </div>

            <div className="section">
              <h4>Job Position</h4>
              <p><strong>Position:</strong> {selectedApplication.jobId?.title}</p>
              <p><strong>Type:</strong> {selectedApplication.jobId?.employmentType}</p>
              <p><strong>Salary Range:</strong> ZWL {selectedApplication.jobId?.salary?.min} - {selectedApplication.jobId?.salary?.max}</p>
            </div>

            {selectedApplication.coverLetter && (
              <div className="section">
                <h4>Cover Letter</h4>
                <p>{selectedApplication.coverLetter}</p>
              </div>
            )}

            <div className="section">
              <h4>Application Status</h4>
              <p><strong>Current Status:</strong> <ApplicationStatusBadge status={selectedApplication.status} /></p>
              <p><strong>Applied On:</strong> {new Date(selectedApplication.appliedAt).toLocaleDateString()}</p>
            </div>

            <button
              className="btn btn-primary"
              onClick={handleOpenStatusUpdate}
            >
              Update Status
            </button>
          </div>
        )}
      </Modal>

      {/* Status Update Modal */}
      <Modal
        isOpen={showStatusModal}
        onClose={() => setShowStatusModal(false)}
        title="Update Application Status"
      >
        <div className="status-update-form">
          <div className="form-group">
            <label>Status</label>
            <select
              value={statusUpdate.status}
              onChange={(e) => setStatusUpdate({ ...statusUpdate, status: e.target.value })}
            >
              <option value="pending">Pending</option>
              <option value="reviewing">Reviewing</option>
              <option value="shortlisted">Shortlisted</option>
              <option value="interview">Interview Scheduled</option>
              <option value="accepted">Accepted</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          {statusUpdate.status === 'interview' && (
            <>
              <div className="form-group">
                <label>Interview Date</label>
                <input
                  type="date"
                  value={statusUpdate.interviewDate}
                  onChange={(e) => setStatusUpdate({ ...statusUpdate, interviewDate: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Interview Time</label>
                <input
                  type="time"
                  value={statusUpdate.interviewTime}
                  onChange={(e) => setStatusUpdate({ ...statusUpdate, interviewTime: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Interview Location</label>
                <input
                  type="text"
                  placeholder="e.g., Conference Room, Video Call"
                  value={statusUpdate.interviewLocation}
                  onChange={(e) => setStatusUpdate({ ...statusUpdate, interviewLocation: e.target.value })}
                />
              </div>
            </>
          )}

          {statusUpdate.status === 'accepted' && (
            <>
              <div className="form-group">
                <label>Salary (ZWL)</label>
                <input
                  type="number"
                  value={statusUpdate.salary}
                  onChange={(e) => setStatusUpdate({ ...statusUpdate, salary: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Start Date</label>
                <input
                  type="date"
                  value={statusUpdate.startDate}
                  onChange={(e) => setStatusUpdate({ ...statusUpdate, startDate: e.target.value })}
                />
              </div>
            </>
          )}

          {statusUpdate.status === 'rejected' && (
            <div className="form-group">
              <label>Rejection Reason</label>
              <textarea
                placeholder="Provide feedback to the applicant..."
                value={statusUpdate.rejectionReason}
                onChange={(e) => setStatusUpdate({ ...statusUpdate, rejectionReason: e.target.value })}
                rows={4}
              ></textarea>
            </div>
          )}

          <div className="form-group">
            <label>Message (Optional)</label>
            <textarea
              placeholder="Add a message to the applicant..."
              value={statusUpdate.message}
              onChange={(e) => setStatusUpdate({ ...statusUpdate, message: e.target.value })}
              rows={3}
            ></textarea>
          </div>

          <button
            className="btn btn-primary"
            onClick={handleUpdateStatus}
          >
            Update Status
          </button>
        </div>
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

export default PharmacyApplicationsPage;
