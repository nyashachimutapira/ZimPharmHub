'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.transaction(async (transaction) => {
      // Create activity_logs table
      await queryInterface.createTable('activity_logs', {
        id: {
          type: Sequelize.UUID,
          defaultValue: Sequelize.UUIDV4,
          primaryKey: true,
        },
        userId: {
          type: Sequelize.BIGINT,
          allowNull: false,
          index: true,
        },
        action: {
          type: Sequelize.STRING(100),
          allowNull: false,
        },
        targetUserId: {
          type: Sequelize.BIGINT,
          allowNull: true,
          index: true,
        },
        jobId: {
          type: Sequelize.BIGINT,
          allowNull: true,
          index: true,
        },
        jobTitle: {
          type: Sequelize.STRING(255),
          allowNull: true,
        },
        metadata: {
          type: Sequelize.JSON,
          allowNull: true,
        },
        createdAt: {
          type: Sequelize.DATE,
          defaultValue: Sequelize.NOW,
          index: true,
        },
      }, { transaction });

      // Create chat_messages table
      await queryInterface.createTable('chat_messages', {
        id: {
          type: Sequelize.UUID,
          defaultValue: Sequelize.UUIDV4,
          primaryKey: true,
        },
        senderId: {
          type: Sequelize.BIGINT,
          allowNull: false,
          index: true,
        },
        senderName: {
          type: Sequelize.STRING(255),
          allowNull: false,
        },
        senderAvatar: {
          type: Sequelize.STRING(255),
          allowNull: true,
        },
        recipientId: {
          type: Sequelize.BIGINT,
          allowNull: false,
          index: true,
        },
        message: {
          type: Sequelize.TEXT,
          allowNull: false,
        },
        messageType: {
          type: Sequelize.ENUM('text', 'file', 'image', 'link'),
          defaultValue: 'text',
        },
        attachmentUrl: {
          type: Sequelize.STRING(255),
          allowNull: true,
        },
        attachmentType: {
          type: Sequelize.STRING(50),
          allowNull: true,
        },
        isRead: {
          type: Sequelize.BOOLEAN,
          defaultValue: false,
          index: true,
        },
        readAt: {
          type: Sequelize.DATE,
          allowNull: true,
        },
        isEdited: {
          type: Sequelize.BOOLEAN,
          defaultValue: false,
        },
        editedAt: {
          type: Sequelize.DATE,
          allowNull: true,
        },
        createdAt: {
          type: Sequelize.DATE,
          defaultValue: Sequelize.NOW,
          index: true,
        },
      }, { transaction });

      // Create realtime_notifications table
      await queryInterface.createTable('realtime_notifications', {
        id: {
          type: Sequelize.UUID,
          defaultValue: Sequelize.UUIDV4,
          primaryKey: true,
        },
        userId: {
          type: Sequelize.BIGINT,
          allowNull: false,
          index: true,
        },
        type: {
          type: Sequelize.ENUM(
            'job_alert',
            'job_viewed',
            'message_received',
            'profile_viewed',
            'saved_job',
            'application_update',
            'recommendation',
            'achievement',
            'system_alert'
          ),
          allowNull: false,
        },
        title: {
          type: Sequelize.STRING(255),
          allowNull: false,
        },
        content: {
          type: Sequelize.TEXT,
          allowNull: true,
        },
        relatedUserId: {
          type: Sequelize.BIGINT,
          allowNull: true,
        },
        relatedJobId: {
          type: Sequelize.BIGINT,
          allowNull: true,
        },
        relatedId: {
          type: Sequelize.STRING(255),
          allowNull: true,
        },
        actionUrl: {
          type: Sequelize.STRING(255),
          allowNull: true,
        },
        actionLabel: {
          type: Sequelize.STRING(100),
          defaultValue: 'View',
        },
        icon: {
          type: Sequelize.STRING(50),
          allowNull: true,
        },
        isRead: {
          type: Sequelize.BOOLEAN,
          defaultValue: false,
          index: true,
        },
        readAt: {
          type: Sequelize.DATE,
          allowNull: true,
        },
        isDismissed: {
          type: Sequelize.BOOLEAN,
          defaultValue: false,
        },
        dismissedAt: {
          type: Sequelize.DATE,
          allowNull: true,
        },
        priority: {
          type: Sequelize.ENUM('low', 'normal', 'high', 'urgent'),
          defaultValue: 'normal',
        },
        createdAt: {
          type: Sequelize.DATE,
          defaultValue: Sequelize.NOW,
          index: true,
        },
        expiresAt: {
          type: Sequelize.DATE,
          allowNull: true,
        },
      }, { transaction });

      console.log('✅ Realtime tables created successfully');
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.dropTable('realtime_notifications', { transaction });
      await queryInterface.dropTable('chat_messages', { transaction });
      await queryInterface.dropTable('activity_logs', { transaction });
      console.log('✅ Realtime tables dropped successfully');
    });
  },
};
