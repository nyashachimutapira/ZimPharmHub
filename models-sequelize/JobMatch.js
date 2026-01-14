const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const JobMatch = sequelize.define(
    'JobMatch',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      userId: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      jobId: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
          model: 'jobs',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      matchScore: {
        type: DataTypes.FLOAT,
        defaultValue: 0,
        validate: {
          min: 0,
          max: 100,
        },
      },
      skillMatch: {
        type: DataTypes.FLOAT,
        defaultValue: 0,
      },
      experienceMatch: {
        type: DataTypes.FLOAT,
        defaultValue: 0,
      },
      educationMatch: {
        type: DataTypes.FLOAT,
        defaultValue: 0,
      },
      matchedSkills: {
        type: DataTypes.JSON,
        defaultValue: [],
      },
      missingSkills: {
        type: DataTypes.JSON,
        defaultValue: [],
      },
      matchDetails: {
        type: DataTypes.JSON,
        defaultValue: {},
      },
      recommended: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      clicked: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      applied: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      saved: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
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
      tableName: 'job_matches',
      timestamps: true,
    }
  );

  return JobMatch;
};
