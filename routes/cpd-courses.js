const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const CPDCourse = require('../models/CPDCourse');
const { Op } = require('sequelize');

// Get all CPD courses
router.get('/', async (req, res) => {
  try {
    const { category, level, status, search, limit = 20, offset = 0 } = req.query;
    const where = {};

    if (category) where.category = category;
    if (level) where.level = level;
    if (status) where.status = status;
    if (search) {
      where[Op.or] = [
        { title: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } },
      ];
    }

    const courses = await CPDCourse.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['startDate', 'ASC']],
    });

    res.json({
      total: courses.count,
      data: courses.rows,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get CPD course by ID
router.get('/:id', async (req, res) => {
  try {
    const course = await CPDCourse.findByPk(req.params.id);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    res.json(course);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create new CPD course (authenticated)
router.post('/', authenticate, async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      syllabus,
      courseContent,
      startDate,
      endDate,
      duration,
      maxParticipants,
      price,
      cpdPoints,
      level,
      imageUrl,
    } = req.body;

    const course = await CPDCourse.create({
      instructorId: req.user.id,
      title,
      description,
      category,
      syllabus,
      courseContent,
      startDate,
      endDate,
      duration,
      maxParticipants,
      price,
      cpdPoints,
      level,
      imageUrl,
    });

    res.status(201).json(course);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update CPD course
router.put('/:id', authenticate, async (req, res) => {
  try {
    const course = await CPDCourse.findByPk(req.params.id);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    if (course.instructorId !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    Object.assign(course, req.body);
    await course.save();

    res.json(course);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Enroll in course
router.post('/:courseId/enroll', authenticate, async (req, res) => {
  try {
    const course = await CPDCourse.findByPk(req.params.courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    if (course.maxParticipants && course.enrolledCount >= course.maxParticipants) {
      return res.status(400).json({ message: 'Course is full' });
    }

    course.enrolledCount += 1;
    await course.save();

    res.json({ message: 'Enrolled successfully', course });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
