module.exports = (sequelize, DataTypes) => {
  const PharmacistReview = sequelize.define('PharmacistReview', {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    pharmacistProfileId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'PharmacistProfiles',
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
    rating: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: { min: 1, max: 5 },
    },
    comment: {
      type: DataTypes.TEXT,
    },
    consultationDate: {
      type: DataTypes.DATE,
    },
    verifiedConsultation: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    helpful: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    notHelpful: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
  }, {
    timestamps: true,
    tableName: 'PharmacistReviews',
  });

  PharmacistReview.associate = (models) => {
    PharmacistReview.belongsTo(models.PharmacistProfile, {
      foreignKey: 'pharmacistProfileId',
      as: 'PharmacistProfile',
    });
    PharmacistReview.belongsTo(models.User, { foreignKey: 'userId', as: 'User' });
  };

  return PharmacistReview;
};
