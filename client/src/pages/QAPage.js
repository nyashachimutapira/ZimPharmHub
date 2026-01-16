import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaComments, FaThumbsUp, FaCheckCircle } from 'react-icons/fa';

const QAPage = () => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('browse');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    tags: '',
  });
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    sort: 'recent',
  });

  useEffect(() => {
    fetchQuestions();
  }, [filters]);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.search) params.append('search', filters.search);
      if (filters.category) params.append('category', filters.category);
      params.append('sort', filters.sort);

      const response = await axios.get(`/api/qa/questions?${params}`);
      setQuestions(response.data.data);
    } catch (error) {
      console.error('Error fetching questions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitQuestion = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/qa/questions', {
        ...formData,
        tags: formData.tags.split(',').map(t => t.trim()),
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });

      setFormData({ title: '', description: '', category: '', tags: '' });
      setShowForm(false);
      fetchQuestions();
      alert('Question posted successfully!');
    } catch (error) {
      alert('Error posting question: ' + error.response?.data?.message);
    }
  };

  const upvoteQuestion = async (questionId) => {
    try {
      await axios.post(`/api/qa/questions/${questionId}/upvote`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      fetchQuestions();
    } catch (error) {
      alert('Error upvoting');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Pharmacy Q&A Community</h1>
        <p className="text-gray-600 mb-8">Ask questions, share knowledge, and learn from experienced pharmacists</p>

        {/* Tabs */}
        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setActiveTab('browse')}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'browse'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300'
            }`}
          >
            Browse Questions
          </button>
          <button
            onClick={() => { setActiveTab('ask'); setShowForm(true); }}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'ask'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300'
            }`}
          >
            Ask Question
          </button>
        </div>

        {/* Search & Filters */}
        {activeTab === 'browse' && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input
                type="text"
                placeholder="Search questions..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <select
                value={filters.category}
                onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Categories</option>
                <option value="clinical">Clinical Practice</option>
                <option value="dispensing">Dispensing</option>
                <option value="management">Management</option>
                <option value="regulatory">Regulatory</option>
                <option value="career">Career</option>
              </select>
              <select
                value={filters.sort}
                onChange={(e) => setFilters({ ...filters, sort: e.target.value })}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="recent">Most Recent</option>
                <option value="popular">Most Popular</option>
                <option value="unanswered">Unanswered</option>
              </select>
            </div>
          </div>
        )}

        {/* Ask Question Form */}
        {showForm && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Ask Your Question</h2>
            <form onSubmit={handleSubmitQuestion}>
              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-2">Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="What's your question?"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-2">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select Category</option>
                  <option value="clinical">Clinical Practice</option>
                  <option value="dispensing">Dispensing</option>
                  <option value="management">Management</option>
                  <option value="regulatory">Regulatory</option>
                  <option value="career">Career</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Provide details about your question..."
                  rows="6"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-2">Tags (comma-separated)</label>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  placeholder="e.g., clinical, medications, regulations"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Post Question
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Questions List */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Loading questions...</p>
          </div>
        ) : questions.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-gray-600">No questions found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {questions.map(q => (
              <div key={q.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-bold text-gray-900">{q.title}</h3>
                  {q.isResolved && <FaCheckCircle className="text-green-600" />}
                </div>

                <p className="text-gray-600 text-sm mb-2">{q.description.substring(0, 200)}...</p>

                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">{q.category}</span>
                  {q.tags && q.tags.map((tag, idx) => (
                    <span key={idx} className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="flex justify-between items-center">
                  <div className="flex gap-4 text-sm text-gray-600">
                    <button
                      onClick={() => upvoteQuestion(q.id)}
                      className="flex items-center gap-1 hover:text-blue-600"
                    >
                      <FaThumbsUp size={16} />
                      {q.upvotes} Upvotes
                    </button>
                    <div className="flex items-center gap-1">
                      <FaComments size={16} />
                      {q.answersCount} Answers
                    </div>
                    <div>{q.views} Views</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default QAPage;
