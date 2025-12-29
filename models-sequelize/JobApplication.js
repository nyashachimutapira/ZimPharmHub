const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const JobApplication = sequelize.define('JobApplication', {
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
  jobId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'jobs',
      key: 'id'
    },
    field: 'job_id'
  },
  status: {
    type: DataTypes.ENUM('pending', 'reviewing', 'shortlisted', 'interview', 'accepted', 'rejected'),
    defaultValue: 'pending'
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  resume: {
    type: DataTypes.STRING,
    allowNull: true
  },
  coverLetter: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'cover_letter'
  },
  appliedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    field: 'applied_at'
  }
}, {
  tableName: 'job_applications',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['user_id', 'job_id']
    }
  ]
});

module.exports = JobApplication;

