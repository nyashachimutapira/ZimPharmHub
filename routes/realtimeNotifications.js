const express = require('express');
const router = express.Router();
const { body, validationResult, param, query } = require('express-validator');
const auth = require('../middleware/auth');
const RealtimeNotification = require('../models/RealtimeNotification');
const { Op } = require('sequelize');

// Get notifications for current user
router.get('/', auth, [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('read').optional().isBoolean(),
  query('type').optional().isString(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { page = 1, limit = 20, read, type } = req.query;
    const offset = (page - 1) * limit;

    let where = { userId: req.user.id };
    if (read !== undefined) where.isRead = read === 'true';
    if (type) where.type = type;
    // Don't show expired notifications
    where.expiresAt = { [Op.or]: [{ [Op.gte]: new Date() }, { [Op.eq]: null }] };

    const notifications = await RealtimeNotification.findAndCountAll({
      where,
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset,
    });

    return res.json({
      success: true,
      data: notifications.rows,
      unreadCount: await RealtimeNotification.count({
        where: { userId: req.user.id, isRead: false, expiresAt: { [Op.or]: [{ [Op.gte]: new Date() }, { [Op.eq]: null }] } },
      }),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: notifications.count,
        pages: Math.ceil(notifications.count / limit),
      },
    });
  } catch (err) {
    console.error('Error fetching notifications:', err);
    return res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

// Get unread count
router.get('/unread/count', auth, async (req, res) => {
  try {
    const count = await RealtimeNotification.count({
      where: {
        userId: req.user.id,
        isRead: false,
        expiresAt: { [Op.or]: [{ [Op.gte]: new Date() }, { [Op.eq]: null }] },
      },
    });

    return res.json({
      success: true,
      unreadCount: count,
    });
  } catch (err) {
    console.error('Error fetching unread count:', err);
    return res.status(500).json({ error: 'Failed to fetch count' });
  }
});

// Mark notification as read
router.patch('/:notificationId/read', auth, [
  param('notificationId').isUUID(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { notificationId } = req.params;
    const notification = await RealtimeNotification.findByPk(notificationId);

    if (!notification) return res.status(404).json({ error: 'Notification not found' });
    if (notification.userId !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    await notification.update({
      isRead: true,
      readAt: new Date(),
    });

    return res.json({
      success: true,
      data: notification,
    });
  } catch (err) {
    console.error('Error marking notification as read:', err);
    return res.status(500).json({ error: 'Failed to update notification' });
  }
});

// Mark multiple notifications as read
router.patch('/read-all', auth, async (req, res) => {
  try {
    await RealtimeNotification.update(
      { isRead: true, readAt: new Date() },
      { where: { userId: req.user.id, isRead: false } }
    );

    return res.json({
      success: true,
      message: 'All notifications marked as read',
    });
  } catch (err) {
    console.error('Error marking all as read:', err);
    return res.status(500).json({ error: 'Failed to update notifications' });
  }
});

// Dismiss a notification
router.patch('/:notificationId/dismiss', auth, [
  param('notificationId').isUUID(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { notificationId } = req.params;
    const notification = await RealtimeNotification.findByPk(notificationId);

    if (!notification) return res.status(404).json({ error: 'Notification not found' });
    if (notification.userId !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    await notification.update({
      dismissed: true,
      dismissedAt: new Date(),
    });

    return res.json({
      success: true,
      data: notification,
    });
  } catch (err) {
    console.error('Error dismissing notification:', err);
    return res.status(500).json({ error: 'Failed to dismiss notification' });
  }
});

// Delete notification
router.delete('/:notificationId', auth, [
  param('notificationId').isUUID(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { notificationId } = req.params;
    const notification = await RealtimeNotification.findByPk(notificationId);

    if (!notification) return res.status(404).json({ error: 'Notification not found' });
    if (notification.userId !== req.user.id && req.user.userType !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    await notification.destroy();

    return res.json({
      success: true,
      message: 'Notification deleted',
    });
  } catch (err) {
    console.error('Error deleting notification:', err);
    return res.status(500).json({ error: 'Failed to delete notification' });
  }
});

// Get notification preferences
router.get('/preferences', auth, async (req, res) => {
  try {
    // This would be part of User model
    // For now, return default preferences
    return res.json({
      success: true,
      data: {
        jobAlerts: true,
        messages: true,
        pharmacyUpdates: true,
        mentorshipRequests: true,
        cpdReminders: true,
        applicationUpdates: true,
        emailNotifications: true,
        smsNotifications: false,
        pushNotifications: true,
      },
    });
  } catch (err) {
    console.error('Error fetching preferences:', err);
    return res.status(500).json({ error: 'Failed to fetch preferences' });
  }
});

// Update notification preferences
router.patch('/preferences', auth, [
  body('jobAlerts').optional().isBoolean(),
  body('messages').optional().isBoolean(),
  body('pharmacyUpdates').optional().isBoolean(),
  body('mentorshipRequests').optional().isBoolean(),
  body('cpdReminders').optional().isBoolean(),
  body('applicationUpdates').optional().isBoolean(),
  body('emailNotifications').optional().isBoolean(),
  body('smsNotifications').optional().isBoolean(),
  body('pushNotifications').optional().isBoolean(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    // This would be stored in User model
    // For now, return success with updated preferences
    const preferences = req.body;

    return res.json({
      success: true,
      data: preferences,
      message: 'Notification preferences updated',
    });
  } catch (err) {
    console.error('Error updating preferences:', err);
    return res.status(500).json({ error: 'Failed to update preferences' });
  }
});

// Get notifications by type
router.get('/type/:type', auth, [
  param('type').isIn([
    'job_alert', 'new_message', 'pharmacy_update',
    'mentorship_request', 'cpd_reminder', 'application_update',
    'review_posted', 'system_notification'
  ]),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { type } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const notifications = await RealtimeNotification.findAndCountAll({
      where: {
        userId: req.user.id,
        type,
        expiresAt: { [Op.or]: [{ [Op.gte]: new Date() }, { [Op.eq]: null }] },
      },
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset,
    });

    return res.json({
      success: true,
      data: notifications.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: notifications.count,
        pages: Math.ceil(notifications.count / limit),
      },
    });
  } catch (err) {
    console.error('Error fetching notifications by type:', err);
    return res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

module.exports = router;
