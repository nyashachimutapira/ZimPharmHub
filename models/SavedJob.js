const mongoose = require('mongoose');

const SavedJobSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  jobId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true,
  },
  notes: String,
  emailReminderEnabled: {
    type: Boolean,
    default: false,
  },
  reminderFrequency: {
    type: String,
    enum: ['daily', 'weekly', 'once'],
    default: 'weekly',
  },
  lastReminderSent: Date,
  savedAt: {
    type: Date,
    default: Date.now,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Unique compound index to prevent duplicate saves
SavedJobSchema.index({ userId: 1, jobId: 1 }, { unique: true });

module.exports = mongoose.model('SavedJob', SavedJobSchema);
