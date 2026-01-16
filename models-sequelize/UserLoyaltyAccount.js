module.exports = (sequelize, DataTypes) => {
  const UserLoyaltyAccount = sequelize.define('UserLoyaltyAccount', {
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
    programId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'LoyaltyPrograms',
        key: 'id',
      },
    },
    points: {
      type: DataTypes.BIGINT,
      defaultValue: 0,
    },
    pointsRedeemed: {
      type: DataTypes.BIGINT,
      defaultValue: 0,
    },
    memberSince: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    tier: {
      type: DataTypes.ENUM('bronze', 'silver', 'gold', 'platinum'),
      defaultValue: 'bronze',
    },
    lastActivityDate: {
      type: DataTypes.DATE,
    },
  }, {
    timestamps: true,
    tableName: 'UserLoyaltyAccounts',
  });

  UserLoyaltyAccount.associate = (models) => {
    UserLoyaltyAccount.belongsTo(models.User, { foreignKey: 'userId', as: 'User' });
    UserLoyaltyAccount.belongsTo(models.LoyaltyProgram, { foreignKey: 'programId', as: 'Program' });
    UserLoyaltyAccount.hasMany(models.LoyaltyTransaction, { foreignKey: 'accountId', as: 'Transactions' });
  };

  return UserLoyaltyAccount;
};
