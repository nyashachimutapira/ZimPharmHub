module.exports = (sequelize, DataTypes) => {
  const UserInsurance = sequelize.define('UserInsurance', {
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
    providerId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'InsuranceProviders',
        key: 'id',
      },
    },
    policyNumber: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    memberName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    dateOfBirth: {
      type: DataTypes.DATE,
    },
    membershipId: {
      type: DataTypes.STRING,
    },
    coverageType: {
      type: DataTypes.ENUM('individual', 'family'),
      defaultValue: 'individual',
    },
    expiryDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    documentProof: {
      type: DataTypes.STRING,
      comment: 'URL/Path to insurance document',
    },
    verificationStatus: {
      type: DataTypes.ENUM('pending', 'verified', 'rejected'),
      defaultValue: 'pending',
    },
    verificationDate: {
      type: DataTypes.DATE,
    },
    verificationNotes: {
      type: DataTypes.TEXT,
    },
  }, {
    timestamps: true,
    tableName: 'UserInsurances',
  });

  UserInsurance.associate = (models) => {
    UserInsurance.belongsTo(models.User, { foreignKey: 'userId', as: 'User' });
    UserInsurance.belongsTo(models.InsuranceProvider, { foreignKey: 'providerId', as: 'Provider' });
    UserInsurance.hasMany(models.InsuredOrder, { foreignKey: 'insuranceId', as: 'Orders' });
  };

  return UserInsurance;
};
