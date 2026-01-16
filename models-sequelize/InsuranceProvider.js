module.exports = (sequelize, DataTypes) => {
  const InsuranceProvider = sequelize.define('InsuranceProvider', {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    providerName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    providerCode: {
      type: DataTypes.STRING,
      unique: true,
    },
    logo: {
      type: DataTypes.STRING,
    },
    contactPhone: {
      type: DataTypes.STRING,
    },
    contactEmail: {
      type: DataTypes.STRING,
    },
    websiteUrl: {
      type: DataTypes.STRING,
    },
    description: {
      type: DataTypes.TEXT,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  }, {
    timestamps: true,
    tableName: 'InsuranceProviders',
  });

  InsuranceProvider.associate = (models) => {
    InsuranceProvider.hasMany(models.UserInsurance, { foreignKey: 'providerId', as: 'UserPolicies' });
  };

  return InsuranceProvider;
};
