import React, { useState } from 'react';

const ResumeParser = ({ onParsed }) => {
  const [resumeText, setResumeText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [parsedData, setParsedData] = useState(null);
  const [error, setError] = useState(null);

  const handleParseResume = async (e) => {
    e.preventDefault();
    
    if (!resumeText.trim()) {
      setError('Please enter resume text');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/ai/resume/parse', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ resumeText }),
      });

      if (response.ok) {
        const data = await response.json();
        setParsedData(data.resume);
        if (onParsed) onParsed(data.resume);
      } else {
        const error = await response.json();
        setError(error.error);
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white p-6">
          <h2 className="text-2xl font-bold">Resume Parser</h2>
          <p className="text-indigo-100 mt-1">
            Paste your resume to automatically extract structured information
          </p>
        </div>

        {!parsedData ? (
          /* Form */
          <form onSubmit={handleParseResume} className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Resume Text
              </label>
              <textarea
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                placeholder="Paste your resume content here..."
                rows={12}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-sm"
              />
            </div>

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading || !resumeText.trim()}
              className="w-full px-6 py-3 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition font-medium"
            >
              {isLoading ? 'Parsing Resume...' : 'Parse Resume'}
            </button>
          </form>
        ) : (
          /* Results */
          <div className="p-6">
            <button
              onClick={() => {
                setParsedData(null);
                setResumeText('');
              }}
              className="mb-6 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition font-medium"
            >
              ← Parse Another Resume
            </button>

            <div className="space-y-6">
              {/* Personal Info */}
              {parsedData.fullName && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h3 className="text-lg font-semibold text-blue-900">
                    {parsedData.fullName}
                  </h3>
                  {parsedData.email && (
                    <p className="text-sm text-blue-700">📧 {parsedData.email}</p>
                  )}
                  {parsedData.phone && (
                    <p className="text-sm text-blue-700">📞 {parsedData.phone}</p>
                  )}
                  {parsedData.summary && (
                    <p className="text-sm text-blue-700 mt-2">{parsedData.summary}</p>
                  )}
                </div>
              )}

              {/* Experience */}
              {parsedData.experience && parsedData.experience.length > 0 && (
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">
                    💼 Experience
                  </h4>
                  <div className="space-y-2">
                    {parsedData.experience.map((exp, i) => (
                      <div key={i} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <p className="font-medium text-gray-900">{exp.title}</p>
                        <p className="text-sm text-gray-600">{exp.company}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Education */}
              {parsedData.education && parsedData.education.length > 0 && (
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">
                    🎓 Education
                  </h4>
                  <div className="space-y-2">
                    {parsedData.education.map((edu, i) => (
                      <div key={i} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <p className="font-medium text-gray-900">{edu.school}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Skills */}
              {parsedData.skills && parsedData.skills.length > 0 && (
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">
                    🎯 Skills
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {parsedData.skills.map((skill, i) => (
                      <span
                        key={i}
                        className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Certifications */}
              {parsedData.certifications && parsedData.certifications.length > 0 && (
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">
                    🏆 Certifications
                  </h4>
                  <div className="space-y-2">
                    {parsedData.certifications.map((cert, i) => (
                      <div key={i} className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                        <p className="font-medium text-orange-900">{cert}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <button className="mt-6 w-full px-6 py-3 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition font-medium">
              Save to Profile
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResumeParser;
