const express = require('express');
const router = express.Router();
const SavedJob = require('../models/SavedJob');
const Job = require('../models-sequelize/Job');
const JobApplication = require('../models-sequelize/JobApplication');
const User = require('../models-sequelize/User');

// Get dashboard data for a user
router.get('/', async (req, res) => {
  try {
    const userId = req.headers['user-id'];

    if (!userId) {
      return res.status(401).json({ message: 'User authentication required' });
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get user's basic info
    const userInfo = user.toJSON();

    // Get saved jobs count
    const savedJobsCount = await SavedJob.countDocuments({ userId });

    // Get saved jobs (with limit for dashboard)
    const savedJobs = await SavedJob.find({ userId })
      .populate('jobId')
      .sort({ savedAt: -1 })
      .limit(5);

    // Enrich saved jobs with pharmacy info
    const enrichedSavedJobs = await Promise.all(
      savedJobs.map(async (savedJob) => {
        const jobObj = savedJob.toObject();
        if (jobObj.jobId && jobObj.jobId.pharmacyId) {
          const pharmacy = await User.findByPk(jobObj.jobId.pharmacyId, {
            attributes: ['id', 'firstName', 'lastName', 'email'],
          });
          if (pharmacy) {
            jobObj.jobId.pharmacy = pharmacy.toJSON();
          }
        }
        return jobObj;
      })
    );

    // Get recent job applications
    const applications = await JobApplication.findAll({
      where: { userId },
      order: [['appliedAt', 'DESC']],
      limit: 5,
      include: [
        {
          model: Job,
          as: 'job',
          attributes: ['id', 'title', 'description', 'position', 'locationCity', 'pharmacyId'],
        },
      ],
    });

    // Count applications by status
    const applicationStats = await JobApplication.findAll({
      where: { userId },
      attributes: ['status'],
      raw: true,
    });

    const statusCounts = {
      pending: 0,
      reviewing: 0,
      shortlisted: 0,
      interview: 0,
      accepted: 0,
      rejected: 0,
    };

    applicationStats.forEach((app) => {
      if (app.status in statusCounts) {
        statusCounts[app.status]++;
      }
    });

    // Get recommended jobs based on saved jobs (similar criteria)
    let recommendedJobs = [];
    if (enrichedSavedJobs.length > 0) {
      const lastSavedJob = enrichedSavedJobs[0].jobId;
      if (lastSavedJob) {
        // Find similar jobs (same position, nearby location)
        recommendedJobs = await Job.findAll({
          where: {
            status: 'active',
            position: lastSavedJob.position,
          },
          order: [['createdAt', 'DESC']],
          limit: 5,
        });
      }
    }

    res.json({
      user: {
        id: userInfo.id,
        firstName: userInfo.firstName,
        lastName: userInfo.lastName,
        email: userInfo.email,
        userType: userInfo.userType,
      },
      savedJobs: {
        count: savedJobsCount,
        recentItems: enrichedSavedJobs,
      },
      applications: {
        recentItems: applications.map((app) => ({
          id: app.id,
          jobId: app.jobId,
          job: app.job ? app.job.toJSON() : null,
          status: app.status,
          appliedAt: app.appliedAt,
          coverLetter: app.coverLetter,
        })),
        stats: statusCounts,
        total: applicationStats.length,
      },
      recommendedJobs: recommendedJobs.map((job) => job.toJSON()),
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching dashboard data', error: error.message });
  }
});

// Get saved jobs section specifically
router.get('/saved-jobs-section', async (req, res) => {
  try {
    const userId = req.headers['user-id'];

    if (!userId) {
      return res.status(401).json({ message: 'User authentication required' });
    }

    const savedJobs = await SavedJob.find({ userId })
      .populate('jobId')
      .sort({ savedAt: -1 });

    // Enrich with pharmacy info
    const enrichedSavedJobs = await Promise.all(
      savedJobs.map(async (savedJob) => {
        const jobObj = savedJob.toObject();
        if (jobObj.jobId && jobObj.jobId.pharmacyId) {
          const pharmacy = await User.findByPk(jobObj.jobId.pharmacyId, {
            attributes: ['id', 'firstName', 'lastName', 'email'],
          });
          if (pharmacy) {
            jobObj.jobId.pharmacy = pharmacy.toJSON();
          }
        }
        return jobObj;
      })
    );

    res.json({
      savedJobs: enrichedSavedJobs,
      count: enrichedSavedJobs.length,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching saved jobs section', error: error.message });
  }
});

module.exports = router;
