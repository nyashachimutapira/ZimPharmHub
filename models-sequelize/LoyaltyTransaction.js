module.exports = (sequelize, DataTypes) => {
  const LoyaltyTransaction = sequelize.define('LoyaltyTransaction', {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    accountId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'UserLoyaltyAccounts',
        key: 'id',
      },
    },
    orderId: {
      type: DataTypes.UUID,
      references: {
        model: 'Orders',
        key: 'id',
      },
    },
    type: {
      type: DataTypes.ENUM('earn', 'redeem', 'bonus', 'expiry'),
      allowNull: false,
    },
    points: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING,
    },
  }, {
    timestamps: true,
    tableName: 'LoyaltyTransactions',
  });

  LoyaltyTransaction.associate = (models) => {
    LoyaltyTransaction.belongsTo(models.UserLoyaltyAccount, { foreignKey: 'accountId', as: 'Account' });
  };

  return LoyaltyTransaction;
};
