const express = require('express');
const router = express.Router();
const Job = require('../models-sequelize/Job');
const JobApplication = require('../models-sequelize/JobApplication');
const User = require('../models-sequelize/User');

// Get dashboard data for a user
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(401).json({ message: 'User authentication required' });
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get user's basic info
    const userInfo = user.toJSON();

    // Get recent job applications
    const applications = await JobApplication.findAll({
      where: { userId },
      include: [{ model: Job, as: 'job' }],
      order: [['createdAt', 'DESC']],
      limit: 5,
    });

    // Get stats
    const totalApplications = await JobApplication.count({ where: { userId } });
    const jobsPosted = user.userType === 'employer' 
      ? await Job.count({ where: { postedBy: userId } })
      : 0;

    const dashboard = {
      user: userInfo,
      stats: {
        totalApplications,
        jobsPosted,
        recentApplications: applications.length,
      },
      recentApplications: applications,
    };

    res.json(dashboard);
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ message: 'Error fetching dashboard', error: error.message });
  }
});

module.exports = router;
