const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const RealtimeNotification = sequelize.define('RealtimeNotification', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.BIGINT,
    allowNull: false,
    index: true,
  },
  type: {
    type: DataTypes.ENUM(
      'job_alert',
      'job_viewed',
      'message_received',
      'profile_viewed',
      'saved_job',
      'application_update',
      'recommendation',
      'achievement',
      'system_alert'
    ),
    allowNull: false,
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  relatedUserId: {
    type: DataTypes.BIGINT,
    allowNull: true,
    // Who triggered the notification (if applicable)
  },
  relatedJobId: {
    type: DataTypes.BIGINT,
    allowNull: true,
  },
  relatedId: {
    type: DataTypes.STRING(255),
    allowNull: true,
    // Generic ID reference for any entity
  },
  actionUrl: {
    type: DataTypes.STRING(255),
    allowNull: true,
    // URL to navigate when clicked
  },
  actionLabel: {
    type: DataTypes.STRING(100),
    defaultValue: 'View',
  },
  icon: {
    type: DataTypes.STRING(50),
    allowNull: true,
    // Icon class/name for frontend
  },
  isRead: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    index: true,
  },
  readAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  isDismissed: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  dismissedAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  priority: {
    type: DataTypes.ENUM('low', 'normal', 'high', 'urgent'),
    defaultValue: 'normal',
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    index: true,
  },
  expiresAt: {
    type: DataTypes.DATE,
    allowNull: true,
    // Auto-delete notification after this date
  },
}, {
  timestamps: false,
  tableName: 'realtime_notifications',
});

module.exports = RealtimeNotification;
