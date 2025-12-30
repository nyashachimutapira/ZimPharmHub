const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const applicationStatusEmails = {
  pending: {
    subject: 'Application Received - ZimPharmHub',
    template: (job, pharmacy) =>
      `
      <h2>Application Received</h2>
      <p>Thank you for applying to <strong>${job.title}</strong> at <strong>${pharmacy.firstName} ${pharmacy.lastName}</strong>.</p>
      <p>Your application is being reviewed. We'll notify you of any updates.</p>
      <p>Best regards,<br>ZimPharmHub Team</p>
      `,
  },
  reviewing: {
    subject: 'Your Application is Under Review - ZimPharmHub',
    template: (job, pharmacy) =>
      `
      <h2>Application Under Review</h2>
      <p>Great news! Your application for <strong>${job.title}</strong> is now being reviewed by the pharmacy team.</p>
      <p>We'll keep you updated on the progress.</p>
      <p>Best regards,<br>ZimPharmHub Team</p>
      `,
  },
  shortlisted: {
    subject: 'Congratulations! You\'ve Been Shortlisted - ZimPharmHub',
    template: (job, pharmacy) =>
      `
      <h2>You've Been Shortlisted!</h2>
      <p>Excellent news! You've been shortlisted for the position of <strong>${job.title}</strong> at <strong>${pharmacy.firstName} ${pharmacy.lastName}</strong>.</p>
      <p>The next step will be an interview. Stay tuned for interview details.</p>
      <p>Best regards,<br>ZimPharmHub Team</p>
      `,
  },
  interview: {
    subject: 'Interview Scheduled - ZimPharmHub',
    template: (job, pharmacy, application) =>
      `
      <h2>Interview Scheduled</h2>
      <p>You have been scheduled for an interview for the position of <strong>${job.title}</strong> at <strong>${pharmacy.firstName} ${pharmacy.lastName}</strong>.</p>
      <p><strong>Interview Details:</strong></p>
      <ul>
        <li><strong>Date:</strong> ${new Date(application.interviewDate).toLocaleDateString()}</li>
        <li><strong>Time:</strong> ${application.interviewTime}</li>
        <li><strong>Location:</strong> ${application.interviewLocation}</li>
      </ul>
      <p>Please arrive 10 minutes early. If you need to reschedule, contact the pharmacy directly.</p>
      <p>Best regards,<br>ZimPharmHub Team</p>
      `,
  },
  accepted: {
    subject: 'Job Offer - Congratulations! - ZimPharmHub',
    template: (job, pharmacy, application) =>
      `
      <h2>Congratulations! Job Offer</h2>
      <p>We're excited to offer you the position of <strong>${job.title}</strong> at <strong>${pharmacy.firstName} ${pharmacy.lastName}</strong>!</p>
      <p><strong>Offer Details:</strong></p>
      <ul>
        <li><strong>Position:</strong> ${job.title}</li>
        <li><strong>Salary:</strong> ZWL ${application.salary}</li>
        <li><strong>Start Date:</strong> ${new Date(application.startDate).toLocaleDateString()}</li>
      </ul>
      <p>Please confirm your acceptance by contacting the pharmacy directly.</p>
      <p>Congratulations on this exciting opportunity!</p>
      <p>Best regards,<br>ZimPharmHub Team</p>
      `,
  },
  rejected: {
    subject: 'Application Status Update - ZimPharmHub',
    template: (job, pharmacy, application) =>
      `
      <h2>Application Status Update</h2>
      <p>Thank you for your interest in the position of <strong>${job.title}</strong> at <strong>${pharmacy.firstName} ${pharmacy.lastName}</strong>.</p>
      <p>Unfortunately, we have decided to move forward with other candidates at this time.</p>
      ${application.rejectionReason ? `<p><strong>Feedback:</strong> ${application.rejectionReason}</p>` : ''}
      <p>We encourage you to apply for other positions that match your qualifications.</p>
      <p>Best regards,<br>ZimPharmHub Team</p>
      `,
  },
};

const sendApplicationStatusEmail = async (userEmail, userName, application, job, pharmacy) => {
  try {
    const emailConfig = applicationStatusEmails[application.status];

    if (!emailConfig) {
      console.log(`No email template for status: ${application.status}`);
      return;
    }

    const html = emailConfig.template(job, pharmacy, application);

    const mailOptions = {
      from: process.env.SMTP_USER,
      to: userEmail,
      subject: emailConfig.subject,
      html: `
        <html>
          <body style="font-family: Arial, sans-serif; background-color: #f9f9f9; padding: 20px;">
            <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 20px; border-radius: 8px;">
              <h1 style="color: #003366; text-align: center;">ZimPharmHub</h1>
              <p>Dear ${userName},</p>
              ${html}
              <hr style="margin: 20px 0; border: none; border-top: 1px solid #eee;">
              <p style="text-align: center; color: #999; font-size: 12px;">
                © 2024 ZimPharmHub. All rights reserved. | 
                <a href="http://zimpharmhub.com" style="color: #00bfff; text-decoration: none;">Visit our website</a>
              </p>
            </div>
          </body>
        </html>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${userEmail} for application status: ${application.status}`);
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

const sendApplicationNotificationEmail = async (pharmacyEmail, pharmacyName, applicant, job) => {
  try {
    const html = `
      <h2>New Application Received</h2>
      <p>You have received a new application for <strong>${job.title}</strong> from <strong>${applicant.firstName} ${applicant.lastName}</strong>.</p>
      <p><strong>Applicant Details:</strong></p>
      <ul>
        <li><strong>Name:</strong> ${applicant.firstName} ${applicant.lastName}</li>
        <li><strong>Email:</strong> ${applicant.email}</li>
        <li><strong>Phone:</strong> ${applicant.phone || 'Not provided'}</li>
      </ul>
      <p><a href="http://zimpharmhub.com/applications">Review application</a></p>
    `;

    const mailOptions = {
      from: process.env.SMTP_USER,
      to: pharmacyEmail,
      subject: `New Application - ${job.title} - ZimPharmHub`,
      html: `
        <html>
          <body style="font-family: Arial, sans-serif; background-color: #f9f9f9; padding: 20px;">
            <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 20px; border-radius: 8px;">
              <h1 style="color: #003366; text-align: center;">ZimPharmHub</h1>
              <p>Dear ${pharmacyName},</p>
              ${html}
              <hr style="margin: 20px 0; border: none; border-top: 1px solid #eee;">
              <p style="text-align: center; color: #999; font-size: 12px;">
                © 2024 ZimPharmHub. All rights reserved.
              </p>
            </div>
          </body>
        </html>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Notification sent to ${pharmacyEmail} for new application`);
  } catch (error) {
    console.error('Error sending notification email:', error);
  }
};

module.exports = {
  sendApplicationStatusEmail,
  sendApplicationNotificationEmail,
};
