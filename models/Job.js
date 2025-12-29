const mongoose = require('mongoose');

const JobSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  position: {
    type: String,
    enum: ['Pharmacist', 'Dispensary Assistant', 'Pharmacy Manager', 'Other'],
    required: true,
  },
  salary: {
    min: Number,
    max: Number,
    currency: {
      type: String,
      default: 'ZWL',
    },
  },
  pharmacy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  location: {
    city: String,
    province: String,
    address: String,
  },
  requirements: [String],
  responsibilities: [String],
  employmentType: {
    type: String,
    enum: ['Full-time', 'Part-time', 'Contract', 'Temporary'],
    default: 'Full-time',
  },
  applicationDeadline: Date,
  applicants: [
    {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      appliedAt: {
        type: Date,
        default: Date.now,
      },
      status: {
        type: String,
        enum: ['pending', 'reviewing', 'shortlisted', 'interview', 'accepted', 'rejected'],
        default: 'pending',
      },
      notes: String,
      resume: String,
      coverLetter: String,
      updatedAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  status: {
    type: String,
    enum: ['active', 'closed', 'filled'],
    default: 'active',
  },
  featured: {
    type: Boolean,
    default: false,
  },
  featuredUntil: Date,
  views: {
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

module.exports = mongoose.model('Job', JobSchema);
