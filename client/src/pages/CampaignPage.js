import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/CampaignPage.css';

function CampaignPage() {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    pharmacyId: '',
    name: '',
    description: '',
    campaignType: 'Email',
    subject: '',
    message: '',
    targetAudience: 'All Customers',
    totalRecipients: 0,
  });

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/operations/campaigns');
      setCampaigns(response.data);
    } catch (error) {
      console.error('Error fetching campaigns:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/operations/campaigns', formData);
      setShowForm(false);
      setFormData({
        pharmacyId: '',
        name: '',
        description: '',
        campaignType: 'Email',
        subject: '',
        message: '',
        targetAudience: 'All Customers',
        totalRecipients: 0,
      });
      fetchCampaigns();
    } catch (error) {
      console.error('Error creating campaign:', error);
    }
  };

  const handleSendCampaign = async (id) => {
    try {
      await axios.put(`/api/operations/campaigns/${id}/send`);
      fetchCampaigns();
    } catch (error) {
      console.error('Error sending campaign:', error);
    }
  };

  const handleScheduleCampaign = async (id, scheduledDate) => {
    try {
      await axios.put(`/api/operations/campaigns/${id}/schedule`, { scheduledDate });
      fetchCampaigns();
    } catch (error) {
      console.error('Error scheduling campaign:', error);
    }
  };

  return (
    <div className="campaign-page">
      <div className="page-header">
        <h1>SMS & Email Campaigns</h1>
        <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : 'Create Campaign'}
        </button>
      </div>

      {showForm && (
        <div className="form-container">
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label>Pharmacy ID</label>
                <input
                  type="text"
                  name="pharmacyId"
                  value={formData.pharmacyId}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Campaign Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Campaign Type</label>
                <select
                  name="campaignType"
                  value={formData.campaignType}
                  onChange={handleInputChange}
                >
                  <option value="Email">Email</option>
                  <option value="SMS">SMS</option>
                  <option value="Both">Both</option>
                </select>
              </div>
              <div className="form-group">
                <label>Target Audience</label>
                <select
                  name="targetAudience"
                  value={formData.targetAudience}
                  onChange={handleInputChange}
                >
                  <option value="All Customers">All Customers</option>
                  <option value="Specific Group">Specific Group</option>
                  <option value="Recent Buyers">Recent Buyers</option>
                  <option value="Inactive Users">Inactive Users</option>
                </select>
              </div>
            </div>

            {formData.campaignType !== 'SMS' && (
              <div className="form-group">
                <label>Subject</label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  placeholder="Email subject line"
                />
              </div>
            )}

            <div className="form-group">
              <label>Message</label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleInputChange}
                rows="6"
                placeholder="Enter your message here..."
                required
              />
            </div>

            <div className="form-group">
              <label>Expected Recipients</label>
              <input
                type="number"
                name="totalRecipients"
                value={formData.totalRecipients}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows="3"
                placeholder="Campaign description..."
              />
            </div>

            <button type="submit" className="btn-primary">Create Campaign</button>
          </form>
        </div>
      )}

      <div className="campaigns-grid">
        {loading ? (
          <p>Loading...</p>
        ) : campaigns.length === 0 ? (
          <p>No campaigns found</p>
        ) : (
          campaigns.map(campaign => (
            <div key={campaign.id} className="campaign-card">
              <div className="campaign-header">
                <h3>{campaign.name}</h3>
                <span className={`status ${campaign.status.toLowerCase()}`}>{campaign.status}</span>
              </div>

              <div className="campaign-details">
                <p><strong>Type:</strong> {campaign.campaignType}</p>
                <p><strong>Audience:</strong> {campaign.targetAudience}</p>
                <p><strong>Recipients:</strong> {campaign.totalRecipients}</p>
                {campaign.status === 'Sent' && (
                  <>
                    <p><strong>Sent:</strong> {campaign.sentCount}</p>
                    <p><strong>Failed:</strong> {campaign.failedCount}</p>
                  </>
                )}
              </div>

              <div className="campaign-message">
                {campaign.subject && <p><strong>Subject:</strong> {campaign.subject}</p>}
                <p className="message-preview">{campaign.message.substring(0, 100)}...</p>
              </div>

              <div className="campaign-actions">
                {campaign.status === 'Draft' && (
                  <>
                    <button className="btn-small btn-success" onClick={() => handleSendCampaign(campaign.id)}>
                      Send Now
                    </button>
                    <button className="btn-small btn-info">Schedule</button>
                  </>
                )}
                {campaign.status === 'Scheduled' && (
                  <button className="btn-small">Scheduled</button>
                )}
                {campaign.status === 'Sent' && (
                  <div className="stats">
                    <span>Open Rate: {campaign.openRate}%</span>
                    <span>Click Rate: {campaign.clickRate}%</span>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default CampaignPage;
