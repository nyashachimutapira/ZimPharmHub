const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const MentorshipMatch = sequelize.define('MentorshipMatch', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  mentorId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id',
    },
  },
  menteeId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id',
    },
  },
  status: {
    type: DataTypes.ENUM('pending', 'active', 'completed', 'rejected'),
    defaultValue: 'pending',
  },
  startDate: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  endDate: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  mentorshipGoals: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  frequency: {
    type: DataTypes.ENUM('weekly', 'bi-weekly', 'monthly'),
    defaultValue: 'monthly',
  },
  specializations: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: [],
  },
  sessionsCompleted: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  feedback: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  mentorRating: {
    type: DataTypes.DECIMAL(3, 2),
    validate: { min: 1, max: 5 },
    allowNull: true,
  },
  menteeRating: {
    type: DataTypes.DECIMAL(3, 2),
    validate: { min: 1, max: 5 },
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
  tableName: 'MentorshipMatches',
  timestamps: true,
});

module.exports = MentorshipMatch;
