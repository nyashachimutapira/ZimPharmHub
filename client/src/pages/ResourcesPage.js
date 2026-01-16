import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaSearch, FaBookmark, FaShare, FaBook, FaExclamationCircle, FaQuestionCircle, FaNewspaper } from 'react-icons/fa';

const ResourcesPage = () => {
  const [resources, setResources] = useState([]);
  const [filteredResources, setFilteredResources] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [savedResources, setSavedResources] = useState([]);

  const categories = [
    { id: 'all', label: 'All Resources', icon: '📚' },
    { id: 'Health Guide', label: 'Health Guides', icon: '🏥' },
    { id: 'Drug Info', label: 'Drug Information', icon: '💊' },
    { id: 'Article', label: 'Articles & Blog', icon: '📰' },
    { id: 'FAQ', label: 'FAQs', icon: '❓' },
    { id: 'Emergency', label: 'Emergency Info', icon: '🚨' },
  ];

  useEffect(() => {
    fetchResources();
  }, []);

  useEffect(() => {
    filterResources();
  }, [resources, selectedCategory, searchTerm]);

  const fetchResources = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/resources', {
        params: { isPublic: true }
      });
      // Ensure data is an array
      const data = Array.isArray(res.data) ? res.data : res.data.data || [];
      setResources(data);
    } catch (error) {
      console.error('Error fetching resources:', error);
      setResources([]);
    } finally {
      setLoading(false);
    }
  };

  const filterResources = () => {
    let filtered = resources;

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(r => r.category === selectedCategory);
    }

    if (searchTerm.trim()) {
      filtered = filtered.filter(r =>
        r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (r.tags && r.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())))
      );
    }

    setFilteredResources(filtered);
  };

  const toggleSave = (resourceId) => {
    if (savedResources.includes(resourceId)) {
      setSavedResources(savedResources.filter(id => id !== resourceId));
    } else {
      setSavedResources([...savedResources, resourceId]);
    }
  };

  const handleShare = (resource) => {
    const text = `Check out this resource: ${resource.title}`;
    if (navigator.share) {
      navigator.share({
        title: resource.title,
        text: text,
        url: window.location.href
      });
    } else {
      alert(`Share: ${text}`);
    }
  };

  const handleDownload = async (resource) => {
    try {
      if (resource.fileUrl) {
        window.open(resource.fileUrl, '_blank');
        // Track download if available
        if (resource.id) {
          axios.post(`/api/resources/${resource.id}/download`).catch(() => {});
        }
      }
    } catch (error) {
      console.error('Download error:', error);
    }
  };

  const getResourceIcon = (type) => {
    const icons = {
      'Health Guide': '🏥',
      'Drug Info': '💊',
      'Article': '📰',
      'FAQ': '❓',
      'Emergency': '🚨',
      'guide': '📖',
      'template': '📝',
      'checklist': '✓',
      'policy': '📋',
      'procedure': '🔧',
      'form': '📄',
      'manual': '📚',
    };
    return icons[type] || '📎';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-3">
            📚 Resources & Information Hub
          </h1>
          <p className="text-xl text-gray-600">
            Access health guides, medicine information, articles, FAQs, and emergency resources
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative">
            <FaSearch className="absolute left-4 top-3.5 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search resources by title, topic, or keyword..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-lg border-2 border-gray-300 focus:outline-none focus:border-blue-500 shadow-sm"
            />
          </div>
        </div>

        {/* Category Filter */}
        <div className="mb-8 flex flex-wrap gap-2">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-full font-medium transition-all ${
                selectedCategory === cat.id
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-blue-500'
              }`}
            >
              <span className="mr-2">{cat.icon}</span>
              {cat.label}
            </button>
          ))}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin">
              <div className="text-4xl">⏳</div>
            </div>
            <p className="text-gray-600 mt-4">Loading resources...</p>
          </div>
        )}

        {/* No Results */}
        {!loading && filteredResources.length === 0 && (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <div className="text-4xl mb-4">🔍</div>
            <p className="text-gray-600 text-lg">
              {searchTerm || selectedCategory !== 'all'
                ? 'No resources found matching your search'
                : 'No resources available yet'}
            </p>
          </div>
        )}

        {/* Resources Grid */}
        {!loading && filteredResources.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredResources.map(resource => (
              <div
                key={resource.id}
                className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group"
              >
                {/* Card Header with Icon */}
                <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-4 flex items-center justify-between">
                  <div className="text-4xl">
                    {getResourceIcon(resource.category || resource.resourceType)}
                  </div>
                  <button
                    onClick={() => toggleSave(resource.id)}
                    className={`p-2 rounded-full transition-all ${
                      savedResources.includes(resource.id)
                        ? 'bg-yellow-400 text-white'
                        : 'bg-white bg-opacity-20 text-white hover:bg-opacity-30'
                    }`}
                    title="Save resource"
                  >
                    <FaBookmark size={18} />
                  </button>
                </div>

                {/* Card Content */}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">
                    {resource.title}
                  </h3>

                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    {resource.description || 'No description available'}
                  </p>

                  {/* Category and Type Badges */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="inline-block bg-blue-100 text-blue-800 text-xs px-3 py-1 rounded-full font-medium">
                      {resource.category || resource.resourceType || 'Resource'}
                    </span>
                    {resource.resourceType && resource.resourceType !== resource.category && (
                      <span className="inline-block bg-gray-100 text-gray-800 text-xs px-3 py-1 rounded-full">
                        {resource.resourceType}
                      </span>
                    )}
                  </div>

                  {/* Tags */}
                  {resource.tags && resource.tags.length > 0 && (
                    <div className="mb-4 flex flex-wrap gap-1">
                      {resource.tags.slice(0, 3).map((tag, idx) => (
                        <span
                          key={idx}
                          className="bg-gray-50 text-gray-700 text-xs px-2 py-1 rounded border border-gray-200"
                        >
                          #{tag}
                        </span>
                      ))}
                      {resource.tags.length > 3 && (
                        <span className="text-gray-500 text-xs px-2 py-1">
                          +{resource.tags.length - 3} more
                        </span>
                      )}
                    </div>
                  )}

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-2 mb-4 text-center text-sm text-gray-600 bg-gray-50 p-3 rounded">
                    <div>
                      <div className="text-lg font-semibold text-gray-900">{resource.views || 0}</div>
                      <div className="text-xs">Views</div>
                    </div>
                    <div>
                      <div className="text-lg font-semibold text-gray-900">{resource.downloads || 0}</div>
                      <div className="text-xs">Downloads</div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    {resource.fileUrl && (
                      <button
                        onClick={() => handleDownload(resource)}
                        className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                      >
                        Download
                      </button>
                    )}
                    <button
                      onClick={() => handleShare(resource)}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                      title="Share resource"
                    >
                      <FaShare size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Quick Links Section */}
        <div className="mt-16 bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Access</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <a
              href="#contact"
              className="flex items-start p-4 rounded-lg bg-gradient-to-br from-red-50 to-orange-50 hover:shadow-md transition-shadow"
            >
              <FaExclamationCircle className="text-red-600 mr-3 flex-shrink-0 mt-1" size={24} />
              <div>
                <h3 className="font-bold text-gray-900 mb-1">Emergency Hotline</h3>
                <p className="text-sm text-gray-600">+263 712 345 678</p>
              </div>
            </a>
            <a
              href="#faq"
              className="flex items-start p-4 rounded-lg bg-gradient-to-br from-blue-50 to-cyan-50 hover:shadow-md transition-shadow"
            >
              <FaQuestionCircle className="text-blue-600 mr-3 flex-shrink-0 mt-1" size={24} />
              <div>
                <h3 className="font-bold text-gray-900 mb-1">Common Questions</h3>
                <p className="text-sm text-gray-600">Find answers to FAQs</p>
              </div>
            </a>
            <a
              href="#articles"
              className="flex items-start p-4 rounded-lg bg-gradient-to-br from-green-50 to-emerald-50 hover:shadow-md transition-shadow"
            >
              <FaNewspaper className="text-green-600 mr-3 flex-shrink-0 mt-1" size={24} />
              <div>
                <h3 className="font-bold text-gray-900 mb-1">Latest Articles</h3>
                <p className="text-sm text-gray-600">Health tips & wellness advice</p>
              </div>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResourcesPage;
