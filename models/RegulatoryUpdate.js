const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');

const RegulatoryUpdate = sequelize.define('RegulatoryUpdate', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  publisherId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: User,
      key: 'id',
    },
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  category: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  effectiveDate: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  regulation: {
    type: DataTypes.STRING,
  },
  source: {
    type: DataTypes.STRING,
  },
  impact: {
    type: DataTypes.TEXT,
  },
  actionRequired: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  deadline: {
    type: DataTypes.DATE,
  },
  relatedDocuments: {
    type: DataTypes.JSON,
  },
  tags: {
    type: DataTypes.JSON,
    defaultValue: [],
  },
  priority: {
    type: DataTypes.ENUM('low', 'medium', 'high', 'critical'),
    defaultValue: 'medium',
  },
  views: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
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

module.exports = RegulatoryUpdate;
