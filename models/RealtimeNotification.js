const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const RealtimeNotification = sequelize.define('RealtimeNotification', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id',
    },
  },
  type: {
    type: DataTypes.ENUM(
      'job_alert', 'new_message', 'pharmacy_update', 
      'mentorship_request', 'cpd_reminder', 'application_update',
      'review_posted', 'system_notification'
    ),
    allowNull: false,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  category: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  priority: {
    type: DataTypes.ENUM('low', 'medium', 'high', 'urgent'),
    defaultValue: 'medium',
  },
  relatedId: {
    type: DataTypes.UUID,
    allowNull: true,
    comment: 'ID of related entity (job, message, pharmacy, etc)',
  },
  relatedType: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Type of related entity (job, message, pharmacy, etc)',
  },
  isRead: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  readAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  actionUrl: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  emailSent: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  emailSentAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  smsSent: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  smsSentAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  pushSent: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  pushSentAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  dismissed: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  dismissedAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  expiresAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  metadata: {
    type: DataTypes.JSON,
    allowNull: true,
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  updatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'RealtimeNotifications',
  timestamps: true,
  indexes: [
    { fields: ['userId', 'isRead'] },
    { fields: ['createdAt'] },
    { fields: ['type'] },
  ],
});

module.exports = RealtimeNotification;
