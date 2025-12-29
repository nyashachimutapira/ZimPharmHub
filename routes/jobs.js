const express = require('express');
const Job = require('../models/Job');
const router = express.Router();

// Get all jobs
router.get('/', async (req, res) => {
  try {
    const { position, location, salary, search } = req.query;
    let filter = { status: 'active' };

    if (position) filter.position = position;
    if (location) filter['location.city'] = { $regex: location, $options: 'i' };
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const jobs = await Job.find(filter)
      .populate('pharmacy', 'firstName lastName email')
      .sort({ featured: -1, createdAt: -1 })
      .limit(20);

    res.json(jobs);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching jobs', error: error.message });
  }
});

// Get job by ID
router.get('/:id', async (req, res) => {
  try {
    const job = await Job.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } }, { new: true })
      .populate('pharmacy', 'firstName lastName email');

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    res.json(job);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching job', error: error.message });
  }
});

// Create job
router.post('/', async (req, res) => {
  try {
    const { title, description, position, salary, location, requirements, responsibilities, employmentType } = req.body;
    const userId = req.headers['user-id'];

    const job = new Job({
      title,
      description,
      position,
      salary,
      location,
      requirements,
      responsibilities,
      employmentType,
      pharmacy: userId,
    });

    await job.save();
    res.status(201).json(job);
  } catch (error) {
    res.status(500).json({ message: 'Error creating job', error: error.message });
  }
});

// Update job
router.put('/:id', async (req, res) => {
  try {
    const job = await Job.findByIdAndUpdate(req.params.id, req.body, { new: true });

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    res.json(job);
  } catch (error) {
    res.status(500).json({ message: 'Error updating job', error: error.message });
  }
});

// Delete job
router.delete('/:id', async (req, res) => {
  try {
    const job = await Job.findByIdAndDelete(req.params.id);

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    res.json({ message: 'Job deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting job', error: error.message });
  }
});

// Apply for job
router.post('/:id/apply', async (req, res) => {
  try {
    const userId = req.headers['user-id'];
    const { resume, coverLetter } = req.body;
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    const alreadyApplied = job.applicants.some((a) => a.userId.toString() === userId);
    if (alreadyApplied) {
      return res.status(400).json({ message: 'Already applied for this job' });
    }

    job.applicants.push({ 
      userId, 
      resume,
      coverLetter,
      status: 'pending'
    });
    await job.save();

    // Create notification for pharmacy owner
    const Notification = require('../models/Notification');
    const notification = new Notification({
      userId: job.pharmacy,
      type: 'job_application',
      title: 'New Job Application',
      message: `You have a new application for ${job.title}`,
      link: `/jobs/${job._id}`,
      relatedId: job._id,
    });
    await notification.save();

    res.json({ message: 'Application submitted', job });
  } catch (error) {
    res.status(500).json({ message: 'Error applying for job', error: error.message });
  }
});

// Update application status (for pharmacy owners)
router.put('/:jobId/applications/:applicationId/status', async (req, res) => {
  try {
    const { status, notes } = req.body;
    const job = await Job.findById(req.params.jobId);

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    const application = job.applicants.id(req.params.applicationId);
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    application.status = status;
    if (notes) application.notes = notes;
    application.updatedAt = new Date();
    await job.save();

    // Create notification for applicant
    const Notification = require('../models/Notification');
    const statusMessages = {
      reviewing: 'Your application is being reviewed',
      shortlisted: 'You have been shortlisted!',
      interview: 'Interview scheduled',
      accepted: 'Congratulations! Your application was accepted',
      rejected: 'Unfortunately, your application was not successful',
    };

    const notification = new Notification({
      userId: application.userId,
      type: 'job_application',
      title: `Application Update - ${job.title}`,
      message: statusMessages[status] || 'Your application status has been updated',
      link: `/jobs/${job._id}`,
      relatedId: job._id,
    });
    await notification.save();

    res.json({ message: 'Application status updated', job });
  } catch (error) {
    res.status(500).json({ message: 'Error updating application status', error: error.message });
  }
});

// Get applications for a job (for pharmacy owners)
router.get('/:id/applications', async (req, res) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate('applicants.userId', 'firstName lastName email phone certifications resume');

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    res.json(job.applicants);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching applications', error: error.message });
  }
});

module.exports = router;
