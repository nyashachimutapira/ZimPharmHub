module.exports = (sequelize, DataTypes) => {
  const LoyaltyCoupon = sequelize.define('LoyaltyCoupon', {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    programId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'LoyaltyPrograms',
        key: 'id',
      },
    },
    couponCode: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
    },
    discountPercent: {
      type: DataTypes.INTEGER,
      validate: { min: 0, max: 100 },
    },
    discountAmount: {
      type: DataTypes.DECIMAL(10, 2),
    },
    minPurchaseAmount: {
      type: DataTypes.DECIMAL(10, 2),
    },
    maxUsageCount: {
      type: DataTypes.INTEGER,
    },
    usageCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    expiryDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  }, {
    timestamps: true,
    tableName: 'LoyaltyCoupons',
  });

  LoyaltyCoupon.associate = (models) => {
    LoyaltyCoupon.belongsTo(models.LoyaltyProgram, { foreignKey: 'programId', as: 'Program' });
  };

  return LoyaltyCoupon;
};
