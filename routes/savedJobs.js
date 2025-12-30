const express = require('express');
const router = express.Router();
const SavedJob = require('../models/SavedJob');
const Job = require('../models-sequelize/Job');
const User = require('../models-sequelize/User');
const { sendEmail } = require('../utils/mailer');

// Save a job (bookmark)
router.post('/', async (req, res) => {
  try {
    const { jobId, notes, emailReminderEnabled, reminderFrequency } = req.body;
    const userId = req.headers['user-id'];

    if (!userId) {
      return res.status(401).json({ message: 'User authentication required' });
    }

    if (!jobId) {
      return res.status(400).json({ message: 'Job ID is required' });
    }

    // Check if job exists
    const job = await Job.findByPk(jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Create or find existing saved job
    let savedJob = await SavedJob.findOne({ userId, jobId });
    if (savedJob) {
      // Update existing saved job
      savedJob.notes = notes || savedJob.notes;
      if (emailReminderEnabled !== undefined) {
        savedJob.emailReminderEnabled = emailReminderEnabled;
        savedJob.reminderFrequency = reminderFrequency || 'weekly';
      }
      await savedJob.save();
      return res.json({ message: 'Saved job updated', savedJob, isNew: false });
    }

    // Create new saved job
    savedJob = await SavedJob.create({
      userId,
      jobId,
      notes,
      emailReminderEnabled: emailReminderEnabled || false,
      reminderFrequency: reminderFrequency || 'weekly',
    });

    res.status(201).json({ message: 'Job saved successfully', savedJob, isNew: true });
  } catch (error) {
    if (error.name === 'MongooseError' && error.code === 11000) {
      return res.status(400).json({ message: 'Job already saved' });
    }
    res.status(500).json({ message: 'Error saving job', error: error.message });
  }
});

// Get all saved jobs for a user
router.get('/', async (req, res) => {
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

    res.json(enrichedSavedJobs);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching saved jobs', error: error.message });
  }
});

// Get a specific saved job
router.get('/:savedJobId', async (req, res) => {
  try {
    const userId = req.headers['user-id'];
    const { savedJobId } = req.params;

    if (!userId) {
      return res.status(401).json({ message: 'User authentication required' });
    }

    const savedJob = await SavedJob.findById(savedJobId).populate('jobId');

    if (!savedJob) {
      return res.status(404).json({ message: 'Saved job not found' });
    }

    if (savedJob.userId.toString() !== userId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const jobObj = savedJob.toObject();
    if (jobObj.jobId && jobObj.jobId.pharmacyId) {
      const pharmacy = await User.findByPk(jobObj.jobId.pharmacyId, {
        attributes: ['id', 'firstName', 'lastName', 'email'],
      });
      if (pharmacy) {
        jobObj.jobId.pharmacy = pharmacy.toJSON();
      }
    }

    res.json(jobObj);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching saved job', error: error.message });
  }
});

// Remove a saved job (unbookmark)
router.delete('/:savedJobId', async (req, res) => {
  try {
    const userId = req.headers['user-id'];
    const { savedJobId } = req.params;

    if (!userId) {
      return res.status(401).json({ message: 'User authentication required' });
    }

    const savedJob = await SavedJob.findById(savedJobId);

    if (!savedJob) {
      return res.status(404).json({ message: 'Saved job not found' });
    }

    if (savedJob.userId.toString() !== userId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    await SavedJob.findByIdAndDelete(savedJobId);

    res.json({ message: 'Saved job removed' });
  } catch (error) {
    res.status(500).json({ message: 'Error removing saved job', error: error.message });
  }
});

// Update saved job (notes, reminder settings)
router.put('/:savedJobId', async (req, res) => {
  try {
    const userId = req.headers['user-id'];
    const { savedJobId } = req.params;
    const { notes, emailReminderEnabled, reminderFrequency } = req.body;

    if (!userId) {
      return res.status(401).json({ message: 'User authentication required' });
    }

    const savedJob = await SavedJob.findById(savedJobId);

    if (!savedJob) {
      return res.status(404).json({ message: 'Saved job not found' });
    }

    if (savedJob.userId.toString() !== userId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    // Update fields
    if (notes !== undefined) savedJob.notes = notes;
    if (emailReminderEnabled !== undefined) {
      savedJob.emailReminderEnabled = emailReminderEnabled;
    }
    if (reminderFrequency !== undefined) {
      savedJob.reminderFrequency = reminderFrequency;
    }

    await savedJob.save();

    res.json({ message: 'Saved job updated', savedJob });
  } catch (error) {
    res.status(500).json({ message: 'Error updating saved job', error: error.message });
  }
});

// Check if a job is saved by user
router.get('/check/:jobId', async (req, res) => {
  try {
    const userId = req.headers['user-id'];
    const { jobId } = req.params;

    if (!userId) {
      return res.status(401).json({ message: 'User authentication required' });
    }

    const savedJob = await SavedJob.findOne({ userId, jobId });

    res.json({ isSaved: !!savedJob, savedJob: savedJob || null });
  } catch (error) {
    res.status(500).json({ message: 'Error checking saved job', error: error.message });
  }
});

// Get saved job count for user
router.get('/stats/count', async (req, res) => {
  try {
    const userId = req.headers['user-id'];

    if (!userId) {
      return res.status(401).json({ message: 'User authentication required' });
    }

    const count = await SavedJob.countDocuments({ userId });

    res.json({ count });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching saved job count', error: error.message });
  }
});

// Send reminder emails to users with reminders enabled
// This would typically be called by a scheduled task
router.post('/reminders/send', async (req, res) => {
  try {
    const { frequency } = req.body; // 'daily', 'weekly', or leave empty for all

    // Find saved jobs with reminders enabled
    const query = { emailReminderEnabled: true };
    if (frequency) {
      query.reminderFrequency = frequency;
    }

    const savedJobsWithReminders = await SavedJob.find(query)
      .populate('userId')
      .populate('jobId');

    let sent = 0;
    let failed = 0;

    for (const savedJob of savedJobsWithReminders) {
      try {
        // Check if reminder should be sent based on frequency
        const now = new Date();
        const lastSent = savedJob.lastReminderSent;

        let shouldSend = false;
        if (!lastSent) {
          shouldSend = true;
        } else {
          const hoursSinceLastReminder = (now - lastSent) / (1000 * 60 * 60);

          if (savedJob.reminderFrequency === 'daily' && hoursSinceLastReminder >= 24) {
            shouldSend = true;
          } else if (savedJob.reminderFrequency === 'weekly' && hoursSinceLastReminder >= 7 * 24) {
            shouldSend = true;
          } else if (savedJob.reminderFrequency === 'once') {
            shouldSend = !lastSent; // Only send if never sent
          }
        }

        if (!shouldSend) continue;

        const user = savedJob.userId;
        const job = savedJob.jobId;

        if (!user || !job) continue;

        const jobUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/jobs/${job.id}`;
        const subject = `Reminder: ${job.title} at ${job.locationCity || 'Unknown Location'}`;
        const text = `You saved this job. View details at: ${jobUrl}`;
        const html = `
          <h2>Job Reminder</h2>
          <p>Hi ${user.firstName || 'there'},</p>
          <p>You previously saved this job opening:</p>
          <h3>${job.title}</h3>
          <p><strong>Location:</strong> ${job.locationCity || 'Unknown'}</p>
          <p><strong>Employment Type:</strong> ${job.employmentType || 'Unknown'}</p>
          ${savedJob.notes ? `<p><strong>Your Notes:</strong> ${savedJob.notes}</p>` : ''}
          <p><a href="${jobUrl}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View Job Details</a></p>
          <p>Don't miss this opportunity!</p>
        `;

        await sendEmail(user.email, subject, text, html);

        // Update last reminder sent timestamp
        savedJob.lastReminderSent = now;
        await savedJob.save();

        sent++;
      } catch (error) {
        console.error(`Failed to send reminder for saved job ${savedJob._id}:`, error.message);
        failed++;
      }
    }

    res.json({
      message: `Reminder emails sent`,
      sent,
      failed,
      total: savedJobsWithReminders.length,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error sending reminders', error: error.message });
  }
});

module.exports = router;
