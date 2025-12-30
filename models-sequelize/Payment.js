const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Payment = sequelize.define('Payment', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  jobId: {
    type: DataTypes.UUID,
    allowNull: true,
    field: 'job_id'
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: true,
    field: 'user_id'
  },
  amount: {
    type: DataTypes.DECIMAL(10,2),
    allowNull: false
  },
  currency: {
    type: DataTypes.STRING,
    defaultValue: 'usd'
  },
  provider: {
    type: DataTypes.STRING,
    defaultValue: 'stripe'
  },
  providerId: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'provider_id'
  },
  receiptEmail: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'receipt_email'
  },
  receiptSent: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'receipt_sent'
  },
  receiptSentAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'receipt_sent_at'
  },
  ownerNotified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'owner_notified'
  },
  ownerNotifiedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'owner_notified_at'
  }
}, {
  tableName: 'payments',
  timestamps: true
});

module.exports = Payment;