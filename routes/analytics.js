const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const { authenticateToken, requireRole } = require('../middleware/auth');
const JobAnalytics = require('../models-sequelize/JobAnalytics');
const UserAnalytics = require('../models-sequelize/UserAnalytics');
const ApplicationAnalytics = require('../models-sequelize/ApplicationAnalytics');
const Job = require('../models-sequelize/Job');
const User = require('../models-sequelize/User');
const JobApplication = require('../models-sequelize/JobApplication');

// Get job posting performance metrics for a pharmacy
router.get('/jobs/:pharmacyId', authenticateToken, requireRole(['pharmacy', 'admin']), async (req, res) => {
  try {
    const { pharmacyId } = req.params;
    const { startDate, endDate, period = '30' } = req.query;

    // Calculate date range
    const end = endDate ? new Date(endDate) : new Date();
    const start = startDate ? new Date(startDate) : new Date(Date.now() - parseInt(period) * 24 * 60 * 60 * 1000);

    // Get job analytics
    const jobAnalytics = await JobAnalytics.findAll({
      where: {
        pharmacyId,
        date: {
          [Op.between]: [start.toISOString().split('T')[0], end.toISOString().split('T')[0]]
        }
      },
      include: [{
        model: Job,
        as: 'job',
        attributes: ['title', 'position', 'status']
      }],
      order: [['date', 'ASC']]
    });

    // Aggregate data
    const aggregatedData = jobAnalytics.reduce((acc, record) => {
      const jobId = record.jobId;
      if (!acc[jobId]) {
        acc[jobId] = {
          jobId,
          title: record.job?.title || 'Unknown Job',
          position: record.job?.position || 'Unknown',
          totalViews: 0,
          totalApplications: 0,
          conversionRate: 0,
          avgTimeToApply: 0,
          dataPoints: []
        };
      }

      acc[jobId].totalViews += record.views;
      acc[jobId].totalApplications += record.applications;
      acc[jobId].dataPoints.push({
        date: record.date,
        views: record.views,
        applications: record.applications,
        conversionRate: parseFloat(record.conversionRate)
      });

      return acc;
    }, {});

    // Calculate conversion rates
    Object.values(aggregatedData).forEach(job => {
      job.conversionRate = job.totalViews > 0 ? (job.totalApplications / job.totalViews * 100) : 0;
      job.avgTimeToApply = job.dataPoints.reduce((sum, dp) => sum + (dp.conversionRate || 0), 0) / job.dataPoints.length;
    });

    res.json({
      success: true,
      data: Object.values(aggregatedData),
      period: { start: start.toISOString().split('T')[0], end: end.toISOString().split('T')[0] }
    });

  } catch (error) {
    console.error('Error fetching job analytics:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch job analytics' });
  }
});

// Get application conversion rates
router.get('/applications/:pharmacyId', authenticateToken, requireRole(['pharmacy', 'admin']), async (req, res) => {
  try {
    const { pharmacyId } = req.params;
    const { startDate, endDate, period = '30' } = req.query;

    const end = endDate ? new Date(endDate) : new Date();
    const start = startDate ? new Date(startDate) : new Date(Date.now() - parseInt(period) * 24 * 60 * 60 * 1000);

    const applicationAnalytics = await ApplicationAnalytics.findAll({
      where: {
        pharmacyId,
        date: {
          [Op.between]: [start.toISOString().split('T')[0], end.toISOString().split('T')[0]]
        }
      },
      include: [{
        model: Job,
        as: 'job',
        attributes: ['title', 'position']
      }],
      order: [['date', 'ASC']]
    });

    // Aggregate conversion funnel data
    const funnelData = {
      totalApplications: 0,
      pending: 0,
      reviewing: 0,
      shortlisted: 0,
      interview: 0,
      accepted: 0,
      rejected: 0,
      conversionToInterview: 0,
      conversionToOffer: 0,
      timeline: []
    };

    applicationAnalytics.forEach(record => {
      funnelData.totalApplications += record.totalApplications;
      funnelData.pending += record.pendingApplications;
      funnelData.reviewing += record.reviewingApplications;
      funnelData.shortlisted += record.shortlistedApplications;
      funnelData.interview += record.interviewApplications;
      funnelData.accepted += record.acceptedApplications;
      funnelData.rejected += record.rejectedApplications;

      funnelData.timeline.push({
        date: record.date,
        total: record.totalApplications,
        interview: record.interviewApplications,
        accepted: record.acceptedApplications,
        conversionToInterview: parseFloat(record.conversionToInterview),
        conversionToOffer: parseFloat(record.conversionToOffer)
      });
    });

    // Calculate overall conversion rates
    if (funnelData.totalApplications > 0) {
      funnelData.conversionToInterview = (funnelData.interview / funnelData.totalApplications * 100);
      funnelData.conversionToOffer = (funnelData.accepted / funnelData.totalApplications * 100);
    }

    res.json({
      success: true,
      data: funnelData,
      period: { start: start.toISOString().split('T')[0], end: end.toISOString().split('T')[0] }
    });

  } catch (error) {
    console.error('Error fetching application analytics:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch application analytics' });
  }
});

// Get user engagement analytics (admin only)
router.get('/users', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const { startDate, endDate, period = '30', userType } = req.query;

    const end = endDate ? new Date(endDate) : new Date();
    const start = startDate ? new Date(startDate) : new Date(Date.now() - parseInt(period) * 24 * 60 * 60 * 1000);

    const whereClause = {
      date: {
        [Op.between]: [start.toISOString().split('T')[0], end.toISOString().split('T')[0]]
      }
    };

    if (userType) {
      whereClause.userType = userType;
    }

    const userAnalytics = await UserAnalytics.findAll({
      where: whereClause,
      attributes: [
        'date',
        'userType',
        [UserAnalytics.sequelize.fn('SUM', UserAnalytics.sequelize.col('session_duration')), 'totalSessionDuration'],
        [UserAnalytics.sequelize.fn('SUM', UserAnalytics.sequelize.col('pages_viewed')), 'totalPagesViewed'],
        [UserAnalytics.sequelize.fn('SUM', UserAnalytics.sequelize.col('jobs_viewed')), 'totalJobsViewed'],
        [UserAnalytics.sequelize.fn('SUM', UserAnalytics.sequelize.col('jobs_applied')), 'totalJobsApplied'],
        [UserAnalytics.sequelize.fn('SUM', UserAnalytics.sequelize.col('searches_performed')), 'totalSearches'],
        [UserAnalytics.sequelize.fn('COUNT', UserAnalytics.sequelize.fn('DISTINCT', UserAnalytics.sequelize.col('user_id'))), 'activeUsers']
      ],
      group: ['date', 'userType'],
      order: [['date', 'ASC']]
    });

    // Aggregate by user type
    const aggregatedData = userAnalytics.reduce((acc, record) => {
      const userType = record.userType;
      if (!acc[userType]) {
        acc[userType] = {
          userType,
          totalSessions: 0,
          totalPagesViewed: 0,
          totalJobsViewed: 0,
          totalJobsApplied: 0,
          totalSearches: 0,
          activeUsers: 0,
          timeline: []
        };
      }

      acc[userType].totalSessions += parseInt(record.dataValues.totalSessionDuration || 0);
      acc[userType].totalPagesViewed += parseInt(record.dataValues.totalPagesViewed || 0);
      acc[userType].totalJobsViewed += parseInt(record.dataValues.totalJobsViewed || 0);
      acc[userType].totalJobsApplied += parseInt(record.dataValues.totalJobsApplied || 0);
      acc[userType].totalSearches += parseInt(record.dataValues.totalSearches || 0);
      acc[userType].activeUsers += parseInt(record.dataValues.activeUsers || 0);

      acc[userType].timeline.push({
        date: record.date,
        sessions: parseInt(record.dataValues.totalSessionDuration || 0),
        pagesViewed: parseInt(record.dataValues.totalPagesViewed || 0),
        jobsViewed: parseInt(record.dataValues.totalJobsViewed || 0),
        jobsApplied: parseInt(record.dataValues.totalJobsApplied || 0),
        searches: parseInt(record.dataValues.totalSearches || 0),
        activeUsers: parseInt(record.dataValues.activeUsers || 0)
      });

      return acc;
    }, {});

    res.json({
      success: true,
      data: Object.values(aggregatedData),
      period: { start: start.toISOString().split('T')[0], end: end.toISOString().split('T')[0] }
    });

  } catch (error) {
    console.error('Error fetching user analytics:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch user analytics' });
  }
});

// Get geographic insights on job searches
router.get('/geographic', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const { startDate, endDate, period = '30' } = req.query;

    const end = endDate ? new Date(endDate) : new Date();
    const start = startDate ? new Date(startDate) : new Date(Date.now() - parseInt(period) * 24 * 60 * 60 * 1000);

    // Get job analytics with location data
    const locationData = await JobAnalytics.findAll({
      where: {
        date: {
          [Op.between]: [start.toISOString().split('T')[0], end.toISOString().split('T')[0]]
        },
        location: {
          [Op.not]: null
        }
      },
      attributes: [
        'location',
        [JobAnalytics.sequelize.fn('SUM', JobAnalytics.sequelize.col('views')), 'totalViews'],
        [JobAnalytics.sequelize.fn('SUM', JobAnalytics.sequelize.col('applications')), 'totalApplications']
      ],
      group: ['location'],
      order: [[JobAnalytics.sequelize.fn('SUM', JobAnalytics.sequelize.col('views')), 'DESC']]
    });

    // Get application analytics with geographic distribution
    const applicationGeoData = await ApplicationAnalytics.findAll({
      where: {
        date: {
          [Op.between]: [start.toISOString().split('T')[0], end.toISOString().split('T')[0]]
        }
      },
      attributes: ['geographicDistribution']
    });

    // Aggregate geographic data
    const geographicInsights = {
      jobViewsByLocation: locationData.map(record => ({
        location: record.location,
        views: parseInt(record.dataValues.totalViews || 0),
        applications: parseInt(record.dataValues.totalApplications || 0)
      })),
      applicationDistribution: {}
    };

    // Aggregate application geographic distribution
    applicationGeoData.forEach(record => {
      const dist = record.geographicDistribution || {};
      Object.keys(dist).forEach(location => {
        if (!geographicInsights.applicationDistribution[location]) {
          geographicInsights.applicationDistribution[location] = 0;
        }
        geographicInsights.applicationDistribution[location] += dist[location];
      });
    });

    res.json({
      success: true,
      data: geographicInsights,
      period: { start: start.toISOString().split('T')[0], end: end.toISOString().split('T')[0] }
    });

  } catch (error) {
    console.error('Error fetching geographic analytics:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch geographic analytics' });
  }
});

// Get dashboard overview stats
router.get('/dashboard/:pharmacyId', authenticateToken, requireRole(['pharmacy', 'admin']), async (req, res) => {
  try {
    const { pharmacyId } = req.params;
    const { period = '30' } = req.query;

    const start = new Date(Date.now() - parseInt(period) * 24 * 60 * 60 * 1000);

    // Get job stats
    const jobs = await Job.findAll({
      where: { pharmacyId, createdAt: { [Op.gte]: start } },
      attributes: ['id', 'status']
    });

    const activeJobs = jobs.filter(job => job.status === 'active').length;
    const totalJobsPosted = jobs.length;

    // Get application stats
    const applications = await JobApplication.findAll({
      include: [{
        model: Job,
        where: { pharmacyId },
        required: true
      }],
      where: {
        createdAt: { [Op.gte]: start }
      }
    });

    const totalApplications = applications.length;
    const applicationsByStatus = applications.reduce((acc, app) => {
      acc[app.status] = (acc[app.status] || 0) + 1;
      return acc;
    }, {});

    // Calculate conversion rate
    const conversionRate = totalJobsPosted > 0 ? (totalApplications / (totalJobsPosted * 10)) * 100 : 0; // Assuming avg 10 applications per job

    const overview = {
      activeJobs,
      totalJobsPosted,
      totalApplications,
      applicationsByStatus,
      conversionRate: Math.round(conversionRate * 100) / 100,
      period: `${period} days`
    };

    res.json({
      success: true,
      data: overview
    });

  } catch (error) {
    console.error('Error fetching dashboard overview:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch dashboard overview' });
  }
});

module.exports = router;
