const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const JobAnalytics = sequelize.define('JobAnalytics', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  jobId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'jobs',
      key: 'id'
    },
    field: 'job_id'
  },
  pharmacyId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    },
    field: 'pharmacy_id'
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  views: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  applications: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  conversionRate: {
    type: DataTypes.DECIMAL(5, 2),
    defaultValue: 0.00,
    field: 'conversion_rate'
  },
  avgTimeToApply: {
    type: DataTypes.INTEGER, // in minutes
    allowNull: true,
    field: 'avg_time_to_apply'
  },
  source: {
    type: DataTypes.ENUM('organic', 'featured', 'search', 'saved_search'),
    defaultValue: 'organic'
  },
  deviceType: {
    type: DataTypes.ENUM('desktop', 'mobile', 'tablet'),
    allowNull: true,
    field: 'device_type'
  },
  location: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  tableName: 'job_analytics',
  timestamps: true,
  indexes: [
    {
      fields: ['job_id', 'date']
    },
    {
      fields: ['pharmacy_id', 'date']
    }
  ]
});

module.exports = JobAnalytics;
