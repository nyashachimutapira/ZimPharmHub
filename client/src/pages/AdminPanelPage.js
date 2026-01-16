import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaUsers, FaBriefcase, FaNewspaper, FaComments, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import './AdminPanelPage.css';

function AdminPanelPage() {
  const [dashboardData, setDashboardData] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const navigate = useNavigate();

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    const userType = localStorage.getItem('userType');
    if (userType !== 'admin') {
      navigate('/');
      return;
    }
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/admin/dashboard', {
        headers: { 
          Authorization: `Bearer ${token}`,
          'user-id': localStorage.getItem('userId'),
        },
      });
      setDashboardData(response.data);
    } catch (error) {
      console.error('Error fetching admin dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/admin/users', {
        headers: { 
          Authorization: `Bearer ${token}`,
          'user-id': localStorage.getItem('userId'),
        },
      });
      setUsers(response.data.users);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const [payments, setPayments] = useState([]);
  const fetchPayments = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/admin/payments', {
        headers: { 
          Authorization: `Bearer ${token}`,
          'user-id': localStorage.getItem('userId'),
        },
      });
      setPayments(response.data);
    } catch (error) {
      console.error('Error fetching payments:', error);
    }
  };

  useEffect(() => {
    if (activeTab === 'payments') {
      fetchPayments();
    }
  }, [activeTab]);

  const handleReapplyPayment = async (paymentId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`/api/admin/payments/${paymentId}/reapply`, {}, {
        headers: { Authorization: `Bearer ${token}`, 'user-id': localStorage.getItem('userId') }
      });
      fetchPayments();
    } catch (error) {
      console.error('Error reapplying payment:', error);
    }
  };

  const handleFeatureJob = async (jobId, featuredUntil) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`/api/jobs/${jobId}/feature`, { featured: true, featuredUntil }, {
        headers: { Authorization: `Bearer ${token}`, 'user-id': localStorage.getItem('userId') }
      });
      fetchPayments();
    } catch (error) {
      console.error('Error featuring job:', error);
    }
  };

  const handleMarkReceiptSent = async (paymentId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`/api/admin/payments/${paymentId}/audit`, { receiptSent: true }, {
        headers: { Authorization: `Bearer ${token}`, 'user-id': localStorage.getItem('userId') }
      });
      fetchPayments();
    } catch (error) {
      console.error('Error marking receipt sent:', error);
    }
  };

  const handleMarkOwnerNotified = async (paymentId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`/api/admin/payments/${paymentId}/audit`, { ownerNotified: true }, {
        headers: { Authorization: `Bearer ${token}`, 'user-id': localStorage.getItem('userId') }
      });
      fetchPayments();
    } catch (error) {
      console.error('Error marking owner notified:', error);
    }
  };

  useEffect(() => {
    if (activeTab === 'users') {
      fetchUsers();
    }
  }, [activeTab]);

  const handleVerifyUser = async (userId, isVerified) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `/api/admin/users/${userId}`,
        { isVerified: !isVerified },
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            'user-id': localStorage.getItem('userId'),
          },
        }
      );
      fetchUsers();
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  if (loading) return <div className="container"><p>Loading admin panel...</p></div>;
  if (!dashboardData) return <div className="container"><p>Unable to load admin panel</p></div>;

  const { stats, recentUsers, recentJobs } = dashboardData;

  return (
    <div className="admin-panel-page">
      <div className="container">
        <h1>Admin Panel</h1>

        {/* Tabs */}
        <div className="admin-tabs">
          <button
            className={activeTab === 'dashboard' ? 'active' : ''}
            onClick={() => setActiveTab('dashboard')}
          >
            Dashboard
          </button>
          <button
            className={activeTab === 'users' ? 'active' : ''}
            onClick={() => setActiveTab('users')}
          >
            Users
          </button>
          <button
            className={activeTab === 'jobs' ? 'active' : ''}
            onClick={() => setActiveTab('jobs')}
          >
            Jobs
          </button>
          <button
            className={activeTab === 'content' ? 'active' : ''}
            onClick={() => setActiveTab('content')}
          >
            Content
          </button>
          <button
            className={activeTab === 'payments' ? 'active' : ''}
            onClick={() => setActiveTab('payments')}
          >
            Payments
          </button>
        </div>

        {/* Tab Content */}
        <div className="admin-content">
          {activeTab === 'dashboard' && (
            <div>
              <div className="admin-stats-grid">
                <div className="admin-stat-card">
                  <FaUsers className="stat-icon" />
                  <div>
                    <h3>{stats.totalUsers}</h3>
                    <p>Total Users</p>
                  </div>
                </div>
                <div className="admin-stat-card">
                  <FaBriefcase className="stat-icon" />
                  <div>
                    <h3>{stats.totalJobs}</h3>
                    <p>Total Jobs</p>
                  </div>
                </div>
                <div className="admin-stat-card">
                  <FaNewspaper className="stat-icon" />
                  <div>
                    <h3>{stats.totalArticles}</h3>
                    <p>Articles</p>
                  </div>
                </div>
                <div className="admin-stat-card">
                  <FaComments className="stat-icon" />
                  <div>
                    <h3>{stats.totalForumPosts}</h3>
                    <p>Forum Posts</p>
                  </div>
                </div>
                <div className="admin-stat-card">
                  <FaUsers className="stat-icon" />
                  <div>
                    <h3>{stats.jobSeekers}</h3>
                    <p>Job Seekers</p>
                  </div>
                </div>
                <div className="admin-stat-card">
                  <FaBriefcase className="stat-icon" />
                  <div>
                    <h3>{stats.pharmacies}</h3>
                    <p>Pharmacies</p>
                  </div>
                </div>
              </div>

              <div className="admin-recent-section">
                <h2>Recent Users</h2>
                <div className="admin-table">
                  <table>
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Type</th>
                        <th>Verified</th>
                        <th>Joined</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentUsers.map((user) => (
                        <tr key={user._id}>
                          <td>{user.firstName} {user.lastName}</td>
                          <td>{user.email}</td>
                          <td>{user.userType}</td>
                          <td>{user.isVerified ? 'Yes' : 'No'}</td>
                          <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="admin-recent-section">
                <h2>Recent Jobs</h2>
                <div className="admin-table">
                  <table>
                    <thead>
                      <tr>
                        <th>Title</th>
                        <th>Pharmacy</th>
                        <th>Position</th>
                        <th>Status</th>
                        <th>Created</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentJobs.map((job) => (
                        <tr key={job._id}>
                          <td>{job.title}</td>
                          <td>{job.pharmacy?.firstName} {job.pharmacy?.lastName}</td>
                          <td>{job.position}</td>
                          <td>{job.status}</td>
                          <td>{new Date(job.createdAt).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div>
              <h2>All Users</h2>
              <div className="admin-table">
                <table>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Type</th>
                      <th>Verified</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user._id}>
                        <td>{user.firstName} {user.lastName}</td>
                        <td>{user.email}</td>
                        <td>{user.userType}</td>
                        <td>
                          {user.isVerified ? (
                            <FaCheckCircle className="verified-icon" />
                          ) : (
                            <FaTimesCircle className="unverified-icon" />
                          )}
                        </td>
                        <td>
                          <button
                            className="btn-verify"
                            onClick={() => handleVerifyUser(user._id, user.isVerified)}
                          >
                            {user.isVerified ? 'Unverify' : 'Verify'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'payments' && (
            <div>
              <h2>Payments</h2>
              <div className="admin-table">
                <table>
                  <thead>
                    <tr>
                      <th>Payment ID</th>
                      <th>Job</th>
                      <th>Pharmacy</th>
                      <th>Amount</th>
                      <th>Receipt Email</th>
                      <th>Receipt Sent</th>
                      <th>Owner Notified</th>
                      <th>Provider ID</th>
                      <th>Created</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map((p) => (
                      <tr key={p.id}>
                        <td>{p.id}</td>
                        <td>{p.job ? p.job.title : '—'}</td>
                        <td>{p.job && p.job.pharmacyId ? (p.job.pharmacyId) : (p.user ? `${p.user.firstName} ${p.user.lastName}` : '—')}</td>
                        <td>{p.amount} {p.currency}</td>
                        <td>{p.receiptEmail || '—'}</td>
                        <td>{p.receiptSent ? '✅' : '—'}</td>
                        <td>{p.ownerNotified ? '✅' : '—'}</td>
                        <td>{p.providerId}</td>
                        <td>{new Date(p.createdAt).toLocaleString()}</td>
                        <td>
                          {p.job && (
                            <>
                              <button className="btn" onClick={() => handleFeatureJob(p.job.id, p.job.featuredUntil)}>Feature</button>
                              <button className="btn" onClick={() => window.open(`/jobs/${p.job.id}`, '_blank')}>View Job</button>
                            </>
                          )}
                          {!p.receiptSent && (
                            <button className="btn" onClick={() => handleMarkReceiptSent(p.id)}>Mark Receipt Sent</button>
                          )}
                          {!p.ownerNotified && p.job && (
                            <button className="btn" onClick={() => handleMarkOwnerNotified(p.id)}>Mark Owner Notified</button>
                          )}
                          <button className="btn-verify" onClick={() => handleReapplyPayment(p.id)}>Reapply</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminPanelPage;

