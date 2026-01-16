const express = require('express');
const User = require('../models-sequelize/User');
const router = express.Router();

// Get user profile (Sequelize)
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, { attributes: { exclude: ['password'] } });

    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user', error: error.message });
  }
});

// Update user profile (Sequelize)
router.put('/:id', async (req, res) => {
  try {
    const updates = req.body;
    const [count, rows] = await User.update(updates, { where: { id: req.params.id }, returning: true });
    if (!count) return res.status(404).json({ message: 'User not found' });
    const user = rows[0];
    delete user.dataValues.password;
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error updating user', error: error.message });
  }
});

// Save job for later (disabled until migration)
router.post('/:id/save-job/:jobId', async (req, res) => {
  res.status(501).json({ message: 'Save job feature disabled until migration to PostgreSQL.' });
});

// Get saved jobs (disabled until migration)
router.get('/:id/saved-jobs', async (req, res) => {
  res.status(501).json({ message: 'Saved jobs are disabled until migration to PostgreSQL.' });
});

// Get user dashboard data
router.get('/:id/dashboard', async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id, { attributes: { exclude: ['password'] } });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const userInfo = user.toJSON();

    // Get job-related stats for dashboard
    const stats = {
      userType: user.userType,
    };

    // Different data based on user type
    if (user.userType === 'employer') {
      // For employers: jobs posted, applications received
      const Job = require('../models-sequelize/Job');
      const JobApplication = require('../models-sequelize/JobApplication');
      
      stats.jobsPosted = await Job.count({ where: { postedBy: id } });
      stats.totalApplications = await JobApplication.count();
    } else if (user.userType === 'job_seeker') {
      // For job seekers: applications submitted
      const JobApplication = require('../models-sequelize/JobApplication');
      stats.applicationsSubmitted = await JobApplication.count({ where: { userId: id } });
    }

    const dashboard = {
      user: userInfo,
      stats,
      message: 'Dashboard loaded successfully',
    };

    res.json(dashboard);
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ message: 'Error fetching dashboard', error: error.message });
  }
});

module.exports = router;
