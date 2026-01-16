const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');

const PrescriptionOrder = sequelize.define('PrescriptionOrder', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: User,
      key: 'id',
    },
  },
  orderNumber: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  prescriptionFile: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  medications: {
    type: DataTypes.JSON,
    allowNull: false,
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  totalCost: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  currency: {
    type: DataTypes.STRING,
    defaultValue: 'ZWL',
  },
  status: {
    type: DataTypes.ENUM('submitted', 'verified', 'processing', 'ready_for_pickup', 'delivered', 'cancelled'),
    defaultValue: 'submitted',
  },
  deliveryAddress: {
    type: DataTypes.STRING,
  },
  deliveryDate: {
    type: DataTypes.DATE,
  },
  notes: {
    type: DataTypes.TEXT,
  },
  pharmacyVerifiedBy: {
    type: DataTypes.UUID,
    references: {
      model: User,
      key: 'id',
    },
  },
  verifiedAt: {
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

module.exports = PrescriptionOrder;
