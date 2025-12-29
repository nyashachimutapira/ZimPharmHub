const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: String,
  category: {
    type: String,
    enum: ['Medications', 'Supplements', 'Medical Devices', 'Personal Care', 'OTC'],
    required: true,
  },
  pharmacy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Pharmacy',
    required: true,
  },
  price: {
    amount: Number,
    currency: {
      type: String,
      default: 'ZWL',
    },
  },
  stock: {
    type: Number,
    default: 0,
  },
  images: [String],
  manufacturer: String,
  dosage: String,
  sideEffects: String,
  warnings: String,
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5,
  },
  reviews: [
    {
      userId: mongoose.Schema.Types.ObjectId,
      rating: Number,
      comment: String,
      createdAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  available: {
    type: Boolean,
    default: true,
  },
  featured: Boolean,
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Product', ProductSchema);
