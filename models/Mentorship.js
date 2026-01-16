const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');

const Mentorship = sequelize.define('Mentorship', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  mentorId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: User,
      key: 'id',
    },
  },
  menteeId: {
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
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  focusAreas: {
    type: DataTypes.JSON,
    allowNull: false,
  },
  duration: {
    type: DataTypes.STRING, // e.g., "3 months"
    allowNull: false,
  },
  frequency: {
    type: DataTypes.STRING, // e.g., "weekly"
    allowNull: false,
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
  },
  currency: {
    type: DataTypes.STRING,
    defaultValue: 'ZWL',
  },
  startDate: {
    type: DataTypes.DATE,
  },
  endDate: {
    type: DataTypes.DATE,
  },
  status: {
    type: DataTypes.ENUM('available', 'in_progress', 'completed', 'cancelled'),
    defaultValue: 'available',
  },
  goals: {
    type: DataTypes.TEXT,
  },
  rating: {
    type: DataTypes.FLOAT,
  },
  review: {
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

module.exports = Mentorship;
