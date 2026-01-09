const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');

// Sequelize models
const Interview = require('../models-sequelize/Interview');
const JobApplication = require('../models-sequelize/JobApplication');
const User = require('../models-sequelize/User');
const Job = require('../models-sequelize/Job');

// Mock Zoom API integration (replace with actual Zoom API calls)
const createZoomMeeting = async (topic, startTime, duration) => {
  // In a real implementation, this would call the Zoom API
  // For now, return mock data
  return {
    id: Math.random().toString(36).substr(2, 9),
    join_url: `https://zoom.us/j/${Math.random().toString(36).substr(2, 9)}`,
    password: Math.random().toString(36).substr(2, 6)
  };
};

// Schedule interview
router.post('/', auth, async (req, res) => {
  try {
    const { jobApplicationId, scheduledAt, duration = 30, platform = 'zoom', notes } = req.body;
    const interviewerId = req.user.id;

    // Verify the job application exists and user has permission
    const application = await JobApplication.findByPk(jobApplicationId);
    if (!application) {
      return res.status(404).json({ message: 'Job application not found' });
    }

    const job = await Job.findByPk(application.jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Check if user owns the job or is admin
    if (req.user.userType !== 'admin' && job.pharmacyId !== interviewerId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Check if interview already exists for this application
    const existingInterview = await Interview.findOne({
      where: { jobApplicationId, status: ['scheduled', 'confirmed'] }
    });
    if (existingInterview) {
      return res.status(400).json({ message: 'Interview already scheduled for this application' });
    }

    // Create meeting based on platform
    let meetingData = {};
    if (platform === 'zoom') {
      const meeting = await createZoomMeeting(
        `Interview for ${job.title}`,
        scheduledAt,
        duration
      );
      meetingData = {
        meetingUrl: meeting.join_url,
        meetingId: meeting.id,
        passcode: meeting.password
      };
    }

    const interview = await Interview.create({
      jobApplicationId,
      interviewerId,
      intervieweeId: application.userId,
      scheduledAt: new Date(scheduledAt),
      duration,
      platform,
      ...meetingData,
      notes
    });

    // Send notification emails (placeholder)
    console.log(`Interview scheduled: ${interview.id}`);

    res.status(201).json(interview);
  } catch (error) {
    console.error('Error scheduling interview:', error);
    res.status(500).json({ message: 'Error scheduling interview', error: error.message });
  }
});

// Get interviews for current user
router.get('/', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const userType = req.user.userType;

    let where = {};
    if (userType === 'job_seeker') {
      where.intervieweeId = userId;
    } else if (userType === 'pharmacy' || userType === 'admin') {
      where.interviewerId = userId;
    }

    const interviews = await Interview.findAll({
      where,
      include: [
        {
          model: JobApplication,
          as: 'jobApplication',
          include: [
            {
              model: Job,
              as: 'job',
              attributes: ['id', 'title', 'position', 'locationCity', 'locationProvince']
            },
            {
              model: User,
              as: 'user',
              attributes: ['id', 'firstName', 'lastName', 'email']
            }
          ]
        }
      ],
      order: [['scheduledAt', 'ASC']]
    });

    res.json(interviews);
  } catch (error) {
    console.error('Error fetching interviews:', error);
    res.status(500).json({ message: 'Error fetching interviews', error: error.message });
  }
});

// Get interview by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const interview = await Interview.findByPk(req.params.id, {
      include: [
        {
          model: JobApplication,
          as: 'jobApplication',
          include: [
            {
              model: Job,
              as: 'job',
              attributes: ['id', 'title', 'position', 'locationCity', 'locationProvince']
            },
            {
              model: User,
              as: 'user',
              attributes: ['id', 'firstName', 'lastName', 'email']
            }
          ]
        }
      ]
    });

    if (!interview) {
      return res.status(404).json({ message: 'Interview not found' });
    }

    // Check permissions
    const userId = req.user.id;
    const userType = req.user.userType;
    const hasAccess = (
      interview.interviewerId === userId ||
      interview.intervieweeId === userId ||
      userType === 'admin'
    );

    if (!hasAccess) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(interview);
  } catch (error) {
    console.error('Error fetching interview:', error);
    res.status(500).json({ message: 'Error fetching interview', error: error.message });
  }
});

// Update interview status
router.put('/:id/status', auth, async (req, res) => {
  try {
    const { status, feedback, rating, notes } = req.body;
    const userId = req.user.id;

    const interview = await Interview.findByPk(req.params.id);
    if (!interview) {
      return res.status(404).json({ message: 'Interview not found' });
    }

    // Check permissions
    const hasAccess = (
      interview.interviewerId === userId ||
      interview.intervieweeId === userId ||
      req.user.userType === 'admin'
    );

    if (!hasAccess) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Only interviewers can update status to completed/cancelled
    if (['completed', 'cancelled'].includes(status) && interview.interviewerId !== userId && req.user.userType !== 'admin') {
      return res.status(403).json({ message: 'Only interviewers can complete or cancel interviews' });
    }

    interview.status = status;
    if (feedback) interview.feedback = feedback;
    if (rating) interview.rating = rating;
    if (notes) interview.notes = notes;

    await interview.save();

    res.json(interview);
  } catch (error) {
    console.error('Error updating interview:', error);
    res.status(500).json({ message: 'Error updating interview', error: error.message });
  }
});

// Cancel interview
router.put('/:id/cancel', auth, async (req, res) => {
  try {
    const userId = req.user.id;

    const interview = await Interview.findByPk(req.params.id);
    if (!interview) {
      return res.status(404).json({ message: 'Interview not found' });
    }

    // Check permissions
    const hasAccess = (
      interview.interviewerId === userId ||
      req.user.userType === 'admin'
    );

    if (!hasAccess) {
      return res.status(403).json({ message: 'Access denied' });
    }

    interview.status = 'cancelled';
    await interview.save();

    res.json({ message: 'Interview cancelled', interview });
  } catch (error) {
    console.error('Error cancelling interview:', error);
    res.status(500).json({ message: 'Error cancelling interview', error: error.message });
  }
});

// Reschedule interview
router.put('/:id/reschedule', auth, async (req, res) => {
  try {
    const { scheduledAt, duration, notes } = req.body;
    const userId = req.user.id;

    const interview = await Interview.findByPk(req.params.id);
    if (!interview) {
      return res.status(404).json({ message: 'Interview not found' });
    }

    // Check permissions
    const hasAccess = (
      interview.interviewerId === userId ||
      req.user.userType === 'admin'
    );

    if (!hasAccess) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Create new meeting if needed
    if (scheduledAt && new Date(scheduledAt).getTime() !== new Date(interview.scheduledAt).getTime()) {
      let meetingData = {};
      if (interview.platform === 'zoom') {
        const job = await Job.findByPk(interview.jobApplication.jobId);
        const meeting = await createZoomMeeting(
          `Interview for ${job.title}`,
          scheduledAt,
          duration || interview.duration
        );
        meetingData = {
          meetingUrl: meeting.join_url,
          meetingId: meeting.id,
          passcode: meeting.password
        };
      }

      interview.scheduledAt = new Date(scheduledAt);
      interview.duration = duration || interview.duration;
      Object.assign(interview, meetingData);
      if (notes) interview.notes = notes;

      await interview.save();
    }

    res.json(interview);
  } catch (error) {
    console.error('Error rescheduling interview:', error);
    res.status(500).json({ message: 'Error rescheduling interview', error: error.message });
  }
});

module.exports = router;
