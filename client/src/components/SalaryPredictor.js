import React, { useState } from 'react';

const SalaryPredictor = () => {
  const [jobTitle, setJobTitle] = useState('');
  const [experience, setExperience] = useState(0);
  const [prediction, setPrediction] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handlePredict = async (e) => {
    e.preventDefault();

    if (!jobTitle.trim()) {
      alert('Please enter a job title');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/ai/salary-prediction', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          jobTitle,
          yearsOfExperience: experience,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setPrediction(data.prediction);
      }
    } catch (error) {
      console.error('Error predicting salary:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (value) => {
    return `ZWL ${value.toLocaleString()}`;
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6">
          <h2 className="text-2xl font-bold">Salary Predictor</h2>
          <p className="text-green-100 mt-1">
            Get estimated salary range based on role and experience
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handlePredict} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Job Title *
            </label>
            <input
              type="text"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              placeholder="e.g., Pharmacist, Pharmacy Assistant"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Years of Experience: {experience}
            </label>
            <input
              type="range"
              min="0"
              max="50"
              value={experience}
              onChange={(e) => setExperience(parseInt(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Entry Level</span>
              <span>Experienced</span>
              <span>Expert</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition font-medium"
          >
            {isLoading ? 'Predicting...' : 'Predict Salary'}
          </button>
        </form>

        {/* Results */}
        {prediction && (
          <div className="px-6 pb-6 space-y-6">
            {/* Salary Range */}
            <div className="p-6 bg-green-50 border-2 border-green-200 rounded-lg">
              <h3 className="text-lg font-semibold text-green-900 mb-4">
                Estimated Salary Range
              </h3>

              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-xs text-gray-600 font-medium mb-2">Minimum</p>
                  <p className="text-2xl font-bold text-green-600">
                    {formatCurrency(prediction.minSalary)}
                  </p>
                </div>

                <div className="text-center border-l border-r border-green-200">
                  <p className="text-xs text-gray-600 font-medium mb-2">Average</p>
                  <p className="text-2xl font-bold text-green-700">
                    {formatCurrency(prediction.avgSalary)}
                  </p>
                </div>

                <div className="text-center">
                  <p className="text-xs text-gray-600 font-medium mb-2">Maximum</p>
                  <p className="text-2xl font-bold text-green-600">
                    {formatCurrency(prediction.maxSalary)}
                  </p>
                </div>
              </div>

              {/* Salary Bar */}
              <div className="mt-4">
                <div className="w-full bg-gray-300 rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-green-400 to-green-600 h-3 rounded-full"
                    style={{
                      width: `${((prediction.avgSalary - prediction.minSalary) / (prediction.maxSalary - prediction.minSalary)) * 100}%`,
                    }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Factors */}
            {prediction.factors && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-2">Key Factors</h4>
                <p className="text-sm text-blue-800">{prediction.factors}</p>
              </div>
            )}

            {/* Growth */}
            {prediction.growthPotential && (
              <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                <h4 className="font-semibold text-purple-900 mb-2">Growth Potential</h4>
                <p className="text-sm text-purple-800">{prediction.growthPotential}</p>
              </div>
            )}

            {/* Disclaimer */}
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-xs text-yellow-800">
              <p>
                <strong>Note:</strong> These are estimates based on market data for Zimbabwe.
                Actual salaries may vary based on company size, location, education, and additional skills.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SalaryPredictor;
