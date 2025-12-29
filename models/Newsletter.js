const mongoose = require('mongoose');

const NewsletterSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  firstName: String,
  lastName: String,
  categories: {
    jobs: { type: Boolean, default: true },
    products: { type: Boolean, default: true },
    news: { type: Boolean, default: true },
    events: { type: Boolean, default: true },
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  unsubscribeToken: String,
  subscribedAt: {
    type: Date,
    default: Date.now,
  },
  lastEmailSent: Date,
});

module.exports = mongoose.model('Newsletter', NewsletterSchema);
