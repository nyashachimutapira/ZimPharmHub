const express = require('express');
const { getIO, sendNotificationToUser } = require('../config/socketio');
const RealtimeNotification = require('../models-sequelize/RealtimeNotification');
const ChatMessage = require('../models-sequelize/ChatMessage');
const ActivityLog = require('../models-sequelize/ActivityLog');
const authenticate = require('../middleware/authenticate');
const sequelize = require('../config/database');

const router = express.Router();

// ==========================================
// NOTIFICATIONS ENDPOINTS
// ==========================================

// Get all notifications for logged-in user
router.get('/notifications', authenticate, async (req, res) => {
  try {
    const { isRead, type, limit = 20, offset = 0 } = req.query;
    
    let where = { userId: req.user.id };
    if (isRead !== undefined) where.isRead = isRead === 'true';
    if (type) where.type = type;

    const notifications = await RealtimeNotification.findAndCountAll({
      where,
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    res.json({
      success: true,
      notifications: notifications.rows,
      total: notifications.count,
      unread: await RealtimeNotification.count({
        where: { userId: req.user.id, isRead: false },
      }),
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get unread notification count
router.get('/notifications/unread/count', authenticate, async (req, res) => {
  try {
    const count = await RealtimeNotification.count({
      where: { userId: req.user.id, isRead: false },
    });

    res.json({ success: true, unreadCount: count });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Mark notification as read
router.put('/notifications/:notificationId/read', authenticate, async (req, res) => {
  try {
    const notification = await RealtimeNotification.findOne({
      where: { id: req.params.notificationId, userId: req.user.id },
    });

    if (!notification) {
      return res.status(404).json({ success: false, error: 'Notification not found' });
    }

    await notification.update({
      isRead: true,
      readAt: new Date(),
    });

    res.json({ success: true, notification });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Mark all notifications as read
router.put('/notifications/mark-all-read', authenticate, async (req, res) => {
  try {
    await RealtimeNotification.update(
      { isRead: true, readAt: new Date() },
      {
        where: { userId: req.user.id, isRead: false },
      }
    );

    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Delete notification
router.delete('/notifications/:notificationId', authenticate, async (req, res) => {
  try {
    const notification = await RealtimeNotification.findOne({
      where: { id: req.params.notificationId, userId: req.user.id },
    });

    if (!notification) {
      return res.status(404).json({ success: false, error: 'Notification not found' });
    }

    await notification.destroy();

    res.json({ success: true, message: 'Notification deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Clear all read notifications
router.delete('/notifications/clear-read', authenticate, async (req, res) => {
  try {
    await RealtimeNotification.destroy({
      where: { userId: req.user.id, isRead: true },
    });

    res.json({ success: true, message: 'Read notifications cleared' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==========================================
// CHAT ENDPOINTS
// ==========================================

// Get chat history between two users
router.get('/chat/:recipientId', authenticate, async (req, res) => {
  try {
    const { limit = 50, offset = 0 } = req.query;
    const { recipientId } = req.params;

    const messages = await ChatMessage.findAndCountAll({
      where: sequelize.where(
        sequelize.fn('COALESCE', sequelize.col('senderId'), sequelize.col('recipientId')),
        'IN',
        [req.user.id, recipientId]
      ),
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    // Mark messages as read
    await ChatMessage.update(
      { isRead: true, readAt: new Date() },
      {
        where: {
          recipientId: req.user.id,
          senderId: recipientId,
          isRead: false,
        },
      }
    );

    res.json({
      success: true,
      messages: messages.rows.reverse(),
      total: messages.count,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get all conversations (chat list)
router.get('/chat/conversations', authenticate, async (req, res) => {
  try {
    // Get unique users we've chatted with (most recent first)
    const conversations = await sequelize.query(`
      SELECT DISTINCT
        CASE 
          WHEN "senderId" = ? THEN "recipientId"
          ELSE "senderId"
        END AS userId,
        MAX("createdAt") as lastMessageAt
      FROM chat_messages
      WHERE "senderId" = ? OR "recipientId" = ?
      GROUP BY userId
      ORDER BY lastMessageAt DESC
    `, {
      replacements: [req.user.id, req.user.id, req.user.id],
      type: sequelize.QueryTypes.SELECT,
    });

    res.json({ success: true, conversations });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Send chat message
router.post('/chat/send', authenticate, async (req, res) => {
  try {
    const { recipientId, message, messageType = 'text', attachmentUrl } = req.body;

    if (!recipientId || !message) {
      return res.status(400).json({
        success: false,
        error: 'recipientId and message are required',
      });
    }

    const chatMessage = await ChatMessage.create({
      senderId: req.user.id,
      senderName: `${req.user.firstName} ${req.user.lastName}`,
      senderAvatar: req.user.profilePicture,
      recipientId,
      message,
      messageType,
      attachmentUrl,
    });

    // Emit real-time notification via WebSocket
    const io = getIO();
    if (io) {
      io.to(`user:${recipientId}`).emit('message_received', {
        id: chatMessage.id,
        senderId: req.user.id,
        senderName: chatMessage.senderName,
        senderAvatar: chatMessage.senderAvatar,
        message: chatMessage.message,
        messageType: chatMessage.messageType,
        createdAt: chatMessage.createdAt,
      });
    }

    // Also send notification
    await RealtimeNotification.create({
      userId: recipientId,
      type: 'message_received',
      title: `New message from ${chatMessage.senderName}`,
      content: chatMessage.message.substring(0, 100),
      relatedUserId: req.user.id,
      actionUrl: `/chat/${req.user.id}`,
      icon: 'chat',
      priority: 'high',
    });

    res.json({ success: true, message: chatMessage });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Delete chat message
router.delete('/chat/:messageId', authenticate, async (req, res) => {
  try {
    const chatMessage = await ChatMessage.findOne({
      where: { id: req.params.messageId, senderId: req.user.id },
    });

    if (!chatMessage) {
      return res.status(404).json({ success: false, error: 'Message not found' });
    }

    await chatMessage.destroy();

    res.json({ success: true, message: 'Message deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==========================================
// ACTIVITY FEED ENDPOINTS
// ==========================================

// Get activity feed (who viewed your profile, etc)
router.get('/activity-feed', authenticate, async (req, res) => {
  try {
    const { limit = 20, offset = 0 } = req.query;

    const activities = await ActivityLog.findAndCountAll({
      where: {
        targetUserId: req.user.id,
        action: ['view_profile', 'save_job', 'message_sent'],
      },
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    res.json({
      success: true,
      activities: activities.rows,
      total: activities.count,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Log user activity
router.post('/activity/log', authenticate, async (req, res) => {
  try {
    const { action, targetUserId, jobId, metadata } = req.body;

    const activity = await ActivityLog.create({
      userId: req.user.id,
      action,
      targetUserId,
      jobId,
      metadata,
    });

    // Send notification if viewing someone's profile
    if (action === 'view_profile' && targetUserId) {
      await RealtimeNotification.create({
        userId: targetUserId,
        type: 'profile_viewed',
        title: `${req.user.firstName} viewed your profile`,
        relatedUserId: req.user.id,
        actionUrl: `/profile/${req.user.id}`,
        icon: 'eye',
        priority: 'low',
      });

      // WebSocket notification
      const io = getIO();
      if (io) {
        io.to(`user:${targetUserId}`).emit('profile_viewed', {
          userId: req.user.id,
          userName: `${req.user.firstName} ${req.user.lastName}`,
          userAvatar: req.user.profilePicture,
          viewedAt: new Date(),
        });
      }
    }

    res.json({ success: true, activity });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
