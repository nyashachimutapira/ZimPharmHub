const express = require('express');
const Application = require('../models/Application');
const Job = require('../models/Job');
const User = require('../models/User');
const { sendApplicationStatusEmail, sendApplicationNotificationEmail } = require('../utils/emailService');
const router = express.Router();

// Get all applications for a user
router.get('/user/:userId', async (req, res) => {
  try {
    const applications = await Application.find({ userId: req.params.userId })
      .populate('jobId', 'title position salary location')
      .populate('pharmacyId', 'firstName lastName email')
      .sort({ appliedAt: -1 });

    res.json(applications);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching applications', error: error.message });
  }
});

// Get all applications for a pharmacy
router.get('/pharmacy/:pharmacyId', async (req, res) => {
  try {
    const applications = await Application.find({ pharmacyId: req.params.pharmacyId })
      .populate('jobId', 'title position')
      .populate('userId', 'firstName lastName email phone')
      .sort({ appliedAt: -1 });

    res.json(applications);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching applications', error: error.message });
  }
});

// Get single application
router.get('/:applicationId', async (req, res) => {
  try {
    const application = await Application.findById(req.params.applicationId)
      .populate('jobId')
      .populate('userId', 'firstName lastName email phone bio')
      .populate('pharmacyId', 'firstName lastName email');

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    res.json(application);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching application', error: error.message });
  }
});

// Create application
router.post('/', async (req, res) => {
  try {
    const { jobId, userId, resume, coverLetter } = req.body;

    // Check if user already applied
    const existingApp = await Application.findOne({ jobId, userId });
    if (existingApp) {
      return res.status(400).json({ message: 'You have already applied for this job' });
    }

    const job = await Job.findById(jobId).populate('pharmacy');
    const user = await User.findById(userId);

    const application = new Application({
      jobId,
      userId,
      pharmacyId: job.pharmacy._id,
      resume,
      coverLetter,
      timeline: [
        {
          status: 'pending',
          timestamp: new Date(),
          message: 'Application submitted',
        },
      ],
    });

    await application.save();

    // Send notification to pharmacy
    await sendApplicationNotificationEmail(
      job.pharmacy.email,
      `${job.pharmacy.firstName} ${job.pharmacy.lastName}`,
      user,
      job
    );

    // Send confirmation to applicant
    await sendApplicationStatusEmail(
      user.email,
      `${user.firstName} ${user.lastName}`,
      application,
      job,
      job.pharmacy
    );

    res.status(201).json({
      message: 'Application submitted successfully',
      application,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error creating application', error: error.message });
  }
});

// Update application status
router.put('/:applicationId/status', async (req, res) => {
  try {
    const { status, message, interviewDate, interviewTime, interviewLocation, rejectionReason, salary, startDate } = req.body;
    const userId = req.headers['user-id'];

    const application = await Application.findById(req.params.applicationId)
      .populate('jobId')
      .populate('userId', 'firstName lastName email')
      .populate('pharmacyId', 'firstName lastName email');

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    // Update status
    application.status = status;
    application.isNotified = false;

    // Add to timeline
    application.timeline.push({
      status,
      timestamp: new Date(),
      message: message || `Application status changed to ${status}`,
      updatedBy: userId,
    });

    // Update additional fields based on status
    if (status === 'interview') {
      application.interviewDate = interviewDate;
      application.interviewTime = interviewTime;
      application.interviewLocation = interviewLocation;
    }

    if (status === 'accepted') {
      application.salary = salary;
      application.startDate = startDate;
    }

    if (status === 'rejected') {
      application.rejectionReason = rejectionReason;
    }

    await application.save();

    // Send email notification
    const job = await Job.findById(application.jobId);
    const user = application.userId;
    const pharmacy = application.pharmacyId;

    await sendApplicationStatusEmail(
      user.email,
      `${user.firstName} ${user.lastName}`,
      application,
      job,
      pharmacy
    );

    // Update job applicants status
    const jobApplicant = job.applicants.find((a) => a.userId.toString() === user._id.toString());
    if (jobApplicant) {
      jobApplicant.status = status;
    }
    await job.save();

    res.json({
      message: 'Application status updated successfully',
      application,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating application', error: error.message });
  }
});

// Get application statistics
router.get('/stats/:pharmacyId', async (req, res) => {
  try {
    const stats = await Application.aggregate([
      { $match: { pharmacyId: require('mongoose').Types.ObjectId(req.params.pharmacyId) } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    const formattedStats = {
      pending: 0,
      reviewing: 0,
      shortlisted: 0,
      interview: 0,
      accepted: 0,
      rejected: 0,
    };

    stats.forEach((stat) => {
      formattedStats[stat._id] = stat.count;
    });

    res.json(formattedStats);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching statistics', error: error.message });
  }
});

// Add interview feedback
router.put('/:applicationId/feedback', async (req, res) => {
  try {
    const { rating, feedback } = req.body;

    const application = await Application.findByIdAndUpdate(
      req.params.applicationId,
      { rating, feedback, updatedAt: new Date() },
      { new: true }
    );

    res.json(application);
  } catch (error) {
    res.status(500).json({ message: 'Error updating feedback', error: error.message });
  }
});

// Export application to PDF (stub for implementation)
router.get('/:applicationId/export', async (req, res) => {
  try {
    const application = await Application.findById(req.params.applicationId)
      .populate('jobId')
      .populate('userId')
      .populate('pharmacyId');

    // TODO: Implement PDF generation using pdfkit or similar
    res.json({
      message: 'PDF export feature coming soon',
      application,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error exporting application', error: error.message });
  }
});

module.exports = router;
