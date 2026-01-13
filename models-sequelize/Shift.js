const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Shift = sequelize.define(
    'Shift',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      pharmacyId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      staffId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      shiftName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      date: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      startTime: {
        type: DataTypes.TIME,
        allowNull: false,
      },
      endTime: {
        type: DataTypes.TIME,
        allowNull: false,
      },
      shiftType: {
        type: DataTypes.ENUM('Morning', 'Afternoon', 'Evening', 'Night', 'Full Day'),
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM('Scheduled', 'Confirmed', 'Completed', 'Cancelled', 'No Show'),
        defaultValue: 'Scheduled',
      },
      notes: {
        type: DataTypes.TEXT,
      },
      createdAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      updatedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      tableName: 'shifts',
      timestamps: true,
    }
  );

  return Shift;
};
