const mongoose = require('mongoose');

const AdvertisementSchema = new mongoose.Schema({
  pharmacy: { type: mongoose.Schema.Types.ObjectId, ref: 'Pharmacy', required: true },
  title: { type: String, required: true },
  body: String,
  images: [String],
  link: String,
  type: { type: String, enum: ['pharmacy', 'product', 'general'], default: 'general' },
  isActive: { type: Boolean, default: true },
  featured: { type: Boolean, default: false },
  expiresAt: Date,
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Advertisement', AdvertisementSchema);
