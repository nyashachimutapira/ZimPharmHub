const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const SupplierOrder = sequelize.define(
    'SupplierOrder',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      supplierId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      pharmacyId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      orderNumber: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      orderDate: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      expectedDeliveryDate: {
        type: DataTypes.DATE,
      },
      actualDeliveryDate: {
        type: DataTypes.DATE,
      },
      totalAmount: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM('Pending', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled'),
        defaultValue: 'Pending',
      },
      paymentStatus: {
        type: DataTypes.ENUM('Unpaid', 'Partial', 'Paid'),
        defaultValue: 'Unpaid',
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
      tableName: 'supplier_orders',
      timestamps: true,
    }
  );

  return SupplierOrder;
};
