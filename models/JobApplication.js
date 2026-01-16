const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');

const JobApplication = sequelize.define('JobApplication', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  jobId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: User,
      key: 'id',
    },
  },
  applicationNumber: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  status: {
    type: DataTypes.ENUM('applied', 'reviewed', 'shortlisted', 'interviewed', 'offered', 'rejected', 'withdrawn'),
    defaultValue: 'applied',
  },
  coverLetter: {
    type: DataTypes.TEXT,
  },
  resumeUrl: {
    type: DataTypes.STRING,
  },
  appliedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  reviewedAt: {
    type: DataTypes.DATE,
  },
  reviewedBy: {
    type: DataTypes.UUID,
    references: {
      model: User,
      key: 'id',
    },
  },
  interviewDate: {
    type: DataTypes.DATE,
  },
  interviewNotes: {
    type: DataTypes.TEXT,
  },
  rejectionReason: {
    type: DataTypes.TEXT,
  },
  offerDetails: {
    type: DataTypes.JSON,
  },
  feedback: {
    type: DataTypes.TEXT,
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

module.exports = JobApplication;
