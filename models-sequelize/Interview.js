const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Interview = sequelize.define('Interview', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  jobApplicationId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'job_applications',
      key: 'id'
    },
    field: 'job_application_id'
  },
  interviewerId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    },
    field: 'interviewer_id'
  },
  intervieweeId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    },
    field: 'interviewee_id'
  },
  scheduledAt: {
    type: DataTypes.DATE,
    allowNull: false,
    field: 'scheduled_at'
  },
  duration: {
    type: DataTypes.INTEGER, // minutes
    defaultValue: 30
  },
  platform: {
    type: DataTypes.ENUM('zoom', 'google_meet', 'teams'),
    defaultValue: 'zoom'
  },
  meetingUrl: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'meeting_url'
  },
  meetingId: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'meeting_id'
  },
  passcode: {
    type: DataTypes.STRING,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('scheduled', 'confirmed', 'completed', 'cancelled', 'no_show'),
    defaultValue: 'scheduled'
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  feedback: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  rating: {
    type: DataTypes.INTEGER, // 1-5 scale
    allowNull: true,
    validate: {
      min: 1,
      max: 5
    }
  }
}, {
  tableName: 'interviews',
  timestamps: true
});

module.exports = Interview;
