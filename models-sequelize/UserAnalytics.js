const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const UserAnalytics = sequelize.define('UserAnalytics', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    },
    field: 'user_id'
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  sessionDuration: {
    type: DataTypes.INTEGER, // in minutes
    defaultValue: 0,
    field: 'session_duration'
  },
  pagesViewed: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'pages_viewed'
  },
  jobsViewed: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'jobs_viewed'
  },
  jobsApplied: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'jobs_applied'
  },
  searchesPerformed: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'searches_performed'
  },
  profileViews: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'profile_views'
  },
  resumeDownloads: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'resume_downloads'
  },
  deviceType: {
    type: DataTypes.ENUM('desktop', 'mobile', 'tablet'),
    allowNull: true,
    field: 'device_type'
  },
  location: {
    type: DataTypes.STRING,
    allowNull: true
  },
  userType: {
    type: DataTypes.ENUM('job_seeker', 'pharmacy', 'admin'),
    allowNull: false,
    field: 'user_type'
  },
  lastActivity: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'last_activity'
  }
}, {
  tableName: 'user_analytics',
  timestamps: true,
  indexes: [
    {
      fields: ['user_id', 'date']
    },
    {
      fields: ['user_type', 'date']
    }
  ]
});

module.exports = UserAnalytics;
