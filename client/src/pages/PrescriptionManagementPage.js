import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaUpload, FaDownload, FaCheckCircle, FaClock, FaTimesCircle, FaEye, FaTrash, FaPlus } from 'react-icons/fa';
import { motion } from 'framer-motion';
import ScrollAnimation from '../components/ScrollAnimation';
import './PrescriptionManagementPage.css';

function PrescriptionManagementPage() {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [formData, setFormData] = useState({
    medications: '',
    quantity: 1,
    notes: ''
  });
  const [file, setFile] = useState(null);
  const [user, setUser] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const statuses = {
    submitted: { color: '#ffc107', label: 'Submitted', icon: '📋' },
    verified: { color: '#0066cc', label: 'Verified', icon: '✓' },
    processing: { color: '#00a8ff', label: 'Processing', icon: '⏳' },
    ready_for_pickup: { color: '#4caf50', label: 'Ready for Pickup', icon: '✓' },
    delivered: { color: '#2e7d32', label: 'Delivered', icon: '✓' },
    cancelled: { color: '#f44336', label: 'Cancelled', icon: '✕' }
  };

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user'));
    setUser(userData);
    if (userData) {
      fetchPrescriptions(userData.id);
    }
  }, []);

  const fetchPrescriptions = async (userId) => {
    try {
      const response = await axios.get(`/api/prescriptions?userId=${userId}`);
      setPrescriptions(response.data || []);
    } catch (error) {
      console.error('Error fetching prescriptions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmitPrescription = async (e) => {
    e.preventDefault();
    if (!file) {
      alert('Please upload a prescription file');
      return;
    }

    setIsSubmitting(true);
    const formDataToSend = new FormData();
    formDataToSend.append('prescriptionFile', file);
    formDataToSend.append('medications', formData.medications);
    formDataToSend.append('quantity', formData.quantity);
    formDataToSend.append('notes', formData.notes);

    try {
      const response = await axios.post('/api/prescriptions', formDataToSend, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      alert('Prescription submitted successfully!');
      setFile(null);
      setFormData({ medications: '', quantity: 1, notes: '' });
      setShowUploadForm(false);
      fetchPrescriptions(user.id);
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to submit prescription');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeletePrescription = async (prescriptionId) => {
    if (window.confirm('Delete this prescription?')) {
      try {
        await axios.delete(`/api/prescriptions/${prescriptionId}`);
        fetchPrescriptions(user.id);
      } catch (error) {
        console.error('Error deleting prescription:', error);
      }
    }
  };

  const getStatusColor = (status) => statuses[status] || { color: '#999', label: 'Unknown', icon: '?' };

  return (
    <div className="prescription-page">
      {/* Hero Section */}
      <section className="prescription-hero">
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            Manage Your <span className="highlight">Prescriptions</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Upload, track, and manage your prescription requests
          </motion.p>
        </div>
      </section>

      <div className="container">
        {/* Upload Section */}
        <section className="upload-section">
          <ScrollAnimation animation="fadeUp">
            {!showUploadForm ? (
              <motion.button
                className="btn-new-prescription"
                onClick={() => setShowUploadForm(true)}
                whileHover={{ scale: 1.05 }}
              >
                <FaPlus /> New Prescription Request
              </motion.button>
            ) : (
              <div className="upload-form-card">
                <div className="form-header">
                  <h3>Upload Prescription</h3>
                  <button
                    className="close-btn"
                    onClick={() => setShowUploadForm(false)}
                  >
                    ✕
                  </button>
                </div>

                <form onSubmit={handleSubmitPrescription} className="upload-form">
                  <div className="form-group">
                    <label htmlFor="file">Upload Prescription Image/PDF *</label>
                    <div className="file-input-wrapper">
                      <FaUpload className="upload-icon" />
                      <input
                        id="file"
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={handleFileChange}
                        required
                      />
                      <span className="file-label">
                        {file ? file.name : 'Click to upload or drag and drop'}
                      </span>
                      <span className="file-hint">PDF, JPG or PNG</span>
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="medications">Medications</label>
                    <input
                      id="medications"
                      type="text"
                      placeholder="List medications (optional)"
                      value={formData.medications}
                      onChange={(e) => setFormData({ ...formData, medications: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="quantity">Quantity Needed</label>
                    <input
                      id="quantity"
                      type="number"
                      min="1"
                      value={formData.quantity}
                      onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="notes">Additional Notes</label>
                    <textarea
                      id="notes"
                      placeholder="Any special instructions..."
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      rows={4}
                    ></textarea>
                  </div>

                  <div className="form-actions">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="btn-submit"
                    >
                      {isSubmitting ? 'Submitting...' : 'Submit Request'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowUploadForm(false)}
                      className="btn-cancel"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}
          </ScrollAnimation>
        </section>

        {/* Prescriptions List */}
        <section className="prescriptions-section">
          <ScrollAnimation animation="fadeUp">
            <h2>Your Prescription Requests</h2>
          </ScrollAnimation>

          {loading ? (
            <div className="loading">
              <div className="spinner"></div>
              <p>Loading prescriptions...</p>
            </div>
          ) : prescriptions.length === 0 ? (
            <div className="no-prescriptions">
              <div className="empty-icon">📋</div>
              <h3>No prescriptions yet</h3>
              <p>Upload your first prescription to get started</p>
              <button
                className="btn-upload"
                onClick={() => setShowUploadForm(true)}
              >
                <FaPlus /> Upload Prescription
              </button>
            </div>
          ) : (
            <div className="prescriptions-list">
              {prescriptions.map((prescription, index) => {
                const status = getStatusColor(prescription.status);
                return (
                  <motion.div
                    key={prescription.id || index}
                    className="prescription-card"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className="card-header">
                      <div className="status-section">
                        <div
                          className="status-badge"
                          style={{ backgroundColor: status.color }}
                        >
                          {status.icon} {status.label}
                        </div>
                        <p className="order-number">
                          #{prescription.orderNumber}
                        </p>
                      </div>

                      <div className="card-actions">
                        <button
                          className="action-btn view"
                          onClick={() => setSelectedPrescription(prescription)}
                          title="View details"
                        >
                          <FaEye />
                        </button>
                        {prescription.status === 'submitted' && (
                          <button
                            className="action-btn delete"
                            onClick={() => handleDeletePrescription(prescription.id)}
                            title="Delete"
                          >
                            <FaTrash />
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="card-content">
                      <div className="info-row">
                        <span className="label">Submitted:</span>
                        <span className="value">
                          {new Date(prescription.createdAt).toLocaleDateString()}
                        </span>
                      </div>

                      {prescription.medications && (
                        <div className="info-row">
                          <span className="label">Medications:</span>
                          <span className="value">{prescription.medications}</span>
                        </div>
                      )}

                      {prescription.quantity && (
                        <div className="info-row">
                          <span className="label">Quantity:</span>
                          <span className="value">{prescription.quantity} unit(s)</span>
                        </div>
                      )}

                      {prescription.totalCost && (
                        <div className="info-row total-cost">
                          <span className="label">Estimated Cost:</span>
                          <span className="value">
                            {prescription.totalCost} {prescription.currency}
                          </span>
                        </div>
                      )}

                      {prescription.notes && (
                        <div className="info-row">
                          <span className="label">Notes:</span>
                          <span className="value">{prescription.notes}</span>
                        </div>
                      )}
                    </div>

                    {prescription.status === 'ready_for_pickup' && (
                      <div className="card-footer ready">
                        <FaCheckCircle /> Ready for pickup. Contact pharmacy for details.
                      </div>
                    )}

                    {prescription.status === 'verified' && (
                      <div className="card-footer processing">
                        <FaClock /> Pharmacies are verifying your prescription
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          )}
        </section>
      </div>

      {/* Detail Modal */}
      {selectedPrescription && (
        <div className="modal-overlay" onClick={() => setSelectedPrescription(null)}>
          <motion.div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
          >
            <button
              className="modal-close"
              onClick={() => setSelectedPrescription(null)}
            >
              ✕
            </button>

            <h2>Prescription Details</h2>

            <div className="modal-details">
              <div className="detail-item">
                <strong>Order Number:</strong>
                <span>#{selectedPrescription.orderNumber}</span>
              </div>

              <div className="detail-item">
                <strong>Status:</strong>
                <span
                  style={{
                    color: getStatusColor(selectedPrescription.status).color,
                    fontWeight: 'bold'
                  }}
                >
                  {getStatusColor(selectedPrescription.status).label}
                </span>
              </div>

              <div className="detail-item">
                <strong>Submitted Date:</strong>
                <span>{new Date(selectedPrescription.createdAt).toLocaleString()}</span>
              </div>

              {selectedPrescription.medications && (
                <div className="detail-item">
                  <strong>Medications:</strong>
                  <span>{selectedPrescription.medications}</span>
                </div>
              )}

              {selectedPrescription.prescriptionFile && (
                <div className="detail-item">
                  <strong>Prescription File:</strong>
                  <a
                    href={selectedPrescription.prescriptionFile}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="download-link"
                  >
                    <FaDownload /> Download
                  </a>
                </div>
              )}

              {selectedPrescription.totalCost && (
                <div className="detail-item">
                  <strong>Estimated Cost:</strong>
                  <span>{selectedPrescription.totalCost} {selectedPrescription.currency}</span>
                </div>
              )}
            </div>

            <button
              className="modal-btn"
              onClick={() => setSelectedPrescription(null)}
            >
              Close
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
}

export default PrescriptionManagementPage;
