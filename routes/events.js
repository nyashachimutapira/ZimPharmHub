const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const Event = require('../models/Event');
const { Op } = require('sequelize');

// Get all events with filters
router.get('/', async (req, res) => {
  try {
    const { category, city, eventType, status, search, limit = 20, offset = 0 } = req.query;
    const where = {};

    if (category) where.category = category;
    if (city) where.city = city;
    if (eventType) where.eventType = eventType;
    if (status) where.status = status;
    if (search) {
      where[Op.or] = [
        { title: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } },
      ];
    }

    const events = await Event.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['startDate', 'ASC']],
    });

    res.json({
      total: events.count,
      data: events.rows,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get event by ID
router.get('/:id', async (req, res) => {
  try {
    const event = await Event.findByPk(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    res.json(event);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create new event (authenticated)
router.post('/', authenticate, async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      startDate,
      endDate,
      location,
      city,
      province,
      eventType,
      capacity,
      price,
      agenda,
      speakers,
      imageUrl,
      registrationLink,
    } = req.body;

    const event = await Event.create({
      organizerId: req.user.id,
      title,
      description,
      category,
      startDate,
      endDate,
      location,
      city,
      province,
      eventType,
      capacity,
      price: price || 0,
      agenda,
      speakers,
      imageUrl,
      registrationLink,
    });

    res.status(201).json(event);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update event
router.put('/:id', authenticate, async (req, res) => {
  try {
    const event = await Event.findByPk(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    if (event.organizerId !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    Object.assign(event, req.body);
    await event.save();

    res.json(event);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Register for event
router.post('/:eventId/register', authenticate, async (req, res) => {
  try {
    const event = await Event.findByPk(req.params.eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    if (event.capacity && event.attendeesCount >= event.capacity) {
      return res.status(400).json({ message: 'Event is full' });
    }

    event.attendeesCount += 1;
    await event.save();

    res.json({ message: 'Registered successfully', event });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
