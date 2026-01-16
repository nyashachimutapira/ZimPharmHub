import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { TrendingUp, MapPin, AlertTriangle, DollarSign } from 'react-icons/fa';

const AnalyticsPage = () => {
  const [salaryData, setSalaryData] = useState(null);
  const [marketData, setMarketData] = useState(null);
  const [shortageAreas, setShortageAreas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    position: 'Pharmacist',
    location: '',
  });

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const [salary, market, shortages] = await Promise.all([
        axios.get(`/api/analytics/salary/latest/${filters.position}`),
        axios.get('/api/analytics/market'),
        axios.get('/api/analytics/shortages'),
      ]);
      setSalaryData(salary.data);
      setMarketData(market.data);
      setShortageAreas(shortages.data.data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity) => {
    const colors = {
      critical: 'bg-red-100 text-red-800 border-red-300',
      high: 'bg-orange-100 text-orange-800 border-orange-300',
      moderate: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      low: 'bg-green-100 text-green-800 border-green-300',
    };
    return colors[severity] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Pharmacy Job Market Analytics</h1>
        <p className="text-gray-600 mb-8">Market trends, salary insights, and regional pharmacy shortages</p>

        {/* Salary Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {salaryData ? (
            <>
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Average Salary</p>
                    <p className="text-3xl font-bold text-gray-900">
                      {salaryData.averageSalary?.toLocaleString()} {salaryData.currency}
                    </p>
                  </div>
                  <DollarSign className="text-green-600" size={32} />
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <p className="text-gray-600 text-sm mb-2">Salary Range</p>
                <div className="space-y-1">
                  <p className="text-gray-900">Min: {salaryData.minSalary?.toLocaleString()}</p>
                  <p className="text-gray-900">Max: {salaryData.maxSalary?.toLocaleString()}</p>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <p className="text-gray-600 text-sm mb-2">Trend</p>
                <div className="flex items-center gap-2">
                  <TrendingUp className={salaryData.trend === 'increasing' ? 'text-green-600' : 'text-red-600'} />
                  <span className={`font-bold ${salaryData.trend === 'increasing' ? 'text-green-600' : 'text-red-600'}`}>
                    {salaryData.trend?.toUpperCase()}
                  </span>
                </div>
              </div>
            </>
          ) : (
            <div className="col-span-3 bg-white rounded-lg shadow p-6 text-center text-gray-600">
              Loading salary data...
            </div>
          )}
        </div>

        {/* Market Analytics */}
        {marketData && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Job Market Overview</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-gray-600 text-sm">Total Jobs Posted</p>
                <p className="text-2xl font-bold text-gray-900">{marketData.totalJobsPosted}</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Total Applications</p>
                <p className="text-2xl font-bold text-gray-900">{marketData.totalApplications}</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Avg Applications/Job</p>
                <p className="text-2xl font-bold text-gray-900">
                  {marketData.averageApplicationsPerJob?.toFixed(1)}
                </p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Hiring Trend</p>
                <p className={`text-2xl font-bold ${
                  marketData.hiringTrend === 'increasing' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {marketData.hiringTrend?.toUpperCase()}
                </p>
              </div>
            </div>

            {marketData.topSkillsInDemand && (
              <div className="mt-6">
                <h3 className="text-lg font-bold text-gray-900 mb-3">Top Skills in Demand</h3>
                <div className="flex flex-wrap gap-2">
                  {marketData.topSkillsInDemand.map((skill, idx) => (
                    <span
                      key={idx}
                      className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Pharmacy Shortage Areas */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Pharmacy Shortage Areas</h2>
          
          {loading ? (
            <p className="text-gray-600">Loading shortage data...</p>
          ) : shortageAreas.length === 0 ? (
            <p className="text-gray-600">No shortage data available</p>
          ) : (
            <div className="space-y-4">
              {shortageAreas.map(area => (
                <div
                  key={area.id}
                  className={`rounded-lg p-4 border-l-4 ${getSeverityColor(area.shortageLevel)}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-bold text-lg">{area.city}, {area.province}</h3>
                      <p className="text-sm mt-1">Population: {area.population?.toLocaleString()}</p>
                      <p className="text-sm">Current Pharmacies: {area.pharmaciesCount}</p>
                      <p className="text-sm">Required Pharmacies: {area.requiredPharmacies}</p>
                      {area.accessIssues && (
                        <p className="text-sm mt-2">
                          <strong>Issues:</strong> {Array.isArray(area.accessIssues) ? area.accessIssues.join(', ') : area.accessIssues}
                        </p>
                      )}
                    </div>
                    <div className="text-right ml-4 flex-shrink-0">
                      <div className="text-2xl font-bold text-blue-600">
                        {area.opportunityScore?.toFixed(1)}/10
                      </div>
                      <p className="text-xs text-gray-600">Opportunity Score</p>
                      {area.shortageLevel === 'critical' && (
                        <AlertTriangle className="text-red-600 mt-2 ml-auto" />
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
