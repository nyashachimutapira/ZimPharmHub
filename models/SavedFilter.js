const mongoose = require('mongoose');

const SavedFilterSchema = new mongoose.Schema({
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
  isDefault: {
    type: Boolean,
    default: false,
  },
  // Filter criteria
  positions: [String],
  locations: [String],
  salaryMin: Number,
  salaryMax: Number,
  employmentTypes: [String],
  experience: {
    type: String,
    enum: ['0-1 years', '1-3 years', '3-5 years', '5+ years', 'Any'],
    default: 'Any',
  },
  // Sort options
  sortBy: {
    type: String,
    enum: ['relevance', 'date', 'salary'],
    default: 'relevance',
  },
  sortOrder: {
    type: String,
    enum: ['asc', 'desc'],
    default: 'desc',
  },
  // Tags/keywords
  keywords: [String],
  
  // Usage tracking
  usageCount: {
    type: Number,
    default: 0,
  },
  lastUsed: Date,
  
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Unique index to prevent duplicate filter names per user
SavedFilterSchema.index({ userId: 1, name: 1 }, { unique: true });

module.exports = mongoose.model('SavedFilter', SavedFilterSchema);
