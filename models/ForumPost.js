const mongoose = require('mongoose');

const ForumPostSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  category: {
    type: String,
    enum: ['General Discussion', 'Job Tips', 'Product Discussion', 'Practice Management', 'News'],
    default: 'General Discussion',
  },
  tags: [String],
  likes: [mongoose.Schema.Types.ObjectId],
  comments: [
    {
      author: mongoose.Schema.Types.ObjectId,
      content: String,
      likes: [mongoose.Schema.Types.ObjectId],
      createdAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  views: {
    type: Number,
    default: 0,
  },
  isPinned: {
    type: Boolean,
    default: false,
  },
  isFeatured: {
    type: Boolean,
    default: false,
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

module.exports = mongoose.model('ForumPost', ForumPostSchema);
