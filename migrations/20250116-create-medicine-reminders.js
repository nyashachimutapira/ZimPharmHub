'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Create MedicineReminders table
    await queryInterface.createTable('MedicineReminders', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.UUIDV4,
      },
      userId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      medicineName: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      dosage: {
        type: Sequelize.STRING(100),
      },
      frequency: {
        type: Sequelize.ENUM('daily', 'twice-daily', 'three-times-daily', 'weekly', 'as-needed'),
        allowNull: false,
        defaultValue: 'daily',
      },
      startDate: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      endDate: {
        type: Sequelize.DATE,
      },
      refillDaysRemaining: {
        type: Sequelize.INTEGER,
      },
      refillThreshold: {
        type: Sequelize.INTEGER,
        defaultValue: 7,
      },
      preferredPharmacy: {
        type: Sequelize.UUID,
      },
      reminderTime: {
        type: Sequelize.STRING(5),
        defaultValue: '09:00',
      },
      notificationMethod: {
        type: Sequelize.ENUM('email', 'sms', 'push', 'all'),
        defaultValue: 'email',
      },
      lastRefillDate: {
        type: Sequelize.DATE,
      },
      nextRefillDate: {
        type: Sequelize.DATE,
      },
      status: {
        type: Sequelize.ENUM('active', 'paused', 'completed'),
        defaultValue: 'active',
      },
      notes: {
        type: Sequelize.TEXT,
      },
      createdAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
      updatedAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
    });

    // Create MedicineReminderLogs table
    await queryInterface.createTable('MedicineReminderLogs', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.UUIDV4,
      },
      reminderId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'MedicineReminders',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      sentAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
      method: {
        type: Sequelize.ENUM('email', 'sms', 'push', 'manual'),
        allowNull: false,
      },
      status: {
        type: Sequelize.ENUM('sent', 'failed', 'bounced'),
        defaultValue: 'sent',
      },
      refillOrdered: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      refillPharmacyId: {
        type: Sequelize.UUID,
      },
      createdAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
      updatedAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
    });

    // Create indexes
    await queryInterface.addIndex('MedicineReminders', ['userId']);
    await queryInterface.addIndex('MedicineReminders', ['status']);
    await queryInterface.addIndex('MedicineReminders', ['nextRefillDate']);
    await queryInterface.addIndex('MedicineReminderLogs', ['reminderId']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('MedicineReminderLogs');
    await queryInterface.dropTable('MedicineReminders');
  },
};
