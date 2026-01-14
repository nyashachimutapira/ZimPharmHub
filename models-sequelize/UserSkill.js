const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const UserSkill = sequelize.define(
    'UserSkill',
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
      skillName: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      proficiencyLevel: {
        type: DataTypes.ENUM('beginner', 'intermediate', 'advanced'),
        defaultValue: 'intermediate',
      },
      yearsOfExperience: {
        type: DataTypes.INTEGER,
        defaultValue: 1,
      },
      endorsements: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      verified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      category: {
        type: DataTypes.STRING(100),
        defaultValue: 'general',
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
      tableName: 'user_skills',
      timestamps: true,
    }
  );

  return UserSkill;
};
