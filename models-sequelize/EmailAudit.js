const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const EmailAudit = sequelize.define('EmailAudit', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  paymentId: {
    type: DataTypes.UUID,
    allowNull: true,
    field: 'payment_id'
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: true,
    field: 'user_id'
  },
  toEmail: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'to_email'
  },
  subject: {
    type: DataTypes.STRING,
    allowNull: true
  },
  provider: {
    type: DataTypes.STRING,
    defaultValue: 'smtp'
  },
  messageId: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'message_id'
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: 'pending'
  },
  rawResponse: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'raw_response'
  }
}, {
  tableName: 'email_audits',
  timestamps: true,
  createdAt: 'createdAt',
  updatedAt: false
});

module.exports = EmailAudit;