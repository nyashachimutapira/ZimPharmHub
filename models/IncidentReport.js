const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');

const IncidentReport = sequelize.define('IncidentReport', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  reporterId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: User,
      key: 'id',
    },
  },
  reportNumber: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  category: {
    type: DataTypes.ENUM('workplace_safety', 'legal_issue', 'ethical_concern', 'health_hazard', 'compliance_violation', 'other'),
    defaultValue: 'other',
  },
  incidentDate: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  location: {
    type: DataTypes.STRING,
  },
  severity: {
    type: DataTypes.ENUM('low', 'medium', 'high', 'critical'),
    defaultValue: 'medium',
  },
  isAnonymous: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  status: {
    type: DataTypes.ENUM('submitted', 'acknowledged', 'investigating', 'resolved', 'closed'),
    defaultValue: 'submitted',
  },
  evidence: {
    type: DataTypes.JSON,
  },
  witnesses: {
    type: DataTypes.JSON,
  },
  resolutionNotes: {
    type: DataTypes.TEXT,
  },
  resolvedAt: {
    type: DataTypes.DATE,
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

module.exports = IncidentReport;
