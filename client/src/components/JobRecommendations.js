import React, { useState, useEffect } from 'react';

const JobRecommendations = () => {
  const [recommendations, setRecommendations] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filterScore, setFilterScore] = useState(0);

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const fetchRecommendations = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/ai/recommendations?limit=20', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
      });

      if (response.ok) {
        const data = await response.json();
        setRecommendations(data.recommendations);
      }
    } catch (error) {
      console.error('Error fetching recommendations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getMatchColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    if (score >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  const getMatchBg = (score) => {
    if (score >= 80) return 'bg-green-100';
    if (score >= 60) return 'bg-yellow-100';
    if (score >= 40) return 'bg-orange-100';
    return 'bg-red-100';
  };

  const filteredRecommendations = recommendations.filter(
    (rec) => rec.matchScore >= filterScore
  );

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-6">
          <h2 className="text-2xl font-bold">Job Recommendations</h2>
          <p className="text-purple-100 mt-1">
            AI-powered job matches based on your skills and experience
          </p>
        </div>

        {/* Filter */}
        <div className="p-6 bg-purple-50 border-b border-purple-200">
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-gray-700">
              Minimum Match Score:
            </label>
            <input
              type="range"
              min="0"
              max="100"
              step="10"
              value={filterScore}
              onChange={(e) => setFilterScore(parseInt(e.target.value))}
              className="flex-1"
            />
            <span className="text-lg font-semibold text-purple-600 w-16 text-right">
              {filterScore}%
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto mb-4"></div>
              <p className="text-gray-600">Analyzing your skills...</p>
            </div>
          ) : filteredRecommendations.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <svg
                className="w-16 h-16 mx-auto mb-4 opacity-30"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                />
              </svg>
              <p className="text-lg font-medium">
                {recommendations.length === 0
                  ? 'No recommendations yet'
                  : 'No jobs match your filter'}
              </p>
              <p className="text-sm mt-2">
                {recommendations.length === 0
                  ? 'Add skills to get personalized recommendations'
                  : 'Try lowering the minimum match score'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredRecommendations.map((rec, index) => (
                <div
                  key={rec.jobId || index}
                  className={`p-6 border rounded-lg hover:shadow-md transition ${getMatchBg(
                    rec.matchScore
                  )} border-gray-200`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-900">
                        {rec.title}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {rec.reason}
                      </p>
                    </div>
                    <div className={`text-right ${getMatchColor(rec.matchScore)}`}>
                      <div className="text-4xl font-bold">{rec.matchScore}%</div>
                      <p className="text-sm font-medium mt-1">Match</p>
                    </div>
                  </div>

                  {/* Skills Match */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    {rec.matchedSkills && rec.matchedSkills.length > 0 && (
                      <div>
                        <p className="text-sm font-semibold text-green-700 mb-2">
                          ✓ Matched Skills
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {rec.matchedSkills.slice(0, 3).map((skill, i) => (
                            <span
                              key={i}
                              className="px-3 py-1 bg-green-200 text-green-800 rounded-full text-xs font-medium"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {rec.missingSkills && rec.missingSkills.length > 0 && (
                      <div>
                        <p className="text-sm font-semibold text-orange-700 mb-2">
                          ⚠ Missing Skills
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {rec.missingSkills.slice(0, 3).map((skill, i) => (
                            <span
                              key={i}
                              className="px-3 py-1 bg-orange-200 text-orange-800 rounded-full text-xs font-medium"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition font-medium">
                      View Job
                    </button>
                    <button className="flex-1 px-4 py-2 bg-white border-2 border-blue-500 text-blue-500 rounded-lg hover:bg-blue-50 transition font-medium">
                      Save Job
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Stats */}
        {filteredRecommendations.length > 0 && (
          <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              Showing {filteredRecommendations.length} of {recommendations.length} recommendations
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default JobRecommendations;
