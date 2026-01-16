'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Create LoyaltyPrograms table
    await queryInterface.createTable('LoyaltyPrograms', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.UUIDV4,
      },
      pharmacyId: {
        type: Sequelize.UUID,
        allowNull: false,
      },
      programName: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      description: {
        type: Sequelize.TEXT,
      },
      pointsPerDollar: {
        type: Sequelize.DECIMAL(5, 2),
        defaultValue: 1.0,
      },
      redeemPointsValue: {
        type: Sequelize.DECIMAL(5, 2),
        defaultValue: 0.01,
      },
      minPointsToRedeem: {
        type: Sequelize.INTEGER,
        defaultValue: 100,
      },
      status: {
        type: Sequelize.ENUM('active', 'paused'),
        defaultValue: 'active',
      },
      totalMembers: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      totalPointsIssued: {
        type: Sequelize.BIGINT,
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

    // Create UserLoyaltyAccounts table
    await queryInterface.createTable('UserLoyaltyAccounts', {
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
      programId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'LoyaltyPrograms',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      points: {
        type: Sequelize.BIGINT,
        defaultValue: 0,
      },
      pointsRedeemed: {
        type: Sequelize.BIGINT,
        defaultValue: 0,
      },
      memberSince: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
      tier: {
        type: Sequelize.ENUM('bronze', 'silver', 'gold', 'platinum'),
        defaultValue: 'bronze',
      },
      lastActivityDate: {
        type: Sequelize.DATE,
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

    // Create LoyaltyTransactions table
    await queryInterface.createTable('LoyaltyTransactions', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.UUIDV4,
      },
      accountId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'UserLoyaltyAccounts',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      orderId: {
        type: Sequelize.UUID,
      },
      type: {
        type: Sequelize.ENUM('earn', 'redeem', 'bonus', 'expiry'),
        allowNull: false,
      },
      points: {
        type: Sequelize.BIGINT,
        allowNull: false,
      },
      description: {
        type: Sequelize.STRING(255),
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

    // Create LoyaltyCoupons table
    await queryInterface.createTable('LoyaltyCoupons', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.UUIDV4,
      },
      programId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'LoyaltyPrograms',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      couponCode: {
        type: Sequelize.STRING(50),
        unique: true,
        allowNull: false,
      },
      description: {
        type: Sequelize.TEXT,
      },
      discountPercent: {
        type: Sequelize.INTEGER,
        validate: { min: 0, max: 100 },
      },
      discountAmount: {
        type: Sequelize.DECIMAL(10, 2),
      },
      minPurchaseAmount: {
        type: Sequelize.DECIMAL(10, 2),
      },
      maxUsageCount: {
        type: Sequelize.INTEGER,
      },
      usageCount: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      expiryDate: {
        type: Sequelize.DATE,
        allowNull: false,
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

    // Create indexes
    await queryInterface.addIndex('LoyaltyPrograms', ['pharmacyId']);
    await queryInterface.addIndex('UserLoyaltyAccounts', ['userId']);
    await queryInterface.addIndex('UserLoyaltyAccounts', ['programId']);
    await queryInterface.addIndex('UserLoyaltyAccounts', ['tier']);
    await queryInterface.addIndex('LoyaltyTransactions', ['accountId']);
    await queryInterface.addIndex('LoyaltyTransactions', ['type']);
    await queryInterface.addIndex('LoyaltyCoupons', ['programId']);
    await queryInterface.addIndex('LoyaltyCoupons', ['couponCode']);
    await queryInterface.addIndex('LoyaltyCoupons', ['expiryDate']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('LoyaltyCoupons');
    await queryInterface.dropTable('LoyaltyTransactions');
    await queryInterface.dropTable('UserLoyaltyAccounts');
    await queryInterface.dropTable('LoyaltyPrograms');
  },
};
