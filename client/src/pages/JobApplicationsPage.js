import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Calendar, FileText, CheckCircle, XCircle, Clock } from 'react-icons/fa';

const JobApplicationsPage = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchApplications();
  }, [filter]);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const params = filter !== 'all' ? `?status=${filter}` : '';
      const response = await axios.get(`/api/job-applications/my${params}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setApplications(response.data.data);
    } catch (error) {
      console.error('Error fetching applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      applied: 'bg-blue-100 text-blue-800',
      reviewed: 'bg-yellow-100 text-yellow-800',
      shortlisted: 'bg-green-100 text-green-800',
      interviewed: 'bg-purple-100 text-purple-800',
      offered: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      withdrawn: 'bg-gray-100 text-gray-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'offered':
        return <CheckCircle className="text-green-600" />;
      case 'rejected':
        return <XCircle className="text-red-600" />;
      case 'interviewed':
        return <CheckCircle className="text-purple-600" />;
      default:
        return <Clock className="text-blue-600" />;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Job Applications</h1>
        <p className="text-gray-600 mb-8">Track and manage your job applications</p>

        {/* Status Filters */}
        <div className="flex flex-wrap gap-2 mb-8">
          {['all', 'applied', 'reviewed', 'shortlisted', 'interviewed', 'offered', 'rejected'].map(status => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors capitalize ${
                filter === status
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        {/* Applications List */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Loading applications...</p>
          </div>
        ) : applications.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-gray-600">No applications found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {applications.map(app => (
              <div
                key={app.id}
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-1">
                      Application #{app.applicationNumber}
                    </h3>
                    <p className="text-gray-600 text-sm">Job ID: {app.jobId}</p>
                  </div>
                  <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(app.status)}`}>
                    {getStatusIcon(app.status)}
                    <span className="capitalize">{app.status}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
                  <div>
                    <p className="text-gray-600">Applied On</p>
                    <p className="text-gray-900 font-medium">{formatDate(app.appliedAt)}</p>
                  </div>
                  {app.reviewedAt && (
                    <div>
                      <p className="text-gray-600">Reviewed On</p>
                      <p className="text-gray-900 font-medium">{formatDate(app.reviewedAt)}</p>
                    </div>
                  )}
                  {app.interviewDate && (
                    <div>
                      <p className="text-gray-600">Interview Date</p>
                      <p className="text-gray-900 font-medium">{formatDate(app.interviewDate)}</p>
                    </div>
                  )}
                </div>

                {app.coverLetter && (
                  <div className="mb-4">
                    <p className="text-sm text-gray-600">Cover Letter Preview</p>
                    <p className="text-gray-700 text-sm mt-1">{app.coverLetter.substring(0, 200)}...</p>
                  </div>
                )}

                {app.feedback && (
                  <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm font-medium text-gray-900">Feedback</p>
                    <p className="text-gray-700 text-sm mt-1">{app.feedback}</p>
                  </div>
                )}

                {app.rejectionReason && (
                  <div className="mb-4 p-3 bg-red-50 rounded-lg">
                    <p className="text-sm font-medium text-gray-900">Rejection Reason</p>
                    <p className="text-gray-700 text-sm mt-1">{app.rejectionReason}</p>
                  </div>
                )}

                <div className="flex gap-2">
                  {app.resumeUrl && (
                    <a
                      href={app.resumeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-blue-600 hover:underline text-sm"
                    >
                      <FileText size={16} />
                      View Resume
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default JobApplicationsPage;
