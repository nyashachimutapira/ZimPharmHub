const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Job = sequelize.define('Job', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  position: {
    type: DataTypes.ENUM('Pharmacist', 'Dispensary Assistant', 'Pharmacy Manager', 'Other'),
    allowNull: false
  },
  salaryMin: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'salary_min'
  },
  salaryMax: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'salary_max'
  },
  salaryCurrency: {
    type: DataTypes.STRING,
    defaultValue: 'ZWL',
    field: 'salary_currency'
  },
  pharmacyId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    },
    field: 'pharmacy_id'
  },
  locationCity: {
    type: DataTypes.STRING,
    field: 'location_city'
  },
  locationProvince: {
    type: DataTypes.STRING,
    field: 'location_province'
  },
  locationAddress: {
    type: DataTypes.STRING,
    field: 'location_address'
  },
  requirements: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  responsibilities: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  employmentType: {
    type: DataTypes.ENUM('Full-time', 'Part-time', 'Contract', 'Temporary'),
    defaultValue: 'Full-time',
    field: 'employment_type'
  },
  applicationDeadline: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'application_deadline'
  },
  status: {
    type: DataTypes.ENUM('active', 'closed', 'filled'),
    defaultValue: 'active'
  },
  featured: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  featuredUntil: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'featured_until'
  },
  expiresAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'expires_at'
  },
  views: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
}, {
  tableName: 'jobs',
  timestamps: true
});

module.exports = Job;

