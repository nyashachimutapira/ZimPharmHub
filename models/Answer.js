const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');
const Question = require('./Question');

const Answer = sequelize.define('Answer', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  questionId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: Question,
      key: 'id',
    },
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: User,
      key: 'id',
    },
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  upvotes: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  downvotes: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  isAccepted: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  acceptedAt: {
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

module.exports = Answer;
