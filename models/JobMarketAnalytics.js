const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const JobMarketAnalytics = sequelize.define('JobMarketAnalytics', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  reportMonth: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  totalJobsPosted: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  totalApplications: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  averageApplicationsPerJob: {
    type: DataTypes.FLOAT,
  },
  topSkillsInDemand: {
    type: DataTypes.JSON,
  },
  topPositions: {
    type: DataTypes.JSON,
  },
  hiringTrend: {
    type: DataTypes.ENUM('increasing', 'stable', 'decreasing'),
  },
  salaryTrend: {
    type: DataTypes.ENUM('increasing', 'stable', 'decreasing'),
  },
  employmentRate: {
    type: DataTypes.FLOAT,
  },
  averageTimeToHire: {
    type: DataTypes.INTEGER, // in days
  },
  topHiringPharmacies: {
    type: DataTypes.JSON,
  },
  experienceInDemand: {
    type: DataTypes.JSON,
  },
  qualificationsNeeded: {
    type: DataTypes.JSON,
  },
  regionAnalysis: {
    type: DataTypes.JSON,
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  updatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
});

module.exports = JobMarketAnalytics;
