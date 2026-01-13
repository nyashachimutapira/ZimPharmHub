'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Create PharmacyReviews table
    await queryInterface.createTable('PharmacyReviews', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      pharmacyId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'Pharmacies', key: 'id' },
        onDelete: 'CASCADE',
      },
      userId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'Users', key: 'id' },
        onDelete: 'CASCADE',
      },
      rating: {
        type: Sequelize.INTEGER,
        allowNull: false,
        validate: { min: 1, max: 5 },
      },
      title: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      comment: {
        type: Sequelize.TEXT,
      },
      verifiedPurchase: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      isPharmacist: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      helpfulCount: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      unhelpfulCount: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      approved: {
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

    // Create MentorshipMatches table
    await queryInterface.createTable('MentorshipMatches', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      mentorId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'Users', key: 'id' },
        onDelete: 'CASCADE',
      },
      menteeId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'Users', key: 'id' },
        onDelete: 'CASCADE',
      },
      status: {
        type: Sequelize.ENUM('pending', 'active', 'completed', 'rejected'),
        defaultValue: 'pending',
      },
      startDate: {
        type: Sequelize.DATE,
      },
      endDate: {
        type: Sequelize.DATE,
      },
      mentorshipGoals: {
        type: Sequelize.TEXT,
      },
      frequency: {
        type: Sequelize.ENUM('weekly', 'bi-weekly', 'monthly'),
        defaultValue: 'monthly',
      },
      specializations: {
        type: Sequelize.ARRAY(Sequelize.STRING),
        defaultValue: [],
      },
      sessionsCompleted: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      feedback: {
        type: Sequelize.TEXT,
      },
      mentorRating: {
        type: Sequelize.DECIMAL(3, 2),
      },
      menteeRating: {
        type: Sequelize.DECIMAL(3, 2),
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

    // Create CPDRecords table
    await queryInterface.createTable('CPDRecords', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      userId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'Users', key: 'id' },
        onDelete: 'CASCADE',
      },
      activityType: {
        type: Sequelize.ENUM(
          'workshop', 'seminar', 'conference', 'online_course',
          'publication', 'presentation', 'research', 'certification',
          'professional_meeting', 'mentoring'
        ),
        allowNull: false,
      },
      title: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      description: {
        type: Sequelize.TEXT,
      },
      provider: {
        type: Sequelize.STRING,
      },
      hoursEarned: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: false,
      },
      activityDate: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      completionCertificate: {
        type: Sequelize.STRING,
      },
      evidence: {
        type: Sequelize.TEXT,
      },
      category: {
        type: Sequelize.ENUM('mandatory', 'elective'),
        defaultValue: 'elective',
      },
      verified: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      verifiedBy: {
        type: Sequelize.UUID,
        references: { model: 'Users', key: 'id' },
      },
      verificationDate: {
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

    // Create JobAnalytics table
    await queryInterface.createTable('JobAnalytics', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      jobId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'Jobs', key: 'id' },
        onDelete: 'CASCADE',
      },
      employerId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'Users', key: 'id' },
      },
      views: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      clicks: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      applications: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      applicationRate: {
        type: Sequelize.DECIMAL(5, 2),
        defaultValue: 0,
      },
      conversions: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      conversionRate: {
        type: Sequelize.DECIMAL(5, 2),
        defaultValue: 0,
      },
      uniqueViewers: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      averageTimeSpent: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      lastViewed: {
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

    // Create RealtimeNotifications table
    await queryInterface.createTable('RealtimeNotifications', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      userId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'Users', key: 'id' },
        onDelete: 'CASCADE',
      },
      type: {
        type: Sequelize.ENUM(
          'job_alert', 'new_message', 'pharmacy_update',
          'mentorship_request', 'cpd_reminder', 'application_update',
          'review_posted', 'system_notification'
        ),
        allowNull: false,
      },
      title: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      message: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      category: {
        type: Sequelize.STRING,
      },
      priority: {
        type: Sequelize.ENUM('low', 'medium', 'high', 'urgent'),
        defaultValue: 'medium',
      },
      relatedId: {
        type: Sequelize.UUID,
      },
      relatedType: {
        type: Sequelize.STRING,
      },
      isRead: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      readAt: {
        type: Sequelize.DATE,
      },
      actionUrl: {
        type: Sequelize.STRING,
      },
      emailSent: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      emailSentAt: {
        type: Sequelize.DATE,
      },
      smsSent: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      smsSentAt: {
        type: Sequelize.DATE,
      },
      pushSent: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      pushSentAt: {
        type: Sequelize.DATE,
      },
      dismissed: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      dismissedAt: {
        type: Sequelize.DATE,
      },
      expiresAt: {
        type: Sequelize.DATE,
      },
      metadata: {
        type: Sequelize.JSON,
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

    // Create indexes for better query performance
    await queryInterface.addIndex('PharmacyReviews', ['pharmacyId']);
    await queryInterface.addIndex('PharmacyReviews', ['userId']);
    await queryInterface.addIndex('MentorshipMatches', ['mentorId']);
    await queryInterface.addIndex('MentorshipMatches', ['menteeId']);
    await queryInterface.addIndex('CPDRecords', ['userId']);
    await queryInterface.addIndex('CPDRecords', ['verified']);
    await queryInterface.addIndex('JobAnalytics', ['jobId']);
    await queryInterface.addIndex('JobAnalytics', ['employerId']);
    await queryInterface.addIndex('RealtimeNotifications', ['userId', 'isRead']);
    await queryInterface.addIndex('RealtimeNotifications', ['createdAt']);
    await queryInterface.addIndex('RealtimeNotifications', ['type']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('RealtimeNotifications');
    await queryInterface.dropTable('JobAnalytics');
    await queryInterface.dropTable('CPDRecords');
    await queryInterface.dropTable('MentorshipMatches');
    await queryInterface.dropTable('PharmacyReviews');
  },
};
