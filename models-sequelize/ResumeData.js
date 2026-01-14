const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const ResumeData = sequelize.define(
    'ResumeData',
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
      fullName: {
        type: DataTypes.STRING(255),
      },
      email: {
        type: DataTypes.STRING(255),
      },
      phone: {
        type: DataTypes.STRING(20),
      },
      summary: {
        type: DataTypes.TEXT,
      },
      experience: {
        type: DataTypes.JSON,
        defaultValue: [],
      },
      education: {
        type: DataTypes.JSON,
        defaultValue: [],
      },
      skills: {
        type: DataTypes.JSON,
        defaultValue: [],
      },
      certifications: {
        type: DataTypes.JSON,
        defaultValue: [],
      },
      languages: {
        type: DataTypes.JSON,
        defaultValue: [],
      },
      projects: {
        type: DataTypes.JSON,
        defaultValue: [],
      },
      jsonData: {
        type: DataTypes.JSON,
        defaultValue: {},
      },
      rawText: {
        type: DataTypes.TEXT,
      },
      fileUrl: {
        type: DataTypes.STRING(500),
      },
      fileName: {
        type: DataTypes.STRING(255),
      },
      fileType: {
        type: DataTypes.STRING(50),
      },
      parsedAt: {
        type: DataTypes.DATE,
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
      tableName: 'resume_data',
      timestamps: true,
    }
  );

  return ResumeData;
};
