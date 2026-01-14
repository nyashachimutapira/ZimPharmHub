const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const SalaryBenchmark = sequelize.define(
    'SalaryBenchmark',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      jobTitle: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      jobCategory: {
        type: DataTypes.STRING(100),
      },
      experience: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      location: {
        type: DataTypes.STRING(255),
        defaultValue: 'Zimbabwe',
      },
      currency: {
        type: DataTypes.STRING(10),
        defaultValue: 'ZWL',
      },
      avgSalary: {
        type: DataTypes.DECIMAL(12, 2),
        defaultValue: 0,
      },
      minSalary: {
        type: DataTypes.DECIMAL(12, 2),
        defaultValue: 0,
      },
      maxSalary: {
        type: DataTypes.DECIMAL(12, 2),
        defaultValue: 0,
      },
      dataYear: {
        type: DataTypes.INTEGER,
        defaultValue: new Date().getFullYear(),
      },
      sampleSize: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      employmentType: {
        type: DataTypes.STRING(50),
        defaultValue: 'full-time',
      },
      source: {
        type: DataTypes.STRING(100),
        defaultValue: 'ZimPharmHub',
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
      tableName: 'salary_benchmarks',
      timestamps: true,
    }
  );

  return SalaryBenchmark;
};
