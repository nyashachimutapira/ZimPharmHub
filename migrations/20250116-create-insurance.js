'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Create InsuranceProviders table
    await queryInterface.createTable('InsuranceProviders', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.UUIDV4,
      },
      providerName: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      providerCode: {
        type: Sequelize.STRING(50),
        unique: true,
      },
      logo: {
        type: Sequelize.STRING(500),
      },
      contactPhone: {
        type: Sequelize.STRING(20),
      },
      contactEmail: {
        type: Sequelize.STRING(255),
      },
      websiteUrl: {
        type: Sequelize.STRING(500),
      },
      description: {
        type: Sequelize.TEXT,
      },
      isActive: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
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

    // Create UserInsurances table
    await queryInterface.createTable('UserInsurances', {
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
      providerId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'InsuranceProviders',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      policyNumber: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      memberName: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      dateOfBirth: {
        type: Sequelize.DATE,
      },
      membershipId: {
        type: Sequelize.STRING(100),
      },
      coverageType: {
        type: Sequelize.ENUM('individual', 'family'),
        defaultValue: 'individual',
      },
      expiryDate: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      isActive: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
      documentProof: {
        type: Sequelize.STRING(500),
      },
      verificationStatus: {
        type: Sequelize.ENUM('pending', 'verified', 'rejected'),
        defaultValue: 'pending',
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

    // Create InsuredOrders table
    await queryInterface.createTable('InsuredOrders', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.UUIDV4,
      },
      orderId: {
        type: Sequelize.UUID,
        allowNull: false,
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
      insuranceId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'UserInsurances',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      totalAmount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },
      insuranceCoverage: {
        type: Sequelize.DECIMAL(10, 2),
        defaultValue: 0,
      },
      userPayment: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },
      copayAmount: {
        type: Sequelize.DECIMAL(10, 2),
        defaultValue: 0,
      },
      deductibleApplied: {
        type: Sequelize.DECIMAL(10, 2),
        defaultValue: 0,
      },
      insuranceStatus: {
        type: Sequelize.ENUM('pending_approval', 'approved', 'rejected', 'partially_covered'),
        defaultValue: 'pending_approval',
      },
      approvalDate: {
        type: Sequelize.DATE,
      },
      notes: {
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

    // Create indexes
    await queryInterface.addIndex('InsuranceProviders', ['isActive']);
    await queryInterface.addIndex('UserInsurances', ['userId']);
    await queryInterface.addIndex('UserInsurances', ['providerId']);
    await queryInterface.addIndex('UserInsurances', ['isActive']);
    await queryInterface.addIndex('UserInsurances', ['expiryDate']);
    await queryInterface.addIndex('InsuredOrders', ['userId']);
    await queryInterface.addIndex('InsuredOrders', ['insuranceId']);
    await queryInterface.addIndex('InsuredOrders', ['insuranceStatus']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('InsuredOrders');
    await queryInterface.dropTable('UserInsurances');
    await queryInterface.dropTable('InsuranceProviders');
  },
};
