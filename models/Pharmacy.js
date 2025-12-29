const mongoose = require('mongoose');

const PharmacySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  registrationNumber: {
    type: String,
    unique: true,
  },
  phone: String,
  email: String,
  website: String,
  address: String,
  city: String,
  province: String,
  zipCode: String,
  operatingHours: {
    monday: { open: String, close: String },
    tuesday: { open: String, close: String },
    wednesday: { open: String, close: String },
    thursday: { open: String, close: String },
    friday: { open: String, close: String },
    saturday: { open: String, close: String },
    sunday: { open: String, close: String },
  },
  services: [String],
  logo: String,
  backgroundImage: String,
  description: String,
  licenses: [String],
  staff: [
    {
      name: String,
      position: String,
      qualifications: [String],
    },
  ],
  subscriptionPlan: {
    type: String,
    enum: ['free', 'premium', 'enterprise'],
    default: 'free',
  },
  subscriptionEndDate: Date,
  ratings: {
    type: Number,
    default: 0,
    min: 0,
    max: 5,
  },
  totalReviews: {
    type: Number,
    default: 0,
  },
  isVerified: {
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

module.exports = mongoose.model('Pharmacy', PharmacySchema);
