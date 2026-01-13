const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const CPDRecord = sequelize.define('CPDRecord', {
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
  activityType: {
    type: DataTypes.ENUM(
      'workshop', 'seminar', 'conference', 'online_course', 
      'publication', 'presentation', 'research', 'certification',
      'professional_meeting', 'mentoring'
    ),
    allowNull: false,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  provider: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  hoursEarned: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false,
    validate: { min: 0 },
  },
  activityDate: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  completionCertificate: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  evidence: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  category: {
    type: DataTypes.ENUM('mandatory', 'elective'),
    defaultValue: 'elective',
  },
  verified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  verifiedBy: {
    type: DataTypes.UUID,
    references: {
      model: 'Users',
      key: 'id',
    },
    allowNull: true,
  },
  verificationDate: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  notes: {
    type: DataTypes.TEXT,
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
  tableName: 'CPDRecords',
  timestamps: true,
});

module.exports = CPDRecord;
