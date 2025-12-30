const SavedJob = require('../models/SavedJob');
const User = require('../models-sequelize/User');
const Job = require('../models-sequelize/Job');
const { sendEmail } = require('./mailer');

/**
 * Sends reminder emails to users with enabled reminders based on their frequency
 * Can be called manually or via a scheduled task
 */
async function sendSavedJobReminders(frequency = null) {
  try {
    console.log(`📧 Starting reminder email job${frequency ? ` for ${frequency} reminders` : ''}...`);

    // Find saved jobs with reminders enabled
    const query = { emailReminderEnabled: true };
    if (frequency) {
      query.reminderFrequency = frequency;
    }

    const savedJobsWithReminders = await SavedJob.find(query)
      .populate('userId')
      .populate('jobId');

    if (savedJobsWithReminders.length === 0) {
      console.log('ℹ️ No saved jobs with reminders enabled');
      return { sent: 0, failed: 0, skipped: 0 };
    }

    console.log(`Found ${savedJobsWithReminders.length} saved jobs with reminders enabled`);

    let sent = 0;
    let failed = 0;
    let skipped = 0;

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
          } else if (savedJob.reminderFrequency === 'once' && !lastSent) {
            shouldSend = true;
          }
        }

        if (!shouldSend) {
          skipped++;
          continue;
        }

        const user = savedJob.userId;
        const job = savedJob.jobId;

        // Validate user and job exist
        if (!user || !user.email || !job) {
          console.warn(`⚠️ Skipping reminder for saved job ${savedJob._id}: missing user or job data`);
          skipped++;
          continue;
        }

        const jobUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/jobs/${job.id}`;

        const subject = `Reminder: ${job.title} at ${job.locationCity || 'Unknown Location'}`;
        const text = `Hi ${user.firstName},\n\nYou previously saved this job opening: ${job.title}\n\nView it here: ${jobUrl}`;

        const html = `
          <!DOCTYPE html>
          <html>
            <head>
              <style>
                body { font-family: Arial, sans-serif; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background-color: #007bff; color: white; padding: 20px; border-radius: 5px 5px 0 0; }
                .content { background-color: #f9f9f9; padding: 20px; border-radius: 0 0 5px 5px; }
                .job-details { background-color: white; padding: 15px; margin: 15px 0; border-left: 4px solid #007bff; }
                .button { display: inline-block; background-color: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin-top: 15px; }
                .footer { margin-top: 20px; font-size: 12px; color: #999; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h2>Job Reminder</h2>
                </div>
                <div class="content">
                  <p>Hi ${user.firstName || 'there'},</p>
                  <p>You previously saved this job opening. Don't miss this opportunity!</p>
                  
                  <div class="job-details">
                    <h3>${job.title}</h3>
                    <p><strong>Position:</strong> ${job.position || 'Not specified'}</p>
                    <p><strong>Location:</strong> ${job.locationCity || 'Unknown'} ${job.locationProvince ? `, ${job.locationProvince}` : ''}</p>
                    <p><strong>Employment Type:</strong> ${job.employmentType || 'Not specified'}</p>
                    ${job.salaryMin || job.salaryMax ? `<p><strong>Salary Range:</strong> ${job.salaryMin || 'Not specified'} - ${job.salaryMax || 'Not specified'} ${job.salaryCurrency || 'ZWL'}</p>` : ''}
                    ${savedJob.notes ? `<p><strong>Your Notes:</strong> ${savedJob.notes}</p>` : ''}
                  </div>
                  
                  <p>
                    <a href="${jobUrl}" class="button">View Full Job Details</a>
                  </p>
                  
                  <div class="footer">
                    <p>You received this email because you enabled job reminders in your saved jobs. You can change your preferences anytime.</p>
                  </div>
                </div>
              </div>
            </body>
          </html>
        `;

        await sendEmail(user.email, subject, text, html);

        // Update last reminder sent timestamp
        savedJob.lastReminderSent = now;
        await savedJob.save();

        sent++;
        console.log(`✅ Sent reminder to ${user.email} for job "${job.title}"`);
      } catch (error) {
        console.error(`❌ Failed to send reminder for saved job ${savedJob._id}:`, error.message);
        failed++;
      }
    }

    const result = { sent, failed, skipped, total: savedJobsWithReminders.length };
    console.log(`📊 Reminder job completed:`, result);

    return result;
  } catch (error) {
    console.error('❌ Error in sendSavedJobReminders:', error.message);
    throw error;
  }
}

/**
 * Initializes a scheduled job to send reminders at specified intervals
 * Should be called once during app startup
 */
function initializeReminderScheduler() {
  try {
    // Check if node-cron is available
    let cron;
    try {
      cron = require('node-cron');
    } catch (e) {
      console.log('⚠️ node-cron not installed. Install it to enable scheduled reminders: npm install node-cron');
      return;
    }

    // Run daily at 8 AM
    cron.schedule('0 8 * * *', () => {
      console.log('⏰ Running scheduled daily reminder check...');
      sendSavedJobReminders('daily').catch((err) => {
        console.error('Error in scheduled daily reminder:', err);
      });
    });

    // Run weekly on Mondays at 9 AM
    cron.schedule('0 9 * * 1', () => {
      console.log('⏰ Running scheduled weekly reminder check...');
      sendSavedJobReminders('weekly').catch((err) => {
        console.error('Error in scheduled weekly reminder:', err);
      });
    });

    console.log('✅ Job reminder scheduler initialized');
  } catch (error) {
    console.error('⚠️ Failed to initialize reminder scheduler:', error.message);
  }
}

module.exports = { sendSavedJobReminders, initializeReminderScheduler };
