const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
  },
  userType: {
    type: String,
    enum: ['job_seeker', 'pharmacy', 'admin'],
    required: true,
  },
  phone: String,
  profilePicture: String,
  bio: String,
  location: String,
  certifications: [String],
  resume: String,
  isVerified: {
    type: Boolean,
    default: false,
  },
  subscriptionStatus: {
    type: String,
    enum: ['free', 'premium', 'enterprise'],
    default: 'free',
  },
  subscriptionEndDate: Date,
  savedJobs: [mongoose.Schema.Types.ObjectId],
  appliedJobs: [mongoose.Schema.Types.ObjectId],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Hash password before saving
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Method to compare passwords
UserSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);
