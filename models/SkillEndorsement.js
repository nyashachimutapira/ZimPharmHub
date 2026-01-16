const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');

const SkillEndorsement = sequelize.define('SkillEndorsement', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  skillOwnerId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: User,
      key: 'id',
    },
  },
  endorsedByUserId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: User,
      key: 'id',
    },
  },
  skillName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  skillCategory: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  endorsementText: {
    type: DataTypes.TEXT,
  },
  proficiencyLevel: {
    type: DataTypes.ENUM('beginner', 'intermediate', 'advanced', 'expert'),
  },
  status: {
    type: DataTypes.ENUM('pending', 'approved', 'rejected'),
    defaultValue: 'pending',
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

module.exports = SkillEndorsement;
