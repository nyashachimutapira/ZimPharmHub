const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const JobApplication = require('../models/JobApplication');
const { Op } = require('sequelize');

// Get applications for authenticated user
router.get('/my', authenticate, async (req, res) => {
  try {
    const { status, limit = 20, offset = 0 } = req.query;
    const where = { userId: req.user.id };

    if (status) where.status = status;

    const applications = await JobApplication.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['appliedAt', 'DESC']],
    });

    res.json({
      total: applications.count,
      data: applications.rows,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get applications for a specific job (employer only)
router.get('/job/:jobId', authenticate, async (req, res) => {
  try {
    const { status, limit = 20, offset = 0 } = req.query;
    const where = { jobId: req.params.jobId };

    if (status) where.status = status;

    const applications = await JobApplication.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['appliedAt', 'DESC']],
    });

    res.json({
      total: applications.count,
      data: applications.rows,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Submit job application
router.post('/', authenticate, async (req, res) => {
  try {
    const { jobId, coverLetter, resumeUrl } = req.body;

    const applicationNumber = `APP-${Date.now()}`;

    const application = await JobApplication.create({
      jobId,
      userId: req.user.id,
      applicationNumber,
      coverLetter,
      resumeUrl,
    });

    res.status(201).json(application);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get application details
router.get('/:id', authenticate, async (req, res) => {
  try {
    const application = await JobApplication.findByPk(req.params.id);
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    if (application.userId !== req.user.id && application.reviewedBy !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    res.json(application);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update application status
router.put('/:id/status', authenticate, async (req, res) => {
  try {
    const { status, feedback, interviewDate, interviewNotes } = req.body;
    const application = await JobApplication.findByPk(req.params.id);
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    application.status = status;
    application.feedback = feedback;
    if (interviewDate) application.interviewDate = interviewDate;
    if (interviewNotes) application.interviewNotes = interviewNotes;
    application.reviewedBy = req.user.id;
    application.reviewedAt = new Date();
    await application.save();

    res.json(application);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Shortlist application
router.put('/:id/shortlist', authenticate, async (req, res) => {
  try {
    const application = await JobApplication.findByPk(req.params.id);
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    application.status = 'shortlisted';
    application.reviewedBy = req.user.id;
    application.reviewedAt = new Date();
    await application.save();

    res.json(application);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Reject application
router.put('/:id/reject', authenticate, async (req, res) => {
  try {
    const { rejectionReason } = req.body;
    const application = await JobApplication.findByPk(req.params.id);
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    application.status = 'rejected';
    application.rejectionReason = rejectionReason;
    application.reviewedBy = req.user.id;
    application.reviewedAt = new Date();
    await application.save();

    res.json(application);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
