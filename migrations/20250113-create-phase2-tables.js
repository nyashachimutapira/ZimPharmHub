'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Create user_skills table
    await queryInterface.createTable('user_skills', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      userId: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      skillName: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      proficiencyLevel: {
        type: Sequelize.ENUM('beginner', 'intermediate', 'advanced'),
        defaultValue: 'intermediate',
      },
      yearsOfExperience: {
        type: Sequelize.INTEGER,
        defaultValue: 1,
      },
      endorsements: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      verified: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      category: {
        type: Sequelize.STRING(100),
        defaultValue: 'general',
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

    // Create resume_data table
    await queryInterface.createTable('resume_data', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      userId: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      fullName: {
        type: Sequelize.STRING(255),
      },
      email: {
        type: Sequelize.STRING(255),
      },
      phone: {
        type: Sequelize.STRING(20),
      },
      summary: {
        type: Sequelize.TEXT,
      },
      experience: {
        type: Sequelize.JSON,
        defaultValue: [],
      },
      education: {
        type: Sequelize.JSON,
        defaultValue: [],
      },
      skills: {
        type: Sequelize.JSON,
        defaultValue: [],
      },
      certifications: {
        type: Sequelize.JSON,
        defaultValue: [],
      },
      languages: {
        type: Sequelize.JSON,
        defaultValue: [],
      },
      projects: {
        type: Sequelize.JSON,
        defaultValue: [],
      },
      jsonData: {
        type: Sequelize.JSON,
        defaultValue: {},
      },
      rawText: {
        type: Sequelize.TEXT,
      },
      fileUrl: {
        type: Sequelize.STRING(500),
      },
      fileName: {
        type: Sequelize.STRING(255),
      },
      fileType: {
        type: Sequelize.STRING(50),
      },
      parsedAt: {
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

    // Create job_matches table
    await queryInterface.createTable('job_matches', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      userId: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      jobId: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: {
          model: 'jobs',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      matchScore: {
        type: Sequelize.FLOAT,
        defaultValue: 0,
      },
      skillMatch: {
        type: Sequelize.FLOAT,
        defaultValue: 0,
      },
      experienceMatch: {
        type: Sequelize.FLOAT,
        defaultValue: 0,
      },
      educationMatch: {
        type: Sequelize.FLOAT,
        defaultValue: 0,
      },
      matchedSkills: {
        type: Sequelize.JSON,
        defaultValue: [],
      },
      missingSkills: {
        type: Sequelize.JSON,
        defaultValue: [],
      },
      matchDetails: {
        type: Sequelize.JSON,
        defaultValue: {},
      },
      recommended: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      clicked: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      applied: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      saved: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
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

    // Create salary_benchmarks table
    await queryInterface.createTable('salary_benchmarks', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      jobTitle: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      jobCategory: {
        type: Sequelize.STRING(100),
      },
      experience: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      location: {
        type: Sequelize.STRING(255),
        defaultValue: 'Zimbabwe',
      },
      currency: {
        type: Sequelize.STRING(10),
        defaultValue: 'ZWL',
      },
      avgSalary: {
        type: Sequelize.DECIMAL(12, 2),
        defaultValue: 0,
      },
      minSalary: {
        type: Sequelize.DECIMAL(12, 2),
        defaultValue: 0,
      },
      maxSalary: {
        type: Sequelize.DECIMAL(12, 2),
        defaultValue: 0,
      },
      dataYear: {
        type: Sequelize.INTEGER,
        defaultValue: new Date().getFullYear(),
      },
      sampleSize: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      employmentType: {
        type: Sequelize.STRING(50),
        defaultValue: 'full-time',
      },
      source: {
        type: Sequelize.STRING(100),
        defaultValue: 'ZimPharmHub',
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

    // Create indexes for performance
    await queryInterface.addIndex('user_skills', ['userId']);
    await queryInterface.addIndex('user_skills', ['skillName']);
    await queryInterface.addIndex('resume_data', ['userId']);
    await queryInterface.addIndex('job_matches', ['userId']);
    await queryInterface.addIndex('job_matches', ['jobId']);
    await queryInterface.addIndex('job_matches', ['matchScore']);
    await queryInterface.addIndex('salary_benchmarks', ['jobTitle']);
    await queryInterface.addIndex('salary_benchmarks', ['jobCategory']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('salary_benchmarks');
    await queryInterface.dropTable('job_matches');
    await queryInterface.dropTable('resume_data');
    await queryInterface.dropTable('user_skills');
  },
};
