module.exports = (sequelize, DataTypes) => {
  const LoyaltyProgram = sequelize.define('LoyaltyProgram', {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    pharmacyId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Pharmacies',
        key: 'id',
      },
    },
    programName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
    },
    pointsPerDollar: {
      type: DataTypes.DECIMAL(5, 2),
      defaultValue: 1.0,
    },
    redeemPointsValue: {
      type: DataTypes.DECIMAL(5, 2),
      defaultValue: 0.01,
      comment: '100 points = $1',
    },
    minPointsToRedeem: {
      type: DataTypes.INTEGER,
      defaultValue: 100,
    },
    status: {
      type: DataTypes.ENUM('active', 'paused'),
      defaultValue: 'active',
    },
    totalMembers: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    totalPointsIssued: {
      type: DataTypes.BIGINT,
      defaultValue: 0,
    },
  }, {
    timestamps: true,
    tableName: 'LoyaltyPrograms',
  });

  LoyaltyProgram.associate = (models) => {
    LoyaltyProgram.belongsTo(models.Pharmacy, { foreignKey: 'pharmacyId', as: 'Pharmacy' });
    LoyaltyProgram.hasMany(models.UserLoyaltyAccount, { foreignKey: 'programId', as: 'Accounts' });
    LoyaltyProgram.hasMany(models.LoyaltyCoupon, { foreignKey: 'programId', as: 'Coupons' });
  };

  return LoyaltyProgram;
};
