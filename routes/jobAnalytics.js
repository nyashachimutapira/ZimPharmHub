const express = require('express');
const router = express.Router();
const { param, query, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const JobAnalytic = require('../models/JobAnalytic');
const Job = require('../models-sequelize/Job');
const Application = require('../models-sequelize/Application');
const { sequelize } = require('../config/database');
const { Op } = require('sequelize');

// Get analytics for a specific job (employer only)
router.get('/job/:jobId', auth, [
  param('jobId').isUUID(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { jobId } = req.params;

    // Verify job ownership
    const job = await Job.findByPk(jobId);
    if (!job) return res.status(404).json({ error: 'Job not found' });
    if (job.employerId !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    let analytic = await JobAnalytic.findOne({
      where: { jobId },
    });

    if (!analytic) {
      analytic = await JobAnalytic.create({
        jobId,
        employerId: req.user.id,
      });
    }

    // Recalculate rates
    if (analytic.views > 0) {
      analytic.applicationRate = (analytic.applications / analytic.views) * 100;
    }
    if (analytic.applications > 0) {
      analytic.conversionRate = (analytic.conversions / analytic.applications) * 100;
    }

    return res.json({
      success: true,
      data: analytic,
    });
  } catch (err) {
    console.error('Error fetching job analytics:', err);
    return res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

// Get dashboard analytics for employer
router.get('/dashboard/overview', auth, [
  query('timeframe').optional().isIn(['7d', '30d', '90d', '1y', 'all']),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    if (req.user.userType !== 'pharmacy') {
      return res.status(403).json({ error: 'Only employers can view analytics' });
    }

    const { timeframe = '30d' } = req.query;

    // Get date range
    let startDate = new Date();
    switch (timeframe) {
      case '7d': startDate.setDate(startDate.getDate() - 7); break;
      case '30d': startDate.setDate(startDate.getDate() - 30); break;
      case '90d': startDate.setDate(startDate.getDate() - 90); break;
      case '1y': startDate.setFullYear(startDate.getFullYear() - 1); break;
      case 'all': startDate = new Date(0); break;
    }

    // Get employer's jobs
    const jobs = await Job.findAll({
      where: { employerId: req.user.id },
      attributes: ['id'],
    });
    const jobIds = jobs.map(j => j.id);

    // Get analytics for these jobs
    const analytics = await JobAnalytic.findAll({
      where: { jobId: jobIds, updatedAt: { [Op.gte]: startDate } },
    });

    // Calculate totals
    const totalViews = analytics.reduce((sum, a) => sum + a.views, 0);
    const totalApplications = analytics.reduce((sum, a) => sum + a.applications, 0);
    const totalConversions = analytics.reduce((sum, a) => sum + a.conversions, 0);
    const uniqueViewers = analytics.reduce((sum, a) => sum + a.uniqueViewers, 0);
    const avgTimeSpent = analytics.length > 0
      ? Math.round(analytics.reduce((sum, a) => sum + a.averageTimeSpent, 0) / analytics.length)
      : 0;

    return res.json({
      success: true,
      data: {
        timeframe,
        totalJobs: jobIds.length,
        totalViews,
        totalApplications,
        totalConversions,
        uniqueViewers,
        averageTimeSpent: avgTimeSpent,
        applicationRate: totalViews > 0 ? ((totalApplications / totalViews) * 100).toFixed(2) : 0,
        conversionRate: totalApplications > 0 ? ((totalConversions / totalApplications) * 100).toFixed(2) : 0,
        topPerformingJobs: analytics
          .sort((a, b) => b.views - a.views)
          .slice(0, 5)
          .map(a => ({ jobId: a.jobId, views: a.views, applications: a.applications })),
      },
    });
  } catch (err) {
    console.error('Error fetching dashboard analytics:', err);
    return res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

// Track job view
router.post('/track/view', [
  body('jobId').isUUID(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { jobId } = req.body;

    let analytic = await JobAnalytic.findOne({ where: { jobId } });
    if (!analytic) {
      const job = await Job.findByPk(jobId);
      if (!job) return res.status(404).json({ error: 'Job not found' });

      analytic = await JobAnalytic.create({
        jobId,
        employerId: job.employerId,
      });
    }

    await analytic.increment('views');
    if (!req.user || req.user.id !== analytic.employerId) {
      await analytic.increment('uniqueViewers');
    }
    await analytic.update({ lastViewed: new Date() });

    return res.json({ success: true });
  } catch (err) {
    console.error('Error tracking view:', err);
    return res.status(500).json({ error: 'Failed to track view' });
  }
});

// Track application
router.post('/track/application', auth, [
  body('jobId').isUUID(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { jobId } = req.body;

    let analytic = await JobAnalytic.findOne({ where: { jobId } });
    if (!analytic) {
      const job = await Job.findByPk(jobId);
      if (!job) return res.status(404).json({ error: 'Job not found' });

      analytic = await JobAnalytic.create({
        jobId,
        employerId: job.employerId,
      });
    }

    await analytic.increment('applications');

    return res.json({ success: true });
  } catch (err) {
    console.error('Error tracking application:', err);
    return res.status(500).json({ error: 'Failed to track application' });
  }
});

// Track conversion (job filled/closed)
router.post('/track/conversion', auth, [
  body('jobId').isUUID(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { jobId } = req.body;

    const analytic = await JobAnalytic.findOne({ where: { jobId } });
    if (!analytic) return res.status(404).json({ error: 'Analytics not found' });

    // Verify authorization
    if (analytic.employerId !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    await analytic.increment('conversions');

    return res.json({ success: true });
  } catch (err) {
    console.error('Error tracking conversion:', err);
    return res.status(500).json({ error: 'Failed to track conversion' });
  }
});

// Get job performance comparison
router.get('/comparison/jobs', auth, async (req, res) => {
  try {
    if (req.user.userType !== 'pharmacy') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const analytics = await JobAnalytic.findAll({
      where: { employerId: req.user.id },
      order: [['views', 'DESC']],
      limit: 20,
    });

    return res.json({
      success: true,
      data: analytics,
    });
  } catch (err) {
    console.error('Error fetching comparison data:', err);
    return res.status(500).json({ error: 'Failed to fetch comparison data' });
  }
});

// Get application statistics
router.get('/applications/stats', auth, async (req, res) => {
  try {
    if (req.user.userType !== 'pharmacy') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const { timeframe = '30d' } = req.query;

    // Get date range
    let startDate = new Date();
    switch (timeframe) {
      case '7d': startDate.setDate(startDate.getDate() - 7); break;
      case '30d': startDate.setDate(startDate.getDate() - 30); break;
      case '90d': startDate.setDate(startDate.getDate() - 90); break;
      case '1y': startDate.setFullYear(startDate.getFullYear() - 1); break;
      default: startDate = new Date(0);
    }

    // Get employer's applications
    const jobs = await Job.findAll({
      where: { employerId: req.user.id },
      attributes: ['id'],
    });

    const applications = await Application.findAll({
      where: {
        jobId: { [Op.in]: jobs.map(j => j.id) },
        createdAt: { [Op.gte]: startDate },
      },
    });

    // Group by status
    const byStatus = {};
    applications.forEach(app => {
      byStatus[app.status] = (byStatus[app.status] || 0) + 1;
    });

    return res.json({
      success: true,
      data: {
        timeframe,
        totalApplications: applications.length,
        byStatus,
        dailyApplications: groupByDate(applications),
      },
    });
  } catch (err) {
    console.error('Error fetching application stats:', err);
    return res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

// Helper function to group by date
function groupByDate(applications) {
  const grouped = {};
  applications.forEach(app => {
    const date = new Date(app.createdAt).toISOString().split('T')[0];
    grouped[date] = (grouped[date] || 0) + 1;
  });
  return grouped;
}

module.exports = router;
