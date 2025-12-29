const express = require('express');
const Event = require('../models/Event');
const router = express.Router();

// Get all events
router.get('/', async (req, res) => {
  try {
    const { eventType, search } = req.query;
    let filter = { startDate: { $gte: new Date() } };

    if (eventType) filter.eventType = eventType;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const events = await Event.find(filter)
      .sort({ featured: -1, startDate: 1 })
      .limit(50);

    res.json(events);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching events', error: error.message });
  }
});

// Get event by ID
router.get('/:id', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    res.json(event);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching event', error: error.message });
  }
});

// Create event
router.post('/', async (req, res) => {
  try {
    const { title, description, eventType, startDate, endDate, location, venue, organizer, registrationLink, image } = req.body;

    const event = new Event({
      title,
      description,
      eventType,
      startDate,
      endDate,
      location,
      venue,
      organizer,
      registrationLink,
      image,
    });

    await event.save();
    res.status(201).json(event);
  } catch (error) {
    res.status(500).json({ message: 'Error creating event', error: error.message });
  }
});

// Register for event
router.post('/:id/register', async (req, res) => {
  try {
    const userId = req.headers['user-id'];
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    const alreadyRegistered = event.registrations.some((r) => r.userId.toString() === userId);
    if (alreadyRegistered) {
      return res.status(400).json({ message: 'Already registered for this event' });
    }

    event.registrations.push({ userId });
    await event.save();

    res.json({ message: 'Registered for event', event });
  } catch (error) {
    res.status(500).json({ message: 'Error registering for event', error: error.message });
  }
});

module.exports = router;
