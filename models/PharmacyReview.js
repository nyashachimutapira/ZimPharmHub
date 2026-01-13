const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const PharmacyReview = sequelize.define('PharmacyReview', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  pharmacyId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Pharmacies',
      key: 'id',
    },
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id',
    },
  },
  rating: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: { min: 1, max: 5 },
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  comment: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  verifiedPurchase: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  isPharmacist: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  helpfulCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  unhelpfulCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  approved: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
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
  tableName: 'PharmacyReviews',
  timestamps: true,
});

module.exports = PharmacyReview;
