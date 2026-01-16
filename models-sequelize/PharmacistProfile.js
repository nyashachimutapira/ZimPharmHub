module.exports = (sequelize, DataTypes) => {
  const PharmacistProfile = sequelize.define('PharmacistProfile', {
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
    pharmacyId: {
      type: DataTypes.UUID,
      references: {
        model: 'Pharmacies',
        key: 'id',
      },
    },
    licenseNumber: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    licenseExpiry: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    specializations: {
      type: DataTypes.JSON,
      defaultValue: [],
      comment: 'Array of specializations e.g., ["Clinical Pharmacy", "Oncology"]',
    },
    yearsOfExperience: {
      type: DataTypes.INTEGER,
    },
    bio: {
      type: DataTypes.TEXT,
    },
    profileImage: {
      type: DataTypes.STRING,
    },
    isVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    verificationDocument: {
      type: DataTypes.STRING,
    },
    verificationDate: {
      type: DataTypes.DATE,
    },
    languages: {
      type: DataTypes.JSON,
      defaultValue: ['English'],
      comment: 'Array of languages e.g., ["English", "Shona"]',
    },
    consultationAvailable: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    consultationRate: {
      type: DataTypes.DECIMAL(10, 2),
    },
    avgRating: {
      type: DataTypes.DECIMAL(3, 2),
      defaultValue: 5.0,
    },
    totalReviews: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
  }, {
    timestamps: true,
    tableName: 'PharmacistProfiles',
  });

  PharmacistProfile.associate = (models) => {
    PharmacistProfile.belongsTo(models.User, { foreignKey: 'userId', as: 'User' });
    PharmacistProfile.belongsTo(models.Pharmacy, { foreignKey: 'pharmacyId', as: 'Pharmacy' });
    PharmacistProfile.hasMany(models.Certification, { foreignKey: 'pharmacistProfileId', as: 'Certifications' });
    PharmacistProfile.hasMany(models.PharmacistReview, { foreignKey: 'pharmacistProfileId', as: 'Reviews' });
  };

  return PharmacistProfile;
};
