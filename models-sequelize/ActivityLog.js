const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ActivityLog = sequelize.define('ActivityLog', {
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
  action: {
    type: DataTypes.STRING(100),
    allowNull: false,
    // view_profile, save_job, apply_job, message_sent, post_created, etc
  },
  targetUserId: {
    type: DataTypes.BIGINT,
    allowNull: true,
    index: true,
  },
  jobId: {
    type: DataTypes.BIGINT,
    allowNull: true,
    index: true,
  },
  jobTitle: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  metadata: {
    type: DataTypes.JSON,
    allowNull: true,
    // Store additional context like IP, device, etc
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    index: true,
  },
}, {
  timestamps: false,
  tableName: 'activity_logs',
});

module.exports = ActivityLog;
