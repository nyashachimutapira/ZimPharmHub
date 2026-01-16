const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const RegulatoryUpdate = require('../models/RegulatoryUpdate');
const { Op } = require('sequelize');

// Get regulatory updates
router.get('/', async (req, res) => {
  try {
    const { category, priority, actionRequired, search, limit = 20, offset = 0 } = req.query;
    const where = {};

    if (category) where.category = category;
    if (priority) where.priority = priority;
    if (actionRequired === 'true') where.actionRequired = true;
    if (search) {
      where[Op.or] = [
        { title: { [Op.iLike]: `%${search}%` } },
        { content: { [Op.iLike]: `%${search}%` } },
      ];
    }

    const updates = await RegulatoryUpdate.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['priority', 'DESC'], ['effectiveDate', 'DESC']],
    });

    res.json({
      total: updates.count,
      data: updates.rows,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single update
router.get('/:id', async (req, res) => {
  try {
    const update = await RegulatoryUpdate.findByPk(req.params.id);
    if (!update) {
      return res.status(404).json({ message: 'Update not found' });
    }

    update.views += 1;
    await update.save();

    res.json(update);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Post new regulatory update (admin only)
router.post('/', authenticate, authorize(['admin']), async (req, res) => {
  try {
    const {
      title,
      content,
      category,
      effectiveDate,
      regulation,
      source,
      impact,
      actionRequired,
      deadline,
      relatedDocuments,
      tags,
      priority,
    } = req.body;

    const update = await RegulatoryUpdate.create({
      publisherId: req.user.id,
      title,
      content,
      category,
      effectiveDate,
      regulation,
      source,
      impact,
      actionRequired: actionRequired || false,
      deadline,
      relatedDocuments,
      tags: tags || [],
      priority: priority || 'medium',
    });

    res.status(201).json(update);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get upcoming deadline updates
router.get('/upcoming/deadlines', async (req, res) => {
  try {
    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    const updates = await RegulatoryUpdate.findAll({
      where: {
        actionRequired: true,
        deadline: {
          [Op.between]: [now, thirtyDaysFromNow],
        },
      },
      order: [['deadline', 'ASC']],
    });

    res.json(updates);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
