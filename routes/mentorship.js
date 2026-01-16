const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const Mentorship = require('../models/Mentorship');
const { Op } = require('sequelize');

// Get available mentors
router.get('/mentors', async (req, res) => {
  try {
    const { search, limit = 20, offset = 0 } = req.query;
    const where = { status: 'available' };

    if (search) {
      where[Op.or] = [
        { title: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } },
      ];
    }

    const mentors = await Mentorship.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['rating', 'DESC']],
    });

    res.json({
      total: mentors.count,
      data: mentors.rows,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get mentorships for authenticated user
router.get('/my', authenticate, async (req, res) => {
  try {
    const mentorships = await Mentorship.findAll({
      where: {
        [Op.or]: [
          { mentorId: req.user.id },
          { menteeId: req.user.id },
        ],
      },
      order: [['createdAt', 'DESC']],
    });

    res.json(mentorships);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create new mentorship
router.post('/', authenticate, async (req, res) => {
  try {
    const {
      menteeId,
      title,
      description,
      focusAreas,
      duration,
      frequency,
      price,
      goals,
    } = req.body;

    const mentorship = await Mentorship.create({
      mentorId: req.user.id,
      menteeId,
      title,
      description,
      focusAreas,
      duration,
      frequency,
      price: price || 0,
      goals,
    });

    res.status(201).json(mentorship);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update mentorship
router.put('/:id', authenticate, async (req, res) => {
  try {
    const mentorship = await Mentorship.findByPk(req.params.id);
    if (!mentorship) {
      return res.status(404).json({ message: 'Mentorship not found' });
    }

    if (mentorship.mentorId !== req.user.id && mentorship.menteeId !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    Object.assign(mentorship, req.body);
    await mentorship.save();

    res.json(mentorship);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Add review to mentorship
router.post('/:id/review', authenticate, async (req, res) => {
  try {
    const { rating, review } = req.body;
    const mentorship = await Mentorship.findByPk(req.params.id);
    if (!mentorship) {
      return res.status(404).json({ message: 'Mentorship not found' });
    }

    if (mentorship.menteeId !== req.user.id) {
      return res.status(403).json({ message: 'Only mentee can review' });
    }

    mentorship.rating = rating;
    mentorship.review = review;
    await mentorship.save();

    res.json(mentorship);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
