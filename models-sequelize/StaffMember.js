const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const StaffMember = sequelize.define(
    'StaffMember',
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
      userId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      firstName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      lastName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      phone: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      position: {
        type: DataTypes.ENUM('Pharmacist', 'Dispenser', 'Cashier', 'Manager', 'Assistant'),
        allowNull: false,
      },
      baseSalary: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      hireDate: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM('Active', 'Inactive', 'On Leave', 'Suspended'),
        defaultValue: 'Active',
      },
      bankAccount: {
        type: DataTypes.STRING,
      },
      bankName: {
        type: DataTypes.STRING,
      },
      taxId: {
        type: DataTypes.STRING,
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
      tableName: 'staff_members',
      timestamps: true,
    }
  );

  return StaffMember;
};
