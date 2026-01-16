'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Create PharmacistProfiles table
    await queryInterface.createTable('PharmacistProfiles', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.UUIDV4,
      },
      userId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      pharmacyId: {
        type: Sequelize.UUID,
      },
      licenseNumber: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      licenseExpiry: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      specializations: {
        type: Sequelize.JSON,
        defaultValue: [],
      },
      yearsOfExperience: {
        type: Sequelize.INTEGER,
      },
      bio: {
        type: Sequelize.TEXT,
      },
      profileImage: {
        type: Sequelize.STRING(500),
      },
      isVerified: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      verificationDocument: {
        type: Sequelize.STRING(500),
      },
      verificationDate: {
        type: Sequelize.DATE,
      },
      languages: {
        type: Sequelize.JSON,
        defaultValue: ['English'],
      },
      consultationAvailable: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      consultationRate: {
        type: Sequelize.DECIMAL(10, 2),
      },
      avgRating: {
        type: Sequelize.DECIMAL(3, 2),
        defaultValue: 5.0,
      },
      totalReviews: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      createdAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
      updatedAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
    });

    // Create Certifications table
    await queryInterface.createTable('Certifications', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.UUIDV4,
      },
      pharmacistProfileId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'PharmacistProfiles',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      certificationName: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      issuingBody: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      dateObtained: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      expiryDate: {
        type: Sequelize.DATE,
      },
      certificateDocument: {
        type: Sequelize.STRING(500),
      },
      isVerified: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      verificationDate: {
        type: Sequelize.DATE,
      },
      verificationNotes: {
        type: Sequelize.TEXT,
      },
      createdAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
      updatedAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
    });

    // Create PharmacistReviews table
    await queryInterface.createTable('PharmacistReviews', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.UUIDV4,
      },
      pharmacistProfileId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'PharmacistProfiles',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      userId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      rating: {
        type: Sequelize.INTEGER,
        allowNull: false,
        validate: { min: 1, max: 5 },
      },
      comment: {
        type: Sequelize.TEXT,
      },
      consultationDate: {
        type: Sequelize.DATE,
      },
      verifiedConsultation: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      helpful: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      notHelpful: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      createdAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
      updatedAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
    });

    // Create indexes
    await queryInterface.addIndex('PharmacistProfiles', ['userId']);
    await queryInterface.addIndex('PharmacistProfiles', ['isVerified']);
    await queryInterface.addIndex('PharmacistProfiles', ['avgRating']);
    await queryInterface.addIndex('Certifications', ['pharmacistProfileId']);
    await queryInterface.addIndex('Certifications', ['isVerified']);
    await queryInterface.addIndex('PharmacistReviews', ['pharmacistProfileId']);
    await queryInterface.addIndex('PharmacistReviews', ['userId']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('PharmacistReviews');
    await queryInterface.dropTable('Certifications');
    await queryInterface.dropTable('PharmacistProfiles');
  },
};
