const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const Question = require('../models/Question');
const Answer = require('../models/Answer');
const { Op } = require('sequelize');

// Get all questions with filters
router.get('/questions', async (req, res) => {
  try {
    const { category, search, sort = 'recent', limit = 20, offset = 0 } = req.query;
    const where = {};

    if (category) where.category = category;
    if (search) {
      where[Op.or] = [
        { title: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } },
      ];
    }

    const order = sort === 'popular' ? [['upvotes', 'DESC']] : [['createdAt', 'DESC']];

    const questions = await Question.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order,
    });

    res.json({
      total: questions.count,
      data: questions.rows,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single question with answers
router.get('/questions/:id', async (req, res) => {
  try {
    const question = await Question.findByPk(req.params.id);
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    question.views += 1;
    await question.save();

    const answers = await Answer.findAll({
      where: { questionId: req.params.id },
      order: [['isAccepted', 'DESC'], ['upvotes', 'DESC']],
    });

    res.json({ question, answers });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Post new question
router.post('/questions', authenticate, async (req, res) => {
  try {
    const { title, description, category, tags } = req.body;

    const question = await Question.create({
      userId: req.user.id,
      title,
      description,
      category,
      tags: tags || [],
    });

    res.status(201).json(question);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Post answer to question
router.post('/questions/:questionId/answers', authenticate, async (req, res) => {
  try {
    const { content } = req.body;
    const question = await Question.findByPk(req.params.questionId);
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    const answer = await Answer.create({
      questionId: req.params.questionId,
      userId: req.user.id,
      content,
    });

    question.answersCount += 1;
    await question.save();

    res.status(201).json(answer);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Upvote question
router.post('/questions/:id/upvote', authenticate, async (req, res) => {
  try {
    const question = await Question.findByPk(req.params.id);
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    question.upvotes += 1;
    await question.save();

    res.json(question);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Mark answer as accepted
router.put('/answers/:id/accept', authenticate, async (req, res) => {
  try {
    const answer = await Answer.findByPk(req.params.id);
    if (!answer) {
      return res.status(404).json({ message: 'Answer not found' });
    }

    const question = await Question.findByPk(answer.questionId);
    if (question.userId !== req.user.id) {
      return res.status(403).json({ message: 'Only question author can accept answers' });
    }

    answer.isAccepted = true;
    answer.acceptedAt = new Date();
    await answer.save();

    question.isResolved = true;
    await question.save();

    res.json(answer);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
