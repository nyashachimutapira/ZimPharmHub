const express = require('express');
const User = require('../models/User');
const Job = require('../models/Job');
const Article = require('../models/Article');
const ForumPost = require('../models/ForumPost');
const router = express.Router();

// Middleware to check if user is admin
const isAdmin = async (req, res, next) => {
  try {
    const userId = req.headers['user-id'];
    const user = await User.findById(userId);
    
    if (!user || user.userType !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin only.' });
    }
    
    next();
  } catch (error) {
    res.status(500).json({ message: 'Error verifying admin access', error: error.message });
  }
};

// Get dashboard stats
router.get('/dashboard', isAdmin, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const jobSeekers = await User.countDocuments({ userType: 'job_seeker' });
    const pharmacies = await User.countDocuments({ userType: 'pharmacy' });
    const totalJobs = await Job.countDocuments();
    const activeJobs = await Job.countDocuments({ status: 'active' });
    const totalArticles = await Article.countDocuments();
    const totalForumPosts = await ForumPost.countDocuments();
    const recentUsers = await User.find().sort({ createdAt: -1 }).limit(10).select('-password');
    const recentJobs = await Job.find().sort({ createdAt: -1 }).limit(10).populate('pharmacy', 'firstName lastName');

    res.json({
      stats: {
        totalUsers,
        jobSeekers,
        pharmacies,
        totalJobs,
        activeJobs,
        totalArticles,
        totalForumPosts,
      },
      recentUsers,
      recentJobs,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching dashboard stats', error: error.message });
  }
});

// Get all users with filters
router.get('/users', isAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 20, userType, search } = req.query;
    let filter = {};

    if (userType) filter.userType = userType;
    if (search) {
      filter.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const users = await User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await User.countDocuments(filter);

    res.json({
      users,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users', error: error.message });
  }
});

// Update user (verify, suspend, etc.)
router.put('/users/:id', isAdmin, async (req, res) => {
  try {
    const { isVerified, subscriptionStatus } = req.body;
    const updates = {};

    if (isVerified !== undefined) updates.isVerified = isVerified;
    if (subscriptionStatus) updates.subscriptionStatus = subscriptionStatus;

    const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true }).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error updating user', error: error.message });
  }
});

// Delete user
router.delete('/users/:id', isAdmin, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting user', error: error.message });
  }
});

// Get all jobs for moderation
router.get('/jobs', isAdmin, async (req, res) => {
  try {
    const jobs = await Job.find().populate('pharmacy', 'firstName lastName email').sort({ createdAt: -1 });
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching jobs', error: error.message });
  }
});

// Delete job
router.delete('/jobs/:id', isAdmin, async (req, res) => {
  try {
    await Job.findByIdAndDelete(req.params.id);
    res.json({ message: 'Job deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting job', error: error.message });
  }
});

// Get all articles for moderation
router.get('/articles', isAdmin, async (req, res) => {
  try {
    const articles = await Article.find().populate('author', 'firstName lastName').sort({ createdAt: -1 });
    res.json(articles);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching articles', error: error.message });
  }
});

// Get all forum posts for moderation
router.get('/forum-posts', isAdmin, async (req, res) => {
  try {
    const posts = await ForumPost.find().populate('author', 'firstName lastName').sort({ createdAt: -1 });
    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching forum posts', error: error.message });
  }
});

module.exports = router;

