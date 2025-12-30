const mongoose = require('mongoose');

const ApplicationSchema = new mongoose.Schema({
  jobId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  pharmacyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'reviewing', 'shortlisted', 'interview', 'accepted', 'rejected'],
    default: 'pending',
  },
  resume: String,
  coverLetter: String,
  appliedAt: {
    type: Date,
    default: Date.now,
  },
  timeline: [
    {
      status: {
        type: String,
        enum: ['pending', 'reviewing', 'shortlisted', 'interview', 'accepted', 'rejected'],
      },
      timestamp: {
        type: Date,
        default: Date.now,
      },
      message: String,
      updatedBy: mongoose.Schema.Types.ObjectId,
    },
  ],
  interviewDate: Date,
  interviewTime: String,
  interviewLocation: String,
  interviewNotes: String,
  rejectionReason: String,
  salary: Number,
  startDate: Date,
  rating: Number,
  feedback: String,
  attachments: [String],
  isNotified: {
    type: Boolean,
    default: false,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Add index for faster queries
ApplicationSchema.index({ userId: 1, createdAt: -1 });
ApplicationSchema.index({ jobId: 1 });
ApplicationSchema.index({ status: 1 });

module.exports = mongoose.model('Application', ApplicationSchema);
