import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Download, Star, Eye, FileText } from 'react-icons/fa';

const ResourceLibraryPage = () => {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    resourceType: '',
  });

  useEffect(() => {
    fetchResources();
  }, [filters]);

  const fetchResources = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.search) params.append('search', filters.search);
      if (filters.category) params.append('category', filters.category);
      if (filters.resourceType) params.append('resourceType', filters.resourceType);

      const response = await axios.get(`/api/resources?${params}`);
      setResources(response.data.data);
    } catch (error) {
      console.error('Error fetching resources:', error);
    } finally {
      setLoading(false);
    }
  };

  const downloadResource = async (resourceId, fileName) => {
    try {
      const response = await axios.post(`/api/resources/${resourceId}/download`);
      // Implement actual download logic
      window.open(response.data.downloadLink, '_blank');
    } catch (error) {
      alert('Error downloading resource');
    }
  };

  const getResourceIcon = (type) => {
    const icons = {
      guide: '📖',
      template: '📝',
      checklist: '✓',
      policy: '📋',
      procedure: '🔧',
      form: '📄',
      manual: '📚',
      other: '📎',
    };
    return icons[type] || '📎';
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Resource Library</h1>
        <p className="text-gray-600 mb-8">Download guides, templates, checklists, and compliance documents</p>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              type="text"
              placeholder="Search resources..."
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
              <option value="compliance">Compliance</option>
              <option value="operations">Operations</option>
              <option value="clinical">Clinical</option>
              <option value="management">Management</option>
              <option value="hr">HR & Training</option>
              <option value="safety">Safety</option>
            </select>
            <select
              value={filters.resourceType}
              onChange={(e) => setFilters({ ...filters, resourceType: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Types</option>
              <option value="guide">Guides</option>
              <option value="template">Templates</option>
              <option value="checklist">Checklists</option>
              <option value="policy">Policies</option>
              <option value="procedure">Procedures</option>
              <option value="form">Forms</option>
              <option value="manual">Manuals</option>
            </select>
          </div>
        </div>

        {/* Resources Grid */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Loading resources...</p>
          </div>
        ) : resources.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-gray-600">No resources found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {resources.map(resource => (
              <div key={resource.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-xl font-bold text-gray-900 flex-1">{resource.title}</h3>
                  <span className="text-3xl ml-2">{getResourceIcon(resource.resourceType)}</span>
                </div>

                <p className="text-gray-600 text-sm mb-4">{resource.description}</p>

                <div className="mb-4">
                  <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                    {resource.resourceType}
                  </span>
                  <span className="inline-block bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded ml-2">
                    {resource.category}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 mb-4 text-center text-sm text-gray-600">
                  <div>
                    <Download size={16} className="inline mb-1" />
                    <p>{resource.downloads} Downloads</p>
                  </div>
                  <div>
                    <Eye size={16} className="inline mb-1" />
                    <p>{resource.views} Views</p>
                  </div>
                  <div>
                    <Star size={16} className="inline mb-1" />
                    <p>{resource.rating?.toFixed(1)} Stars</p>
                  </div>
                </div>

                {resource.tags && resource.tags.length > 0 && (
                  <div className="mb-4 flex flex-wrap gap-1">
                    {resource.tags.slice(0, 3).map((tag, idx) => (
                      <span key={idx} className="bg-gray-50 text-gray-700 text-xs px-2 py-1 rounded">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                <button
                  onClick={() => downloadResource(resource.id, resource.fileName)}
                  className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Download size={18} />
                  Download
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ResourceLibraryPage;
