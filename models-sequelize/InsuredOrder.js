module.exports = (sequelize, DataTypes) => {
  const InsuredOrder = sequelize.define('InsuredOrder', {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    orderId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Orders',
        key: 'id',
      },
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id',
      },
    },
    insuranceId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'UserInsurances',
        key: 'id',
      },
    },
    totalAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    insuranceCoverage: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
    },
    userPayment: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    copayAmount: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
    },
    deductibleApplied: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
    },
    insuranceStatus: {
      type: DataTypes.ENUM('pending_approval', 'approved', 'rejected', 'partially_covered'),
      defaultValue: 'pending_approval',
    },
    approvalDate: {
      type: DataTypes.DATE,
    },
    notes: {
      type: DataTypes.TEXT,
    },
  }, {
    timestamps: true,
    tableName: 'InsuredOrders',
  });

  InsuredOrder.associate = (models) => {
    InsuredOrder.belongsTo(models.User, { foreignKey: 'userId', as: 'User' });
    InsuredOrder.belongsTo(models.UserInsurance, { foreignKey: 'insuranceId', as: 'Insurance' });
  };

  return InsuredOrder;
};
