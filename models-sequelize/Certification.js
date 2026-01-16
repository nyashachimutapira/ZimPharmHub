module.exports = (sequelize, DataTypes) => {
  const Certification = sequelize.define('Certification', {
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
    certificationName: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: 'e.g., BPharm, MSc Clinical Pharmacy',
    },
    issuingBody: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: 'e.g., University of Zimbabwe, ZRPA',
    },
    dateObtained: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    expiryDate: {
      type: DataTypes.DATE,
    },
    certificateDocument: {
      type: DataTypes.STRING,
      comment: 'URL/Path to certificate file',
    },
    isVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    verificationDate: {
      type: DataTypes.DATE,
    },
    verificationNotes: {
      type: DataTypes.TEXT,
    },
  }, {
    timestamps: true,
    tableName: 'Certifications',
  });

  Certification.associate = (models) => {
    Certification.belongsTo(models.PharmacistProfile, {
      foreignKey: 'pharmacistProfileId',
      as: 'PharmacistProfile',
    });
  };

  return Certification;
};
