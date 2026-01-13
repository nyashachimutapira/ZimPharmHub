const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Payroll = sequelize.define(
    'Payroll',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      staffId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      pharmacyId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      payPeriodStart: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      payPeriodEnd: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      baseSalary: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      allowances: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0,
      },
      bonus: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0,
      },
      deductions: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0,
      },
      taxDeduction: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0,
      },
      netSalary: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM('Pending', 'Approved', 'Paid', 'Failed'),
        defaultValue: 'Pending',
      },
      paymentMethod: {
        type: DataTypes.ENUM('Bank Transfer', 'Cash', 'Check', 'Mobile Money'),
        allowNull: false,
      },
      paymentDate: {
        type: DataTypes.DATE,
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
      tableName: 'payroll',
      timestamps: true,
    }
  );

  return Payroll;
};
