const express = require('express');
const User = require('../models/User');
const router = express.Router();

// Get user profile
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user', error: error.message });
  }
});

// Update user profile
router.put('/:id', async (req, res) => {
  try {
    const updates = req.body;
    const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true }).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error updating user', error: error.message });
  }
});

// Save job for later
router.post('/:id/save-job/:jobId', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.savedJobs.includes(req.params.jobId)) {
      user.savedJobs.push(req.params.jobId);
      await user.save();
    }

    res.json({ message: 'Job saved', user });
  } catch (error) {
    res.status(500).json({ message: 'Error saving job', error: error.message });
  }
});

// Get saved jobs
router.get('/:id/saved-jobs', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate('savedJobs');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user.savedJobs);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching saved jobs', error: error.message });
  }
});

// Get user dashboard data
router.get('/:id/dashboard', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const Job = require('../models/Job');
    const Notification = require('../models/Notification');
    const Conversation = require('../models/Conversation');

    if (user.userType === 'job_seeker') {
      // Get applied jobs with status
      const appliedJobs = await Job.find({
        'applicants.userId': user._id,
      })
        .select('title position location applicants.status applicants.appliedAt status')
        .populate('pharmacy', 'firstName lastName');

      // Get saved jobs
      const savedJobs = await Job.find({ _id: { $in: user.savedJobs } })
        .populate('pharmacy', 'firstName lastName');

      // Get unread notifications count
      const unreadNotifications = await Notification.countDocuments({
        userId: user._id,
        isRead: false,
      });

      // Get unread messages count
      const unreadMessages = await Conversation.countDocuments({
        participants: user._id,
      });

      res.json({
        user: {
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          userType: user.userType,
        },
        appliedJobs: appliedJobs.map((job) => {
          const application = job.applicants.find(
            (a) => a.userId.toString() === user._id.toString()
          );
          return {
            job: {
              _id: job._id,
              title: job.title,
              position: job.position,
              location: job.location,
              status: job.status,
              pharmacy: job.pharmacy,
            },
            applicationStatus: application?.status,
            appliedAt: application?.appliedAt,
          };
        }),
        savedJobs,
        stats: {
          applicationsCount: appliedJobs.length,
          savedJobsCount: savedJobs.length,
          unreadNotifications,
          unreadMessages,
        },
      });
    } else if (user.userType === 'pharmacy') {
      // Get posted jobs
      const postedJobs = await Job.find({ pharmacy: user._id })
        .select('title position applicants status views createdAt');

      // Get total applications
      let totalApplications = 0;
      postedJobs.forEach((job) => {
        totalApplications += job.applicants.length;
      });

      // Get unread notifications
      const unreadNotifications = await Notification.countDocuments({
        userId: user._id,
        isRead: false,
      });

      // Get unread messages
      const unreadMessages = await Conversation.countDocuments({
        participants: user._id,
      });

      res.json({
        user: {
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          userType: user.userType,
        },
        postedJobs,
        stats: {
          postedJobsCount: postedJobs.length,
          totalApplications,
          activeJobsCount: postedJobs.filter((j) => j.status === 'active').length,
          unreadNotifications,
          unreadMessages,
        },
      });
    } else {
      res.json({
        user: {
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          userType: user.userType,
        },
      });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error fetching dashboard data', error: error.message });
  }
});

module.exports = router;
