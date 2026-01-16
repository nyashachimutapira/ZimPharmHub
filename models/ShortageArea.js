const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ShortageArea = sequelize.define('ShortageArea', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  location: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  city: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  province: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  latitude: {
    type: DataTypes.FLOAT,
  },
  longitude: {
    type: DataTypes.FLOAT,
  },
  population: {
    type: DataTypes.INTEGER,
  },
  pharmaciesCount: {
    type: DataTypes.INTEGER,
  },
  shortageLevel: {
    type: DataTypes.ENUM('critical', 'high', 'moderate', 'low'),
    allowNull: false,
  },
  requiredPharmacies: {
    type: DataTypes.INTEGER,
  },
  pharmacistToPopulationRatio: {
    type: DataTypes.FLOAT,
  },
  averageTravelDistance: {
    type: DataTypes.FLOAT, // in km
  },
  accessIssues: {
    type: DataTypes.JSON,
  },
  opportunityScore: {
    type: DataTypes.FLOAT, // 1-10 scale
  },
  lastUpdated: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
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

module.exports = ShortageArea;
