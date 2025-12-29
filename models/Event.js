const mongoose = require('mongoose');

const EventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: String,
  eventType: {
    type: String,
    enum: ['Workshop', 'Conference', 'Training', 'Webinar', 'Networking'],
    required: true,
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
  location: String,
  venue: String,
  organizer: String,
  registrationLink: String,
  image: String,
  tags: [String],
  capacity: Number,
  registrations: [
    {
      userId: mongoose.Schema.Types.ObjectId,
      registeredAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  featured: {
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

module.exports = mongoose.model('Event', EventSchema);
