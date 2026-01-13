const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Campaign = sequelize.define(
    'Campaign',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      pharmacyId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
      },
      campaignType: {
        type: DataTypes.ENUM('SMS', 'Email', 'Both'),
        allowNull: false,
      },
      subject: {
        type: DataTypes.STRING,
      },
      message: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      targetAudience: {
        type: DataTypes.ENUM('All Customers', 'Specific Group', 'Recent Buyers', 'Inactive Users'),
        defaultValue: 'All Customers',
      },
      scheduledDate: {
        type: DataTypes.DATE,
      },
      status: {
        type: DataTypes.ENUM('Draft', 'Scheduled', 'Sent', 'Failed'),
        defaultValue: 'Draft',
      },
      totalRecipients: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      sentCount: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      failedCount: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      openRate: {
        type: DataTypes.DECIMAL(5, 2),
      },
      clickRate: {
        type: DataTypes.DECIMAL(5, 2),
      },
      createdAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      updatedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      tableName: 'campaigns',
      timestamps: true,
    }
  );

  return Campaign;
};
