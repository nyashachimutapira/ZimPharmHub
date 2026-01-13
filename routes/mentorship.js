const express = require('express');
const router = express.Router();
const { body, validationResult, param, query } = require('express-validator');
const auth = require('../middleware/auth');
const MentorshipMatch = require('../models/MentorshipMatch');
const User = require('../models-sequelize/User');
const RealtimeNotification = require('../models/RealtimeNotification');

// Get available mentors
router.get('/mentors', auth, [
  query('specialization').optional().trim(),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { specialization, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    let where = { userType: 'pharmacist', isMentor: true };
    if (specialization) {
      where.specializations = { [require('sequelize').Op.contains]: [specialization] };
    }

    const mentors = await User.findAndCountAll({
      where,
      attributes: ['id', 'firstName', 'lastName', 'profilePicture', 'bio', 'specializations', 'yearsOfExperience'],
      limit: parseInt(limit),
      offset,
    });

    return res.json({
      success: true,
      data: mentors.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: mentors.count,
        pages: Math.ceil(mentors.count / limit),
      },
    });
  } catch (err) {
    console.error('Error fetching mentors:', err);
    return res.status(500).json({ error: 'Failed to fetch mentors' });
  }
});

// Request mentorship
router.post('/request', auth, [
  body('mentorId').isUUID(),
  body('goals').trim().notEmpty().withMessage('Goals are required'),
  body('frequency').isIn(['weekly', 'bi-weekly', 'monthly']),
  body('specializations').optional().isArray(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { mentorId, goals, frequency, specializations } = req.body;

    // Check if mentor exists
    const mentor = await User.findByPk(mentorId);
    if (!mentor) return res.status(404).json({ error: 'Mentor not found' });

    // Check if already matched
    const existing = await MentorshipMatch.findOne({
      where: {
        mentorId,
        menteeId: req.user.id,
        status: ['pending', 'active'],
      },
    });
    if (existing) {
      return res.status(400).json({ error: 'You already have a mentorship request with this mentor' });
    }

    const match = await MentorshipMatch.create({
      mentorId,
      menteeId: req.user.id,
      mentorshipGoals: goals,
      frequency,
      specializations: specializations || [],
      status: 'pending',
    });

    // Send notification to mentor
    await RealtimeNotification.create({
      userId: mentorId,
      type: 'mentorship_request',
      title: 'New Mentorship Request',
      message: `${req.user.firstName} ${req.user.lastName} has requested to be your mentee`,
      relatedId: match.id,
      relatedType: 'mentorship',
      priority: 'high',
    });

    return res.status(201).json({
      success: true,
      data: match,
      message: 'Mentorship request sent',
    });
  } catch (err) {
    console.error('Error requesting mentorship:', err);
    return res.status(500).json({ error: 'Failed to send mentorship request' });
  }
});

// Get my mentorship matches
router.get('/my-matches', auth, async (req, res) => {
  try {
    const { role = 'mentee' } = req.query; // mentee or mentor

    let where = {};
    if (role === 'mentee') {
      where.menteeId = req.user.id;
    } else if (role === 'mentor') {
      where.mentorId = req.user.id;
    }

    const matches = await MentorshipMatch.findAll({
      where,
      include: [
        {
          association: role === 'mentee' ? 'mentor' : 'mentee',
          attributes: ['id', 'firstName', 'lastName', 'profilePicture', 'bio'],
        },
      ],
      order: [['createdAt', 'DESC']],
    });

    return res.json({
      success: true,
      data: matches,
    });
  } catch (err) {
    console.error('Error fetching mentorship matches:', err);
    return res.status(500).json({ error: 'Failed to fetch matches' });
  }
});

// Approve/reject mentorship request (mentor only)
router.patch('/:matchId/respond', auth, [
  param('matchId').isUUID(),
  body('approved').isBoolean(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { matchId } = req.params;
    const { approved } = req.body;

    const match = await MentorshipMatch.findByPk(matchId);
    if (!match) return res.status(404).json({ error: 'Mentorship match not found' });

    if (match.mentorId !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    await match.update({
      status: approved ? 'active' : 'rejected',
      startDate: approved ? new Date() : null,
    });

    // Notify mentee
    await RealtimeNotification.create({
      userId: match.menteeId,
      type: 'mentorship_request',
      title: approved ? 'Mentorship Request Accepted' : 'Mentorship Request Declined',
      message: approved 
        ? 'Your mentorship request has been accepted!' 
        : 'Your mentorship request has been declined',
      relatedId: match.id,
      relatedType: 'mentorship',
    });

    return res.json({
      success: true,
      data: match,
      message: `Mentorship request ${approved ? 'accepted' : 'rejected'}`,
    });
  } catch (err) {
    console.error('Error responding to mentorship request:', err);
    return res.status(500).json({ error: 'Failed to respond to request' });
  }
});

// Complete mentorship session
router.post('/:matchId/session', auth, [
  param('matchId').isUUID(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { matchId } = req.params;
    const match = await MentorshipMatch.findByPk(matchId);

    if (!match) return res.status(404).json({ error: 'Mentorship match not found' });
    if (match.mentorId !== req.user.id && match.menteeId !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    await match.increment('sessionsCompleted');

    return res.json({
      success: true,
      data: match,
      message: 'Session completed',
    });
  } catch (err) {
    console.error('Error completing session:', err);
    return res.status(500).json({ error: 'Failed to complete session' });
  }
});

// Rate mentorship
router.patch('/:matchId/rate', auth, [
  param('matchId').isUUID(),
  body('rating').isDecimal({ decimal_digits: '1,2' }).custom(v => v >= 1 && v <= 5),
  body('feedback').optional().trim(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { matchId } = req.params;
    const { rating, feedback } = req.body;

    const match = await MentorshipMatch.findByPk(matchId);
    if (!match) return res.status(404).json({ error: 'Mentorship match not found' });

    if (match.mentorId === req.user.id) {
      await match.update({ menteeRating: rating, feedback });
    } else if (match.menteeId === req.user.id) {
      await match.update({ mentorRating: rating, feedback });
    } else {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    return res.json({
      success: true,
      data: match,
      message: 'Rating submitted',
    });
  } catch (err) {
    console.error('Error rating mentorship:', err);
    return res.status(500).json({ error: 'Failed to submit rating' });
  }
});

// End mentorship
router.patch('/:matchId/end', auth, [
  param('matchId').isUUID(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { matchId } = req.params;
    const match = await MentorshipMatch.findByPk(matchId);

    if (!match) return res.status(404).json({ error: 'Mentorship match not found' });
    if (match.mentorId !== req.user.id && match.menteeId !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    await match.update({
      status: 'completed',
      endDate: new Date(),
    });

    return res.json({
      success: true,
      data: match,
      message: 'Mentorship ended',
    });
  } catch (err) {
    console.error('Error ending mentorship:', err);
    return res.status(500).json({ error: 'Failed to end mentorship' });
  }
});

module.exports = router;
