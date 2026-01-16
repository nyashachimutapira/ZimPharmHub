const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Pharmacy = require('./Pharmacy');
const Product = require('./Product');

const InventoryItem = sequelize.define('InventoryItem', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  pharmacyId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: Pharmacy,
      key: 'id',
    },
  },
  productId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: Product,
      key: 'id',
    },
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  reorderLevel: {
    type: DataTypes.INTEGER,
    defaultValue: 10,
  },
  unitPrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  retailPrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  batchNumber: {
    type: DataTypes.STRING,
  },
  expiryDate: {
    type: DataTypes.DATE,
  },
  supplier: {
    type: DataTypes.STRING,
  },
  lastRestockDate: {
    type: DataTypes.DATE,
  },
  status: {
    type: DataTypes.ENUM('in_stock', 'low_stock', 'out_of_stock'),
    defaultValue: 'in_stock',
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

module.exports = InventoryItem;
