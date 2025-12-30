const express = require('express');
const User = require('../models/User');
const Job = require('../models/Job');
const Article = require('../models/Article');
const ForumPost = require('../models/ForumPost');
const router = express.Router();

// Sequelize models for payments and jobs
const Payment = require('../models-sequelize/Payment');
const SequelizeUser = require('../models-sequelize/User');
const SequelizeJob = require('../models-sequelize/Job');

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

// Get all payments (Sequelize) - admin only
router.get('/payments', isAdmin, async (req, res) => {
  try {
    const payments = await Payment.findAll({ order: [['createdAt', 'DESC']] });
    const enriched = await Promise.all(payments.map(async (p) => {
      const pay = p.toJSON ? p.toJSON() : p;
      let job = null;
      if (pay.jobId) {
        const j = await SequelizeJob.findByPk(pay.jobId);
        job = j ? j.toJSON() : null;
      }
      let user = null;
      if (pay.userId) {
        const u = await SequelizeUser.findByPk(pay.userId, { attributes: ['id', 'firstName', 'lastName', 'email'] });
        user = u ? u.toJSON() : null;
      }
      pay.job = job;
      pay.user = user;
      return pay;
    }));

    res.json(enriched);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching payments', error: error.message });
  }
});

// Reapply a payment (admin) - re-feature a job if webhook missed
router.post('/payments/:id/reapply', isAdmin, async (req, res) => {
  try {
    const payment = await Payment.findByPk(req.params.id);
    if (!payment) return res.status(404).json({ message: 'Payment not found' });

    if (!payment.jobId) return res.status(400).json({ message: 'Payment not associated with a job' });

    const job = await SequelizeJob.findByPk(payment.jobId);
    if (!job) return res.status(404).json({ message: 'Associated job not found' });

    const until = job.featuredUntil ? new Date(job.featuredUntil) : new Date(Date.now() + 7*24*60*60*1000);
    job.featured = true;
    job.featuredUntil = until;
    await job.save();

    res.json({ message: 'Payment reapplied and job featured', job });
  } catch (error) {
    res.status(500).json({ message: 'Error reapplying payment', error: error.message });
  }
});

// Audit endpoint to mark receipt or owner notification statuses
router.put('/payments/:id/audit', isAdmin, async (req, res) => {
  try {
    const { receiptSent, ownerNotified } = req.body;
    const payment = await Payment.findByPk(req.params.id);
    if (!payment) return res.status(404).json({ message: 'Payment not found' });

    if (typeof receiptSent === 'boolean') {
      payment.receiptSent = receiptSent;
      payment.receiptSentAt = receiptSent ? new Date() : null;
    }
    if (typeof ownerNotified === 'boolean') {
      payment.ownerNotified = ownerNotified;
      payment.ownerNotifiedAt = ownerNotified ? new Date() : null;
    }

    await payment.save();
    res.json(payment);
  } catch (error) {
    res.status(500).json({ message: 'Error updating audit fields', error: error.message });
  }
});

module.exports = router;

