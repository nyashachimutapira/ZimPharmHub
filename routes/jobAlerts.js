const express = require('express');
const router = express.Router();
const JobAlert = require('../models/JobAlert');
const Job = require('../models-sequelize/Job');
const User = require('../models-sequelize/User');
const { Op } = require('sequelize');
const { sendEmail } = require('../utils/mailer');

// Create a new job alert
router.post('/', async (req, res) => {
  try {
    const userId = req.headers['user-id'];
    const { name, description, positions, locations, salaryMin, salaryMax, employmentTypes, notificationMethod, frequency, digestDay, digestTime } = req.body;

    if (!userId) {
      return res.status(401).json({ message: 'User authentication required' });
    }

    if (!name) {
      return res.status(400).json({ message: 'Alert name is required' });
    }

    const jobAlert = await JobAlert.create({
      userId,
      name,
      description,
      positions: positions || [],
      locations: locations || [],
      salaryMin: salaryMin || null,
      salaryMax: salaryMax || null,
      employmentTypes: employmentTypes || [],
      notificationMethod: notificationMethod || 'email',
      frequency: frequency || 'daily',
      digestDay: digestDay || null,
      digestTime: digestTime || '09:00',
    });

    res.status(201).json({ message: 'Job alert created', jobAlert });
  } catch (error) {
    if (error.name === 'MongooseError' && error.code === 11000) {
      return res.status(400).json({ message: 'Alert with this name already exists' });
    }
    res.status(500).json({ message: 'Error creating job alert', error: error.message });
  }
});

// Get all job alerts for a user
router.get('/', async (req, res) => {
  try {
    const userId = req.headers['user-id'];
    const { activeOnly } = req.query;

    if (!userId) {
      return res.status(401).json({ message: 'User authentication required' });
    }

    const query = { userId };
    if (activeOnly === 'true') {
      query.isActive = true;
    }

    const jobAlerts = await JobAlert.find(query).sort({ createdAt: -1 });

    res.json(jobAlerts);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching job alerts', error: error.message });
  }
});

// Get specific job alert
router.get('/:alertId', async (req, res) => {
  try {
    const userId = req.headers['user-id'];
    const { alertId } = req.params;

    if (!userId) {
      return res.status(401).json({ message: 'User authentication required' });
    }

    const jobAlert = await JobAlert.findById(alertId);

    if (!jobAlert) {
      return res.status(404).json({ message: 'Job alert not found' });
    }

    if (jobAlert.userId.toString() !== userId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    res.json(jobAlert);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching job alert', error: error.message });
  }
});

// Update job alert
router.put('/:alertId', async (req, res) => {
  try {
    const userId = req.headers['user-id'];
    const { alertId } = req.params;
    const { name, description, positions, locations, salaryMin, salaryMax, employmentTypes, notificationMethod, frequency, digestDay, digestTime, isActive } = req.body;

    if (!userId) {
      return res.status(401).json({ message: 'User authentication required' });
    }

    const jobAlert = await JobAlert.findById(alertId);

    if (!jobAlert) {
      return res.status(404).json({ message: 'Job alert not found' });
    }

    if (jobAlert.userId.toString() !== userId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    // Update fields
    if (name !== undefined) jobAlert.name = name;
    if (description !== undefined) jobAlert.description = description;
    if (positions !== undefined) jobAlert.positions = positions;
    if (locations !== undefined) jobAlert.locations = locations;
    if (salaryMin !== undefined) jobAlert.salaryMin = salaryMin;
    if (salaryMax !== undefined) jobAlert.salaryMax = salaryMax;
    if (employmentTypes !== undefined) jobAlert.employmentTypes = employmentTypes;
    if (notificationMethod !== undefined) jobAlert.notificationMethod = notificationMethod;
    if (frequency !== undefined) jobAlert.frequency = frequency;
    if (digestDay !== undefined) jobAlert.digestDay = digestDay;
    if (digestTime !== undefined) jobAlert.digestTime = digestTime;
    if (isActive !== undefined) jobAlert.isActive = isActive;

    jobAlert.updatedAt = new Date();
    await jobAlert.save();

    res.json({ message: 'Job alert updated', jobAlert });
  } catch (error) {
    res.status(500).json({ message: 'Error updating job alert', error: error.message });
  }
});

// Delete job alert
router.delete('/:alertId', async (req, res) => {
  try {
    const userId = req.headers['user-id'];
    const { alertId } = req.params;

    if (!userId) {
      return res.status(401).json({ message: 'User authentication required' });
    }

    const jobAlert = await JobAlert.findById(alertId);

    if (!jobAlert) {
      return res.status(404).json({ message: 'Job alert not found' });
    }

    if (jobAlert.userId.toString() !== userId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    await JobAlert.findByIdAndDelete(alertId);

    res.json({ message: 'Job alert deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting job alert', error: error.message });
  }
});

// Check for matching jobs and send notifications
router.post('/:alertId/check-matches', async (req, res) => {
  try {
    const userId = req.headers['user-id'];
    const { alertId } = req.params;

    if (!userId) {
      return res.status(401).json({ message: 'User authentication required' });
    }

    const jobAlert = await JobAlert.findById(alertId);

    if (!jobAlert) {
      return res.status(404).json({ message: 'Job alert not found' });
    }

    if (jobAlert.userId.toString() !== userId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    // Find matching jobs
    const matchingJobs = await findMatchingJobs(jobAlert);

    // Get jobs that haven't been notified yet
    const notifiedJobIds = jobAlert.matchingJobs.map(m => m.jobId.toString());
    const newMatches = matchingJobs.filter(job => !notifiedJobIds.includes(job.id.toString()));

    res.json({
      totalMatches: matchingJobs.length,
      newMatches: newMatches.length,
      matchingJobs: matchingJobs.map(job => ({
        id: job.id,
        title: job.title,
        position: job.position,
        location: `${job.locationCity || ''} ${job.locationProvince || ''}`.trim(),
        salary: job.salaryMin && job.salaryMax ? `${job.salaryMin}-${job.salaryMax}` : 'Not specified',
      })),
    });
  } catch (error) {
    res.status(500).json({ message: 'Error checking matches', error: error.message });
  }
});

// Send test notification
router.post('/:alertId/send-test', async (req, res) => {
  try {
    const userId = req.headers['user-id'];
    const { alertId } = req.params;

    if (!userId) {
      return res.status(401).json({ message: 'User authentication required' });
    }

    const jobAlert = await JobAlert.findById(alertId);

    if (!jobAlert) {
      return res.status(404).json({ message: 'Job alert not found' });
    }

    if (jobAlert.userId.toString() !== userId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Find 3 sample matching jobs
    const sampleJobs = await findMatchingJobs(jobAlert, 3);

    if (sampleJobs.length === 0) {
      return res.status(400).json({ message: 'No matching jobs found for preview' });
    }

    // Send test email
    const jobLinks = sampleJobs
      .map(job => `<li><strong>${job.title}</strong> (${job.position}) - ${job.locationCity || 'Unknown'}</li>`)
      .join('');

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #007bff; color: white; padding: 20px; border-radius: 5px 5px 0 0; }
            .content { background-color: #f9f9f9; padding: 20px; border-radius: 0 0 5px 5px; }
            .job-list { background-color: white; padding: 15px; margin: 15px 0; border-left: 4px solid #007bff; }
            .button { display: inline-block; background-color: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin-top: 15px; }
            .footer { margin-top: 20px; font-size: 12px; color: #999; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2>Job Alert: ${jobAlert.name}</h2>
              <p>[TEST EMAIL]</p>
            </div>
            <div class="content">
              <p>Hi ${user.firstName || 'there'},</p>
              <p>Here's a preview of your "${jobAlert.name}" job alert with matching opportunities:</p>
              
              <div class="job-list">
                <h3>Matching Jobs (${sampleJobs.length} shown)</h3>
                <ul>
                  ${jobLinks}
                </ul>
              </div>
              
              <p>
                <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/jobs" class="button">Browse All Jobs</a>
              </p>
              
              <div class="footer">
                <p>This is a test email. Your actual alerts will be sent based on your notification preferences.</p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;

    await sendEmail(
      user.email,
      `[TEST] Job Alert: ${jobAlert.name}`,
      `Job alert test: ${sampleJobs.length} matching jobs found`,
      html
    );

    res.json({ message: 'Test email sent', jobsPreview: sampleJobs.length });
  } catch (error) {
    res.status(500).json({ message: 'Error sending test notification', error: error.message });
  }
});

// Get matching jobs count
router.get('/:alertId/matches', async (req, res) => {
  try {
    const userId = req.headers['user-id'];
    const { alertId } = req.params;

    if (!userId) {
      return res.status(401).json({ message: 'User authentication required' });
    }

    const jobAlert = await JobAlert.findById(alertId);

    if (!jobAlert) {
      return res.status(404).json({ message: 'Job alert not found' });
    }

    if (jobAlert.userId.toString() !== userId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const matchingJobs = await findMatchingJobs(jobAlert);

    res.json({
      alertId,
      alertName: jobAlert.name,
      totalMatches: matchingJobs.length,
      matchedAt: new Date(),
      recentMatches: matchingJobs.slice(0, 5).map(job => ({
        id: job.id,
        title: job.title,
        position: job.position,
        location: `${job.locationCity || ''} ${job.locationProvince || ''}`.trim(),
      })),
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching matches', error: error.message });
  }
});

/**
 * Helper function to find matching jobs for an alert
 */
async function findMatchingJobs(jobAlert, limit = null) {
  const where = { status: 'active' };

  // Match positions
  if (jobAlert.positions && jobAlert.positions.length > 0) {
    where.position = {
      [Op.in]: jobAlert.positions,
    };
  }

  // Match locations
  if (jobAlert.locations && jobAlert.locations.length > 0) {
    where[Op.or] = jobAlert.locations.map(location => ({
      locationCity: { [Op.iLike]: `%${location}%` },
    }));
  }

  // Match salary range
  if (jobAlert.salaryMin || jobAlert.salaryMax) {
    const salaryWhere = {};
    if (jobAlert.salaryMin) {
      salaryWhere[Op.gte] = jobAlert.salaryMin;
    }
    if (jobAlert.salaryMax) {
      salaryWhere[Op.lte] = jobAlert.salaryMax;
    }
    where.salaryMax = salaryWhere;
  }

  // Match employment types
  if (jobAlert.employmentTypes && jobAlert.employmentTypes.length > 0) {
    where.employmentType = {
      [Op.in]: jobAlert.employmentTypes,
    };
  }

  let query = Job.findAll({
    where,
    order: [['createdAt', 'DESC']],
  });

  if (limit) {
    query = query.limit(limit);
  }

  return await query;
}

module.exports = router;
