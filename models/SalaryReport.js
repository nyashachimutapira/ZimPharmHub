const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const SalaryReport = sequelize.define('SalaryReport', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  reportMonth: {
    type: DataTypes.DATE,
    allowNull: false,
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
  position: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  experience: {
    type: DataTypes.STRING,
  },
  averageSalary: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  minSalary: {
    type: DataTypes.DECIMAL(10, 2),
  },
  maxSalary: {
    type: DataTypes.DECIMAL(10, 2),
  },
  currency: {
    type: DataTypes.STRING,
    defaultValue: 'ZWL',
  },
  dataPoints: {
    type: DataTypes.INTEGER,
  },
  trend: {
    type: DataTypes.ENUM('increasing', 'stable', 'decreasing'),
  },
  percentChange: {
    type: DataTypes.FLOAT,
  },
  qualifications: {
    type: DataTypes.JSON,
  },
  skills: {
    type: DataTypes.JSON,
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

module.exports = SalaryReport;
