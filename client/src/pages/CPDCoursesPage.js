import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaClock, FaUsers, FaDollarSign, FaAward } from 'react-icons/fa';

const CPDCoursesPage = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    level: '',
  });

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    fetchCourses();
  }, [filters]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.search) params.append('search', filters.search);
      if (filters.category) params.append('category', filters.category);
      if (filters.level) params.append('level', filters.level);

      const response = await axios.get(`/api/cpd-courses?${params}`);
      setCourses(response.data.data);
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const enrollCourse = async (courseId) => {
    try {
      await axios.post(`/api/cpd-courses/${courseId}/enroll`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      alert('Enrolled successfully!');
    } catch (error) {
      alert('Error enrolling: ' + error.response?.data?.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">CPD Courses</h1>
        <p className="text-gray-600 mb-8">Continuing Professional Development Marketplace</p>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              type="text"
              name="search"
              placeholder="Search courses..."
              value={filters.search}
              onChange={handleFilterChange}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <select
              name="category"
              value={filters.category}
              onChange={handleFilterChange}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Categories</option>
              <option value="Clinical">Clinical</option>
              <option value="Dispensing">Dispensing</option>
              <option value="Management">Management</option>
              <option value="Regulatory">Regulatory</option>
            </select>
            <select
              name="level"
              value={filters.level}
              onChange={handleFilterChange}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Levels</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>
        </div>

        {/* Courses Grid */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Loading courses...</p>
          </div>
        ) : courses.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600">No courses found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map(course => (
              <div key={course.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden">
                {course.imageUrl && (
                  <img
                    src={course.imageUrl}
                    alt={course.title}
                    className="w-full h-40 object-cover"
                  />
                )}
                <div className="p-6">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-bold text-gray-900 flex-1">{course.title}</h3>
                    <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                      {course.level}
                    </span>
                  </div>

                  <p className="text-gray-600 text-sm mb-4">{course.description.substring(0, 100)}...</p>

                  <div className="space-y-2 mb-4 text-sm text-gray-700">
                    <div className="flex items-center">
                      <FaAward className="mr-2 text-blue-600" />
                      <span>{course.cpdPoints} CPD Points</span>
                    </div>
                    <div className="flex items-center">
                      <FaClock className="mr-2 text-blue-600" />
                      <span>{course.duration} hours</span>
                    </div>
                    <div className="flex items-center">
                      <FaUsers className="mr-2 text-blue-600" />
                      <span>{course.enrolledCount} enrolled</span>
                    </div>
                    <div className="flex items-center">
                      <FaDollarSign className="mr-2 text-blue-600" />
                      <span>{course.price} {course.currency}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => enrollCourse(course.id)}
                    className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Enroll Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CPDCoursesPage;
