const mongoose = require('mongoose');

const JobAlertSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  description: String,
  isActive: {
    type: Boolean,
    default: true,
  },
  // Search criteria
  positions: {
    type: [String],
    default: [],
  },
  locations: {
    type: [String],
    default: [],
  },
  salaryMin: Number,
  salaryMax: Number,
  employmentTypes: {
    type: [String],
    enum: ['Full-time', 'Part-time', 'Contract', 'Temporary'],
    default: [],
  },
  // Notification settings
  notificationMethod: {
    type: String,
    enum: ['email', 'sms', 'both'],
    default: 'email',
  },
  frequency: {
    type: String,
    enum: ['instant', 'daily', 'weekly'],
    default: 'daily',
  },
  // Daily/weekly digest settings
  digestDay: {
    type: String,
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
  },
  digestTime: {
    type: String,
    default: '09:00', // HH:mm format
  },
  // Tracking
  matchingJobs: [
    {
      jobId: mongoose.Schema.Types.ObjectId,
      matchedAt: {
        type: Date,
        default: Date.now,
      },
      notificationSent: {
        type: Boolean,
        default: false,
      },
      sentAt: Date,
    },
  ],
  lastDigestSent: Date,
  lastJobMatched: Date,
  totalMatches: {
    type: Number,
    default: 0,
  },
  totalNotificationsSent: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Unique index to prevent duplicate alert names per user
JobAlertSchema.index({ userId: 1, name: 1 }, { unique: true });

module.exports = mongoose.model('JobAlert', JobAlertSchema);
