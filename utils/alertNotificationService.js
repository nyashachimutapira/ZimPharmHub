const JobAlert = require('../models/JobAlert');
const Job = require('../models-sequelize/Job');
const User = require('../models-sequelize/User');
const { Op } = require('sequelize');
const { sendEmail } = require('./mailer');

/**
 * Processes all job alerts and sends notifications for matching jobs
 * Can be triggered manually or via scheduler
 */
async function processJobAlerts(frequency = null) {
  try {
    console.log(`📧 Processing job alerts${frequency ? ` with frequency: ${frequency}` : ''}...`);

    // Build query
    const query = { isActive: true };
    if (frequency) {
      query.frequency = frequency;
    }

    const jobAlerts = await JobAlert.find(query).populate('userId');

    if (jobAlerts.length === 0) {
      console.log('ℹ️ No active job alerts to process');
      return { processed: 0, notificationsSent: 0, errors: 0 };
    }

    console.log(`Found ${jobAlerts.length} active job alerts`);

    let processed = 0;
    let notificationsSent = 0;
    let errors = 0;

    for (const jobAlert of jobAlerts) {
      try {
        // Check if we should process this alert based on frequency
        if (!shouldProcessAlert(jobAlert, frequency)) {
          continue;
        }

        const user = jobAlert.userId;
        if (!user || !user.email) {
          console.warn(`⚠️ Skipping alert ${jobAlert._id}: missing user data`);
          errors++;
          continue;
        }

        // Find matching jobs
        const matchingJobs = await findMatchingJobs(jobAlert);

        if (matchingJobs.length === 0) {
          console.log(`ℹ️ No matches for alert "${jobAlert.name}" (${jobAlert._id})`);
          processed++;
          continue;
        }

        // Get new matches (not already notified)
        const notifiedJobIds = jobAlert.matchingJobs.map(m => m.jobId.toString());
        const newMatches = matchingJobs.filter(job => !notifiedJobIds.includes(job.id.toString()));

        if (newMatches.length === 0) {
          console.log(`ℹ️ No new matches for alert "${jobAlert.name}"`);
          processed++;
          continue;
        }

        // Prepare notification data
        let notificationSent = false;

        // Send instant notifications
        if (jobAlert.frequency === 'instant') {
          notificationSent = await sendInstantNotification(user, jobAlert, newMatches);
        }
        // For daily/weekly, accumulate matches
        else {
          // Just track matches, will be sent at digest time
          notificationSent = true;
        }

        if (notificationSent) {
          // Update matching jobs in alert
          for (const job of newMatches) {
            jobAlert.matchingJobs.push({
              jobId: job.id,
              matchedAt: new Date(),
              notificationSent: jobAlert.frequency === 'instant',
              sentAt: jobAlert.frequency === 'instant' ? new Date() : null,
            });
          }

          jobAlert.totalMatches = jobAlert.matchingJobs.length;
          jobAlert.lastJobMatched = new Date();

          if (jobAlert.frequency === 'instant') {
            jobAlert.totalNotificationsSent += newMatches.length;
          }

          await jobAlert.save();
          notificationsSent += newMatches.length;
        }

        processed++;
        console.log(`✅ Processed alert "${jobAlert.name}": ${newMatches.length} new matches`);
      } catch (error) {
        console.error(`❌ Error processing alert ${jobAlert._id}:`, error.message);
        errors++;
      }
    }

    const result = { processed, notificationsSent, errors, total: jobAlerts.length };
    console.log(`📊 Alert processing complete:`, result);

    return result;
  } catch (error) {
    console.error('❌ Error in processJobAlerts:', error.message);
    throw error;
  }
}

/**
 * Sends digest emails for daily/weekly job alerts
 */
async function sendAlertDigests(frequency = null) {
  try {
    console.log(`📧 Sending ${frequency || 'scheduled'} job alert digests...`);

    const query = { isActive: true };
    if (frequency) {
      query.frequency = frequency;
    }

    const jobAlerts = await JobAlert.find(query).populate('userId');

    if (jobAlerts.length === 0) {
      console.log('ℹ️ No job alerts for digest');
      return { sent: 0, failed: 0 };
    }

    let sent = 0;
    let failed = 0;

    for (const jobAlert of jobAlerts) {
      try {
        // Check if we should send digest for this alert
        if (!shouldSendDigest(jobAlert)) {
          continue;
        }

        const user = jobAlert.userId;
        if (!user || !user.email) {
          console.warn(`⚠️ Skipping digest for alert ${jobAlert._id}: missing user`);
          failed++;
          continue;
        }

        // Get unnotified matches
        const unnotifiedMatches = jobAlert.matchingJobs.filter(m => !m.notificationSent);

        if (unnotifiedMatches.length === 0) {
          console.log(`ℹ️ No new matches for digest: "${jobAlert.name}"`);
          continue;
        }

        // Fetch job details for unnotified matches
        const jobIds = unnotifiedMatches.map(m => m.jobId);
        const jobs = await Job.findAll({
          where: { id: { [Op.in]: jobIds } },
        });

        // Send digest email
        await sendDigestEmail(user, jobAlert, jobs);

        // Mark as notified
        for (const match of unnotifiedMatches) {
          match.notificationSent = true;
          match.sentAt = new Date();
        }

        jobAlert.lastDigestSent = new Date();
        jobAlert.totalNotificationsSent += unnotifiedMatches.length;
        await jobAlert.save();

        sent++;
        console.log(`✅ Sent digest for "${jobAlert.name}": ${unnotifiedMatches.length} jobs`);
      } catch (error) {
        console.error(`❌ Error sending digest for alert ${jobAlert._id}:`, error.message);
        failed++;
      }
    }

    const result = { sent, failed, total: jobAlerts.length };
    console.log(`📊 Digest send complete:`, result);

    return result;
  } catch (error) {
    console.error('❌ Error in sendAlertDigests:', error.message);
    throw error;
  }
}

/**
 * Send instant notification for a single job
 */
async function sendInstantNotification(user, jobAlert, jobs) {
  try {
    const jobLinks = jobs
      .slice(0, 10)
      .map(
        job => `
      <div style="background: white; padding: 15px; margin: 10px 0; border-left: 4px solid #28a745;">
        <h3 style="margin-top: 0;">${job.title}</h3>
        <p><strong>Position:</strong> ${job.position}</p>
        <p><strong>Location:</strong> ${job.locationCity || 'Unknown'} ${job.locationProvince || ''}</p>
        <p><strong>Type:</strong> ${job.employmentType || 'Not specified'}</p>
        ${job.salaryMin || job.salaryMax ? `<p><strong>Salary:</strong> ${job.salaryMin || 'N/A'} - ${job.salaryMax || 'N/A'} ${job.salaryCurrency || 'ZWL'}</p>` : ''}
        <p><a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/jobs/${job.id}" style="background-color: #28a745; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View Job</a></p>
      </div>
    `
      )
      .join('');

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #28a745; color: white; padding: 20px; border-radius: 5px 5px 0 0; }
            .content { background-color: #f9f9f9; padding: 20px; border-radius: 0 0 5px 5px; }
            .footer { margin-top: 20px; font-size: 12px; color: #999; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2>New Matching Jobs!</h2>
              <p>Alert: ${jobAlert.name}</p>
            </div>
            <div class="content">
              <p>Hi ${user.firstName || 'there'},</p>
              <p>We found ${jobs.length} new job(s) matching your alert criteria:</p>
              
              ${jobLinks}
              
              <p style="margin-top: 20px; text-align: center;">
                <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/jobs" style="background-color: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px;">Browse All Jobs</a>
              </p>
              
              <div class="footer">
                <p>You received this email because you enabled job alerts. You can manage your alerts in your dashboard.</p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;

    await sendEmail(
      user.email,
      `[Alert: ${jobAlert.name}] ${jobs.length} New Matching Job${jobs.length > 1 ? 's' : ''}`,
      `${jobs.length} new job(s) matching your alert`,
      html
    );

    return true;
  } catch (error) {
    console.error('Error sending instant notification:', error.message);
    return false;
  }
}

/**
 * Send digest email with all accumulated jobs
 */
async function sendDigestEmail(user, jobAlert, jobs) {
  try {
    const jobLinks = jobs
      .map(
        job => `
      <div style="background: white; padding: 15px; margin: 10px 0; border-left: 4px solid #007bff;">
        <h3 style="margin-top: 0;">${job.title}</h3>
        <p><strong>Position:</strong> ${job.position}</p>
        <p><strong>Location:</strong> ${job.locationCity || 'Unknown'} ${job.locationProvince || ''}</p>
        <p><strong>Type:</strong> ${job.employmentType || 'Not specified'}</p>
        ${job.salaryMin || job.salaryMax ? `<p><strong>Salary:</strong> ${job.salaryMin || 'N/A'} - ${job.salaryMax || 'N/A'} ${job.salaryCurrency || 'ZWL'}</p>` : ''}
        <p><a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/jobs/${job.id}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View Job</a></p>
      </div>
    `
      )
      .join('');

    const digestType = jobAlert.frequency === 'daily' ? 'Daily' : 'Weekly';

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #007bff; color: white; padding: 20px; border-radius: 5px 5px 0 0; }
            .content { background-color: #f9f9f9; padding: 20px; border-radius: 0 0 5px 5px; }
            .footer { margin-top: 20px; font-size: 12px; color: #999; }
            .stat { display: inline-block; background: white; padding: 10px 20px; margin: 5px; border-radius: 5px; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2>${digestType} Job Digest</h2>
              <p>Alert: ${jobAlert.name}</p>
            </div>
            <div class="content">
              <p>Hi ${user.firstName || 'there'},</p>
              <p>Here's your ${digestType.toLowerCase()} digest of matching job opportunities:</p>
              
              <div style="background: white; padding: 15px; border-radius: 5px; margin: 15px 0; text-align: center;">
                <div class="stat">${jobs.length} Jobs Found</div>
                ${jobAlert.totalMatches ? `<div class="stat">Total Matches: ${jobAlert.totalMatches}</div>` : ''}
              </div>
              
              ${jobLinks}
              
              <p style="margin-top: 20px; text-align: center;">
                <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/jobs" style="background-color: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px;">View All Jobs</a>
              </p>
              
              <div class="footer">
                <p>You received this ${digestType.toLowerCase()} digest because you have job alerts enabled. Manage your alerts in your dashboard.</p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;

    const subject = `${digestType} Job Alert Digest: ${jobAlert.name} (${jobs.length} jobs)`;

    await sendEmail(user.email, subject, `${jobs.length} new jobs in your ${digestType.toLowerCase()} digest`, html);

    return true;
  } catch (error) {
    console.error('Error sending digest email:', error.message);
    return false;
  }
}

/**
 * Helper: Check if alert should be processed based on frequency
 */
function shouldProcessAlert(jobAlert, requestedFrequency) {
  if (requestedFrequency && jobAlert.frequency !== requestedFrequency) {
    return false;
  }

  // Always process instant alerts
  if (jobAlert.frequency === 'instant') {
    return true;
  }

  // For daily/weekly, return true (will check digest time separately)
  return true;
}

/**
 * Helper: Check if digest should be sent
 */
function shouldSendDigest(jobAlert) {
  const now = new Date();
  const currentHour = String(now.getHours()).padStart(2, '0');
  const currentMinute = String(now.getMinutes()).padStart(2, '0');
  const currentTime = `${currentHour}:${currentMinute}`;

  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const currentDay = dayNames[now.getDay()];

  if (jobAlert.frequency === 'daily') {
    // Send if current time is within digest time window (±10 minutes)
    return timeWindowMatch(currentTime, jobAlert.digestTime || '09:00');
  }

  if (jobAlert.frequency === 'weekly') {
    // Send if current day matches AND within time window
    if (currentDay === jobAlert.digestDay) {
      return timeWindowMatch(currentTime, jobAlert.digestTime || '09:00');
    }
    return false;
  }

  return false;
}

/**
 * Helper: Check if current time is within ±10 minutes of digest time
 */
function timeWindowMatch(currentTime, digestTime) {
  const [currentHour, currentMinute] = currentTime.split(':').map(Number);
  const [digestHour, digestMinute] = digestTime.split(':').map(Number);

  const currentTotalMinutes = currentHour * 60 + currentMinute;
  const digestTotalMinutes = digestHour * 60 + digestMinute;

  const difference = Math.abs(currentTotalMinutes - digestTotalMinutes);
  return difference <= 10; // Allow 10-minute window
}

/**
 * Find matching jobs for an alert
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

module.exports = {
  processJobAlerts,
  sendAlertDigests,
  sendInstantNotification,
  sendDigestEmail,
};
