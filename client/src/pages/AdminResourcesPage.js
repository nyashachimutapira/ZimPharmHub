import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaPlus, FaEdit, FaTrash } from 'react-icons/fa';

const AdminResourcesPage = () => {
  const [resources, setResources] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Health Guide',
    resourceType: 'guide',
    fileUrl: '',
    fileName: '',
    tags: '',
    isPublic: true
  });

  const categories = ['Health Guide', 'Drug Info', 'Article', 'FAQ', 'Emergency'];
  const resourceTypes = ['guide', 'template', 'checklist', 'policy', 'procedure', 'form', 'manual', 'other'];

  useEffect(() => {
    fetchResources();
    fetchStats();
  }, []);

  const fetchResources = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/admin/resources');
      setResources(Array.isArray(res.data) ? res.data : res.data.data || []);
    } catch (error) {
      console.error('Error fetching resources:', error);
      setResources([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await axios.get('/api/admin/resources/stats/overview');
      setStats(res.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate required fields
    if (!formData.title.trim() || !formData.fileUrl.trim()) {
      alert('Please fill in all required fields (Title and File URL)');
      return;
    }

    try {
      const payload = {
        ...formData,
        tags: formData.tags.split(',').map(t => t.trim()).filter(t => t)
      };

      if (editingId) {
        await axios.put(`/api/admin/resources/${editingId}`, payload);
        alert('Resource updated successfully');
      } else {
        await axios.post('/api/admin/resources', payload);
        alert('Resource created successfully');
      }

      resetForm();
      fetchResources();
      fetchStats();
    } catch (error) {
      console.error('Error saving resource:', error);
      alert(`Error: ${error.response?.data?.message || error.message}`);
    }
  };

  const handleEdit = (resource) => {
    setFormData({
      title: resource.title,
      description: resource.description || '',
      category: resource.category,
      resourceType: resource.resourceType || 'guide',
      fileUrl: resource.fileUrl,
      fileName: resource.fileName,
      tags: (resource.tags || []).join(', '),
      isPublic: resource.isPublic !== false
    });
    setEditingId(resource.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this resource?')) return;

    try {
      await axios.delete(`/api/admin/resources/${id}`);
      alert('Resource deleted successfully');
      fetchResources();
      fetchStats();
    } catch (error) {
      console.error('Error deleting resource:', error);
      alert('Error deleting resource');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      category: 'Health Guide',
      resourceType: 'guide',
      fileUrl: '',
      fileName: '',
      tags: '',
      isPublic: true
    });
    setEditingId(null);
    setShowForm(false);
  };

  const filteredResources = resources.filter(r =>
    r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900">Resource Management</h1>
          <button
            onClick={() => { resetForm(); setShowForm(!showForm); }}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <FaPlus size={20} />
            {showForm ? 'Cancel' : 'Add Resource'}
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-3xl font-bold text-blue-600">{stats.total || 0}</div>
            <div className="text-gray-600 text-sm mt-2">Total Resources</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-3xl font-bold text-green-600">{stats.public || 0}</div>
            <div className="text-gray-600 text-sm mt-2">Public Resources</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-3xl font-bold text-purple-600">{stats.totalViews || 0}</div>
            <div className="text-gray-600 text-sm mt-2">Total Views</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-3xl font-bold text-orange-600">{stats.totalDownloads || 0}</div>
            <div className="text-gray-600 text-sm mt-2">Total Downloads</div>
          </div>
        </div>

        {/* Add/Edit Form */}
        {showForm && (
          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {editingId ? 'Edit Resource' : 'Create New Resource'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Title */}
                <div className="md:col-span-2">
                  <label className="block text-gray-700 font-bold mb-2">
                    Resource Title *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="Enter resource title"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                {/* Description */}
                <div className="md:col-span-2">
                  <label className="block text-gray-700 font-bold mb-2">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Brief description of the resource"
                    rows="4"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-gray-700 font-bold mb-2">
                    Category *
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                {/* Resource Type */}
                <div>
                  <label className="block text-gray-700 font-bold mb-2">
                    Resource Type
                  </label>
                  <select
                    name="resourceType"
                    value={formData.resourceType}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {resourceTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                {/* File URL */}
                <div className="md:col-span-2">
                  <label className="block text-gray-700 font-bold mb-2">
                    File URL *
                  </label>
                  <input
                    type="url"
                    name="fileUrl"
                    value={formData.fileUrl}
                    onChange={handleInputChange}
                    placeholder="https://example.com/file.pdf"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                {/* File Name */}
                <div className="md:col-span-2">
                  <label className="block text-gray-700 font-bold mb-2">
                    File Name
                  </label>
                  <input
                    type="text"
                    name="fileName"
                    value={formData.fileName}
                    onChange={handleInputChange}
                    placeholder="guide.pdf"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Tags */}
                <div className="md:col-span-2">
                  <label className="block text-gray-700 font-bold mb-2">
                    Tags (comma-separated)
                  </label>
                  <input
                    type="text"
                    name="tags"
                    value={formData.tags}
                    onChange={handleInputChange}
                    placeholder="health, medicine, pharmacy"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Public Toggle */}
                <div className="md:col-span-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="isPublic"
                      checked={formData.isPublic}
                      onChange={handleInputChange}
                      className="mr-2"
                    />
                    <span className="text-gray-700 font-bold">Make Public</span>
                  </label>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex gap-4 pt-4 border-t">
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                >
                  {editingId ? 'Update Resource' : 'Create Resource'}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="bg-gray-400 text-white px-6 py-2 rounded-lg hover:bg-gray-500"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Search */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search resources..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Resources Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-600">Loading resources...</div>
          ) : filteredResources.length === 0 ? (
            <div className="p-8 text-center text-gray-600">
              {searchTerm ? 'No resources found matching your search' : 'No resources yet'}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-bold text-gray-700">Title</th>
                    <th className="px-6 py-3 text-left text-sm font-bold text-gray-700">Category</th>
                    <th className="px-6 py-3 text-left text-sm font-bold text-gray-700">Type</th>
                    <th className="px-6 py-3 text-center text-sm font-bold text-gray-700">Views</th>
                    <th className="px-6 py-3 text-center text-sm font-bold text-gray-700">Downloads</th>
                    <th className="px-6 py-3 text-left text-sm font-bold text-gray-700">Status</th>
                    <th className="px-6 py-3 text-center text-sm font-bold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredResources.map(resource => (
                    <tr key={resource.id} className="border-b hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-900 font-medium">{resource.title}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{resource.category}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{resource.resourceType}</td>
                      <td className="px-6 py-4 text-sm text-gray-600 text-center">{resource.views || 0}</td>
                      <td className="px-6 py-4 text-sm text-gray-600 text-center">{resource.downloads || 0}</td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          resource.isPublic
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {resource.isPublic ? 'Public' : 'Private'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex gap-2 justify-center">
                          <button
                            onClick={() => handleEdit(resource)}
                            className="bg-blue-100 text-blue-600 p-2 rounded hover:bg-blue-200"
                            title="Edit"
                          >
                            <FaEdit size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(resource.id)}
                            className="bg-red-100 text-red-600 p-2 rounded hover:bg-red-200"
                            title="Delete"
                          >
                            <FaTrash size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminResourcesPage;
