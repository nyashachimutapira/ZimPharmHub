const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Pharmacy = sequelize.define('Pharmacy', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  registrationNumber: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: true
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: true
  },
  email: {
    type: DataTypes.STRING,
    allowNull: true
  },
  website: {
    type: DataTypes.STRING,
    allowNull: true
  },
  address: {
    type: DataTypes.STRING,
    allowNull: true
  },
  city: {
    type: DataTypes.STRING,
    allowNull: true
  },
  province: {
    type: DataTypes.STRING,
    allowNull: true
  },
  zipCode: {
    type: DataTypes.STRING,
    allowNull: true
  },
  operatingHours: {
    type: DataTypes.JSON,
    defaultValue: {
      monday: { open: '', close: '' },
      tuesday: { open: '', close: '' },
      wednesday: { open: '', close: '' },
      thursday: { open: '', close: '' },
      friday: { open: '', close: '' },
      saturday: { open: '', close: '' },
      sunday: { open: '', close: '' }
    }
  },
  services: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  logo: {
    type: DataTypes.STRING,
    allowNull: true
  },
  backgroundImage: {
    type: DataTypes.STRING,
    allowNull: true
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  licenses: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  staff: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  subscriptionPlan: {
    type: DataTypes.ENUM('free', 'premium', 'enterprise'),
    defaultValue: 'free'
  },
  subscriptionEndDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  ratings: {
    type: DataTypes.FLOAT,
    defaultValue: 0,
    validate: {
      min: 0,
      max: 5
    }
  },
  totalReviews: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  isVerified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  tableName: 'pharmacies',
  timestamps: true
});

module.exports = Pharmacy;
