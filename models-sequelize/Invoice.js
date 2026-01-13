const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Invoice = sequelize.define(
    'Invoice',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      orderIdId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      pharmacyId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      invoiceNumber: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      invoiceDate: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      dueDate: {
        type: DataTypes.DATE,
      },
      amount: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
      },
      tax: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0,
      },
      totalAmount: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
      },
      amountPaid: {
        type: DataTypes.DECIMAL(12, 2),
        defaultValue: 0,
      },
      status: {
        type: DataTypes.ENUM('Draft', 'Sent', 'Paid', 'Overdue', 'Cancelled'),
        defaultValue: 'Draft',
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
      tableName: 'invoices',
      timestamps: true,
    }
  );

  return Invoice;
};
