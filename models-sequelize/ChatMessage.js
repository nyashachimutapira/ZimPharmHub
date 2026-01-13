const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ChatMessage = sequelize.define('ChatMessage', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  senderId: {
    type: DataTypes.BIGINT,
    allowNull: false,
    index: true,
  },
  senderName: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  senderAvatar: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  recipientId: {
    type: DataTypes.BIGINT,
    allowNull: false,
    index: true,
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  messageType: {
    type: DataTypes.ENUM('text', 'file', 'image', 'link'),
    defaultValue: 'text',
  },
  attachmentUrl: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  attachmentType: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
  isRead: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    index: true,
  },
  readAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  isEdited: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  editedAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    index: true,
  },
}, {
  timestamps: false,
  tableName: 'chat_messages',
});

module.exports = ChatMessage;
