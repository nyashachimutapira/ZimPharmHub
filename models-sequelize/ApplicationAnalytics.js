const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ApplicationAnalytics = sequelize.define('ApplicationAnalytics', {
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
  totalApplications: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'total_applications'
  },
  pendingApplications: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'pending_applications'
  },
  reviewingApplications: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'reviewing_applications'
  },
  shortlistedApplications: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'shortlisted_applications'
  },
  interviewApplications: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'interview_applications'
  },
  acceptedApplications: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'accepted_applications'
  },
  rejectedApplications: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'rejected_applications'
  },
  conversionToInterview: {
    type: DataTypes.DECIMAL(5, 2),
    defaultValue: 0.00,
    field: 'conversion_to_interview'
  },
  conversionToOffer: {
    type: DataTypes.DECIMAL(5, 2),
    defaultValue: 0.00,
    field: 'conversion_to_offer'
  },
  avgTimeToDecision: {
    type: DataTypes.INTEGER, // in days
    allowNull: true,
    field: 'avg_time_to_decision'
  },
  avgResponseTime: {
    type: DataTypes.INTEGER, // in hours
    allowNull: true,
    field: 'avg_response_time'
  },
  geographicDistribution: {
    type: DataTypes.JSONB,
    defaultValue: {},
    field: 'geographic_distribution'
  },
  qualificationMatch: {
    type: DataTypes.DECIMAL(5, 2),
    defaultValue: 0.00,
    field: 'qualification_match'
  }
}, {
  tableName: 'application_analytics',
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

module.exports = ApplicationAnalytics;
