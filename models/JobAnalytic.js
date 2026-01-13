const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const JobAnalytic = sequelize.define('JobAnalytic', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  jobId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Jobs',
      key: 'id',
    },
  },
  employerId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id',
    },
  },
  views: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  clicks: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  applications: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  applicationRate: {
    type: DataTypes.DECIMAL(5, 2),
    defaultValue: 0,
    comment: 'Percentage: (applications / views) * 100',
  },
  conversions: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  conversionRate: {
    type: DataTypes.DECIMAL(5, 2),
    defaultValue: 0,
    comment: 'Percentage: (conversions / applications) * 100',
  },
  uniqueViewers: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  averageTimeSpent: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: 'In seconds',
  },
  lastViewed: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  lastUpdated: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
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
  tableName: 'JobAnalytics',
  timestamps: true,
});

module.exports = JobAnalytic;
