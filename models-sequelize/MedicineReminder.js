module.exports = (sequelize, DataTypes) => {
  const MedicineReminder = sequelize.define('MedicineReminder', {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id',
      },
    },
    medicineName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    dosage: {
      type: DataTypes.STRING,
    },
    frequency: {
      type: DataTypes.ENUM('daily', 'twice-daily', 'three-times-daily', 'weekly', 'as-needed'),
      allowNull: false,
      defaultValue: 'daily',
    },
    startDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    endDate: {
      type: DataTypes.DATE,
    },
    refillDaysRemaining: {
      type: DataTypes.INTEGER,
    },
    refillThreshold: {
      type: DataTypes.INTEGER,
      defaultValue: 7,
      comment: 'Alert when X days of medicine left',
    },
    preferredPharmacy: {
      type: DataTypes.UUID,
      references: {
        model: 'Pharmacies',
        key: 'id',
      },
    },
    reminderTime: {
      type: DataTypes.STRING,
      defaultValue: '09:00',
      comment: 'HH:MM format',
    },
    notificationMethod: {
      type: DataTypes.ENUM('email', 'sms', 'push', 'all'),
      defaultValue: 'email',
    },
    lastRefillDate: {
      type: DataTypes.DATE,
    },
    nextRefillDate: {
      type: DataTypes.DATE,
    },
    status: {
      type: DataTypes.ENUM('active', 'paused', 'completed'),
      defaultValue: 'active',
    },
    notes: {
      type: DataTypes.TEXT,
    },
  }, {
    timestamps: true,
    tableName: 'MedicineReminders',
  });

  MedicineReminder.associate = (models) => {
    MedicineReminder.belongsTo(models.User, { foreignKey: 'userId', as: 'User' });
    MedicineReminder.hasMany(models.MedicineReminderLog, { foreignKey: 'reminderId', as: 'Logs' });
  };

  return MedicineReminder;
};
