const nodemailer = require('nodemailer');
const Newsletter = require('../models/Newsletter');
require('dotenv').config();

const EMAIL_HOST = process.env.EMAIL_HOST;
const EMAIL_PORT = process.env.EMAIL_PORT;
const EMAIL_SECURE = process.env.EMAIL_SECURE === 'true';
const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;
const EMAIL_FROM = process.env.EMAIL_FROM || `ZimPharmHub <no-reply@${process.env.FRONTEND_URL?.replace(/^https?:\/\//, '') || 'zimpharmhub.local'}>`;

let transporter = null;
if (EMAIL_HOST && EMAIL_USER && EMAIL_PASS) {
  transporter = nodemailer.createTransport({
    host: EMAIL_HOST,
    port: EMAIL_PORT ? parseInt(EMAIL_PORT, 10) : (EMAIL_SECURE ? 465 : 587),
    secure: EMAIL_SECURE,
    auth: {
      user: EMAIL_USER,
      pass: EMAIL_PASS,
    },
  });
  transporter.verify().then(() => console.log('✅ Email transporter ready')).catch((err) => console.warn('⚠️ Email transporter not ready:', err.message));
} else {
  console.log('ℹ️ Email not configured. Set EMAIL_HOST, EMAIL_USER, EMAIL_PASS to enable sending emails.');
}

const { loadTemplate, renderTemplate } = require('./emailTemplates');

async function sendEmail(to, subject, text, html) {
  if (!transporter) {
    console.log(`📧 [DEV] Would send email to ${to}: ${subject}`);
    return { messageId: 'dev-local' };
  }

  const mailOptions = {
    from: EMAIL_FROM,
    to,
    subject,
    text,
    html,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent to ${to}: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error(`❌ Failed to send email to ${to}:`, error.message);
    throw error;
  }
}

async function sendReceiptEmail({ recipientEmail, recipientName, jobTitle, amount, currency = 'usd', featuredUntil, jobUrl, locale = 'en' }) {
  const templateStr = loadTemplate('receipt', locale);
  const html = renderTemplate(templateStr, {
    recipientName: recipientName || recipientEmail || 'Customer',
    siteName: process.env.FRONTEND_NAME || 'ZimPharmHub',
    jobTitle,
    amount: amount ? Number(amount).toFixed(2) : '',
    currency,
    featuredUntil: featuredUntil ? new Date(featuredUntil).toDateString() : '',
    jobUrl
  });
  const text = `Thank you for your payment: ${jobTitle} - ${amount} ${currency}`;
  return sendEmail(recipientEmail, `Payment receipt — ${process.env.FRONTEND_NAME || 'ZimPharmHub'}`, text, html);
}

async function sendOwnerNotification({ ownerEmail, ownerName, jobTitle, featuredUntil, jobUrl, locale = 'en' }) {
  const templateStr = loadTemplate('owner_notification', locale);
  const html = renderTemplate(templateStr, {
    ownerName: ownerName || ownerEmail || 'Owner',
    siteName: process.env.FRONTEND_NAME || 'ZimPharmHub',
    jobTitle,
    featuredUntil: featuredUntil ? new Date(featuredUntil).toDateString() : '',
    jobUrl
  });
  const text = `Your job ${jobTitle} has been featured until ${featuredUntil}`;
  return sendEmail(ownerEmail, `Your job has been featured — ${process.env.FRONTEND_NAME || 'ZimPharmHub'}`, text, html);
}

// Notify newsletter subscribers for a given category (e.g., 'jobs' or 'products')
async function notifySubscribers(category, subject, plainText, htmlContent) {
  try {
    if (!['jobs', 'products', 'news', 'events'].includes(category)) {
      console.log(`ℹ️ Unknown newsletter category: ${category}`);
    }

    // Get active subscribers who opted into this category
    const subs = await Newsletter.find({ isActive: true, [`categories.${category}`]: true }).limit(1000);
    if (!subs || subs.length === 0) {
      console.log(`ℹ️ No subscribers for category ${category}`);
      return { sent: 0 };
    }

    let sent = 0;
    for (const s of subs) {
      try {
        await sendEmail(s.email, subject, plainText, htmlContent);
        sent++;
      } catch (err) {
        console.warn(`Failed to send to ${s.email}: ${err.message}`);
      }
    }

    console.log(`✅ Notified ${sent}/${subs.length} subscribers for ${category}`);
    return { sent, total: subs.length };
  } catch (error) {
    console.error('Error notifying subscribers:', error.message);
    return { sent: 0, error: error.message };
  }
}

module.exports = { sendEmail, notifySubscribers, sendReceiptEmail, sendOwnerNotification };

