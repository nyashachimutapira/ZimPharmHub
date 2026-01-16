module.exports = (sequelize, DataTypes) => {
  const MedicineReminderLog = sequelize.define('MedicineReminderLog', {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    reminderId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'MedicineReminders',
        key: 'id',
      },
    },
    sentAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    method: {
      type: DataTypes.ENUM('email', 'sms', 'push', 'manual'),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('sent', 'failed', 'bounced'),
      defaultValue: 'sent',
    },
    refillOrdered: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    refillPharmacyId: {
      type: DataTypes.UUID,
      references: {
        model: 'Pharmacies',
        key: 'id',
      },
    },
  }, {
    timestamps: true,
    tableName: 'MedicineReminderLogs',
  });

  MedicineReminderLog.associate = (models) => {
    MedicineReminderLog.belongsTo(models.MedicineReminder, { foreignKey: 'reminderId', as: 'Reminder' });
  };

  return MedicineReminderLog;
};
